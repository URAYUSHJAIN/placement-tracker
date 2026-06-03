export const esc = (str) => {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

export const daysBetween = (a, b) => {
  return Math.round((a - b) / 86400000);
};

export const statusLabel = (s) => {
  return {
    pending: 'Pending',
    applied: 'Applied',
    assessment: 'Assessment',
    interview: 'Interview',
    offer: 'Offer 🎉',
    rejected: 'Rejected',
  }[s] || s;
};

export const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const formatDate = (date) => {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};
