import { daysBetween, esc, formatDate, today } from './utils.js';

const STALE_PENDING_DAYS = 4;
const STALE_TOUCH_DAYS = 10;

function analyze(entries) {
  const t = today();
  const result = {
    overdue: [],
    dueSoon: [],
    stalePending: [],
    staleTouch: [],
    active: 0,
    offers: 0,
  };

  entries.forEach((e) => {
    const live = e.status !== 'rejected' && e.status !== 'offer';
    if (live) result.active++;
    if (e.status === 'offer') result.offers++;

    if (e.deadline) {
      const dl = new Date(e.deadline);
      dl.setHours(0, 0, 0, 0);
      const diff = daysBetween(dl, t);
      if (live && diff < 0) result.overdue.push({ e, diff });
      else if (live && diff >= 0 && diff <= 3) result.dueSoon.push({ e, diff });
    }

    if (e.status === 'pending' && e.createdAt) {
      const age = daysBetween(t, new Date(e.createdAt));
      if (age >= STALE_PENDING_DAYS) result.stalePending.push({ e, age });
    }

    if (live && e.updatedAt) {
      const since = daysBetween(t, new Date(e.updatedAt));
      if (since >= STALE_TOUCH_DAYS) result.staleTouch.push({ e, since });
    }
  });

  result.overdue.sort((a, b) => a.diff - b.diff);
  result.dueSoon.sort((a, b) => a.diff - b.diff);
  return result;
}

function buildBriefing(result, entries) {
  const total = entries.length;
  if (total === 0)
    return "No applications yet. Add your first entry and I'll start tracking deadlines and nudging you on what to do next.";

  const parts = [];
  parts.push(`You're tracking <b>${total}</b> applications — <b>${result.active}</b> still active`);
  if (result.offers) parts.push(`, <b>${result.offers}</b> offer${result.offers > 1 ? 's' : ''} 🎉`);
  parts.push('.');

  if (result.overdue.length)
    parts.push(` <b style="color:var(--red)">${result.overdue.length} overdue</b> — handle these first.`);
  else if (result.dueSoon.length) parts.push(` ${result.dueSoon.length} due in the next 3 days.`);
  else parts.push(' Nothing urgent right now — good time to find new openings.');

  return parts.join('');
}

function acCard(e, tagClass, tagText, sub) {
  return `<div class="assist-card" onclick="window.openEntryModal('${e.id}');window.closeAssistant()">
    <span class="ac-co">${esc(e.company)}</span>
    <span class="ac-tag ${tagClass}">${tagText}</span>
    <div class="ac-sub">${esc(e.role)}${sub ? ' • ' + sub : ''}</div>
  </div>`;
}

export function renderAssistant(entries) {
  const result = analyze(entries);
  let html = `<div class="assist-summary">${buildBriefing(result, entries)}</div>`;

  // To-do action list
  html += `<div class="assist-section"><h3>🎯 Do this next</h3>`;
  const todos = [];

  result.overdue.forEach(({ e, diff }) =>
    todos.push(
      acCard(e, 'ac-red', `${Math.abs(diff)}d overdue`, 'Deadline passed — apply now or mark rejected')
    )
  );
  result.dueSoon.forEach(({ e, diff }) =>
    todos.push(
      acCard(
        e,
        'ac-amber',
        diff === 0 ? 'Today!' : `${diff}d left`,
        e.status === 'pending' ? 'Apply before deadline' : 'Prep / submit'
      )
    )
  );
  result.stalePending.forEach(({ e, age }) =>
    todos.push(acCard(e, 'ac-blue', 'sitting ' + age + 'd', 'Pending too long — apply or drop it'))
  );

  if (todos.length) html += todos.join('');
  else html += `<div class="assist-empty">✅ All caught up. Nothing demands action today.</div>`;
  html += `</div>`;

  // Going stale
  if (result.staleTouch.length) {
    html += `<div class="assist-section"><h3>💤 Haven't touched in a while</h3>`;
    html += result.staleTouch.map(({ e, since }) => acCard(e, 'ac-blue', since + 'd ago', 'Follow up or update the status')).join('');
    html += `</div>`;
  }

  // Coming up
  if (result.dueSoon.length) {
    html += `<div class="assist-section"><h3>📅 Upcoming deadlines</h3>`;
    html += result.dueSoon
      .map(({ e, diff }) => acCard(e, 'ac-amber', diff === 0 ? 'Today' : diff + 'd', formatDate(new Date(e.deadline))))
      .join('');
    html += `</div>`;
  }

  document.getElementById('assistBody').innerHTML = html;
}

export function checkUrgentOnLoad(entries) {
  const result = analyze(entries);
  if (!result.overdue.length && !result.dueSoon.length) return;

  let msg = '';
  if (result.overdue.length) {
    msg = `<b>${result.overdue.length} application${result.overdue.length > 1 ? 's are' : ' is'} overdue</b> — ${esc(
      result.overdue
        .map((x) => x.e.company)
        .slice(0, 3)
        .join(', ')
    )}${result.overdue.length > 3 ? '…' : ''}. `;
  }

  const todayDue = result.dueSoon.filter((x) => x.diff === 0);
  if (todayDue.length) msg += `<b>${todayDue.length} due today!</b> `;
  else if (result.dueSoon.length) msg += `${result.dueSoon.length} deadline${result.dueSoon.length > 1 ? 's' : ''} within 3 days. `;

  msg += `Tap ✨ Assistant for the full list.`;

  const toast = document.getElementById('alertToast');
  const toastMsg = document.getElementById('alertToastMsg');
  toastMsg.innerHTML = msg;

  setTimeout(() => toast.classList.add('show'), 600);
  setTimeout(() => toast.classList.remove('show'), 9000);
}
