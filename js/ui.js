import { esc, statusLabel, today as getToday, formatDate } from './utils.js';
import { storage } from './storage.js';

let currentFilter = 'all';
let editId = null;
let pendingImages = [];

export function initUI() {
  setupEventListeners();
  renderStats();
  renderGrid();
}

function setupEventListeners() {
  document.addEventListener('paste', handlePaste);

  // Filter chips
  document.querySelectorAll('.filter-chip').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      currentFilter = e.target.dataset.filter;
      document.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
      e.target.classList.add('active');
      renderGrid();
    });
  });

  // Search input
  document.getElementById('searchInput')?.addEventListener('input', renderGrid);

  // Modal
  const overlay = document.getElementById('overlay');
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Drop zone
  const dropZone = document.getElementById('dropZone');
  if (dropZone) {
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('drop', handleDrop);
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('click', () => document.getElementById('fileInput').click());
  }

  document.getElementById('fileInput')?.addEventListener('change', handleFileSelect);
}

export function renderStats() {
  const entries = storage.getAll();
  const stats = {
    total: 0,
    applied: 0,
    assessment: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    pending: 0,
    overdue: 0,
  };

  const t = getToday();
  entries.forEach((e) => {
    stats.total++;
    stats[e.status] = (stats[e.status] || 0) + 1;
    if (e.deadline && new Date(e.deadline) < t && e.status !== 'rejected' && e.status !== 'offer')
      stats.overdue++;
  });

  const chips = [
    ['📋', stats.total, 'Total'],
    ['🕒', stats.pending, 'Pending'],
    ['✅', stats.applied, 'Applied'],
    ['📝', stats.assessment, 'Assessment'],
    ['🗣', stats.interview, 'Interview'],
    ['🎉', stats.offer, 'Offers'],
    ['❌', stats.rejected, 'Rejected'],
    ['🔴', stats.overdue, 'Overdue'],
  ];

  document.getElementById('statsBar').innerHTML = chips
    .map(
      ([icon, num, label]) =>
        `<div class="stat-chip">${icon} <span class="num">${num}</span> <span style="color:var(--muted)">${label}</span></div>`
    )
    .join('');
}

export function renderGrid() {
  const entries = storage.getAll();
  const query = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const t = getToday();

  let filtered = entries.filter((e) => {
    if (query && !e.company.toLowerCase().includes(query) && !e.role.toLowerCase().includes(query))
      return false;

    if (currentFilter === 'all') return true;
    if (currentFilter === 'overdue') {
      return e.deadline && new Date(e.deadline) < t && e.status !== 'rejected' && e.status !== 'offer';
    }
    return e.status === currentFilter;
  });

  // Sort by deadline
  filtered.sort((a, b) => {
    const da = a.deadline ? new Date(a.deadline) : new Date('9999-01-01');
    const db = b.deadline ? new Date(b.deadline) : new Date('9999-01-01');
    return da - db;
  });

  const grid = document.getElementById('grid');
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty">
      <div class="empty-icon">📭</div>
      <h3>No entries found</h3>
      <p>${entries.length === 0 ? 'Click "+ Add Entry" to start tracking your placements.' : 'Try a different filter or search.'}</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map((e) => cardHTML(e, t)).join('');
}

function cardHTML(e, t) {
  const dl = e.deadline ? new Date(e.deadline) : null;
  let dlClass = 'deadline-ok',
    dlText = 'No deadline';
  let cardClass = '';

  if (dl) {
    const diff = Math.ceil((dl - t) / 86400000);
    if (diff < 0) {
      dlClass = 'deadline-overdue';
      dlText = `${Math.abs(diff)}d overdue`;
      cardClass = 'overdue';
    } else if (diff <= 3) {
      dlClass = 'deadline-urgent';
      dlText = diff === 0 ? 'Today!' : `${diff}d left`;
      cardClass = 'urgent';
    } else {
      dlText = formatDate(dl);
    }
  }

  const thumbs = (e.images || [])
    .map((img, i) => `<img class="thumb" src="${img.data}" alt="screenshot ${i + 1}" onclick="event.stopPropagation();window.viewImage('${e.id}',${i})" />`)
    .join('');

  return `<div class="card ${cardClass}" onclick="window.openEntryModal('${e.id}')">
    <div class="card-top">
      <div>
        <div class="company-name">${esc(e.company)}</div>
        <div class="role-name">${esc(e.role)}</div>
      </div>
      <div class="card-actions" onclick="event.stopPropagation()">
        ${e.link ? `<button class="icon-btn" title="Open portal" onclick="window.openLink('${e.link}')">🔗</button>` : ''}
        <button class="icon-btn del" title="Delete" onclick="window.deleteEntry('${e.id}')">🗑</button>
      </div>
    </div>

    <span class="status-badge status-${e.status}">
      <span class="badge-dot"></span>${statusLabel(e.status)}
    </span>

    <div class="card-meta">
      <span class="meta-item deadline-pill ${dlClass}">${dlText}</span>
      ${e.ctc ? `<span class="meta-item">💰 ${esc(e.ctc)}</span>` : ''}
      ${e.source ? `<span class="meta-item">📌 ${esc(e.source)}</span>` : ''}
      ${e.referral ? `<span class="meta-item">👤 ${esc(e.referral)}</span>` : ''}
    </div>

    ${e.notes ? `<div class="card-note">${esc(e.notes)}</div>` : ''}
    ${thumbs ? `<div class="thumb-row">${thumbs}</div>` : ''}
  </div>`;
}

export function openEntryModal(id) {
  editId = id || null;
  pendingImages = [];
  document.getElementById('previewsContainer').innerHTML = '';

  const entries = storage.getAll();
  const editEntry = id ? entries.find((e) => e.id === id) : null;

  if (editEntry) {
    document.getElementById('modalTitle').textContent = 'Edit Application';
    document.getElementById('fCompany').value = editEntry.company;
    document.getElementById('fRole').value = editEntry.role;
    document.getElementById('fStatus').value = editEntry.status;
    document.getElementById('fDeadline').value = editEntry.deadline || '';
    document.getElementById('fLink').value = editEntry.link || '';
    document.getElementById('fCTC').value = editEntry.ctc || '';
    document.getElementById('fSource').value = editEntry.source || '';
    document.getElementById('fReferral').value = editEntry.referral || '';
    document.getElementById('fCreds').value = editEntry.creds || '';
    document.getElementById('fNotes').value = editEntry.notes || '';
    pendingImages = [...(editEntry.images || [])];
    renderPreviews();
  } else {
    document.getElementById('modalTitle').textContent = 'New Application';
    ['fCompany', 'fRole', 'fLink', 'fCTC', 'fSource', 'fReferral', 'fCreds', 'fNotes'].forEach(
      (id) => (document.getElementById(id).value = '')
    );
    document.getElementById('fStatus').value = 'pending';
    document.getElementById('fDeadline').value = '';
  }

  document.getElementById('overlay').classList.add('open');
}

export function closeModal() {
  document.getElementById('overlay').classList.remove('open');
}

export function saveEntry() {
  const company = document.getElementById('fCompany').value.trim();
  const role = document.getElementById('fRole').value.trim();

  if (!company || !role) {
    alert('Company and Role are required!');
    return;
  }

  const entries = storage.getAll();
  const data = {
    id: editId || Date.now().toString(),
    company,
    role,
    status: document.getElementById('fStatus').value,
    deadline: document.getElementById('fDeadline').value,
    link: document.getElementById('fLink').value.trim(),
    ctc: document.getElementById('fCTC').value.trim(),
    source: document.getElementById('fSource').value.trim(),
    referral: document.getElementById('fReferral').value.trim(),
    creds: document.getElementById('fCreds').value.trim(),
    notes: document.getElementById('fNotes').value.trim(),
    images: [...pendingImages],
    updatedAt: new Date().toISOString(),
  };

  if (editId) {
    const idx = entries.findIndex((e) => e.id === editId);
    entries[idx] = data;
  } else {
    data.createdAt = data.updatedAt;
    entries.unshift(data);
  }

  storage.save(entries);
  closeModal();
  renderGrid();
  renderStats();
}

export function deleteEntry(id) {
  if (!confirm('Delete this entry?')) return;
  let entries = storage.getAll();
  entries = entries.filter((e) => e.id !== id);
  storage.save(entries);
  renderGrid();
  renderStats();
}

function handleFileSelect(e) {
  [...e.target.files].forEach(processFile);
  e.target.value = '';
}

function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.add('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.remove('drag-over');
  [...e.dataTransfer.files].forEach(processFile);
}

function handlePaste(e) {
  if (!document.getElementById('overlay').classList.contains('open')) return;
  const items = e.clipboardData?.items;
  if (!items) return;
  [...items].forEach((item) => {
    if (item.type.startsWith('image/')) {
      processFile(item.getAsFile());
    }
  });
}

function processFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    pendingImages.push({ name: file.name, data: ev.target.result });
    renderPreviews();
  };
  reader.readAsDataURL(file);
}

function renderPreviews() {
  const container = document.getElementById('previewsContainer');
  container.innerHTML = pendingImages
    .map((img, i) => {
      const isImg = img.data.startsWith('data:image');
      return `<div class="preview-wrap">
        ${
          isImg
            ? `<img class="preview-img" src="${img.data}" alt="${img.name}" />`
            : `<div class="preview-img" style="background:var(--surface3);display:flex;align-items:center;justify-content:center;font-size:20px">📄</div>`
        }
        <button class="remove-preview" onclick="window.removePreview(${i})">✕</button>
      </div>`;
    })
    .join('');
}

export function removePreview(i) {
  pendingImages.splice(i, 1);
  renderPreviews();
}

export function viewImage(id, idx) {
  const entries = storage.getAll();
  const e = entries.find((e) => e.id === id);
  if (!e || !e.images[idx]) return;
  document.getElementById('viewerImg').src = e.images[idx].data;
  document.getElementById('imgViewer').classList.add('open');
}

export function closeViewer() {
  document.getElementById('imgViewer').classList.remove('open');
}

export function openLink(url) {
  if (url) window.open(url, '_blank');
}

