import { initUI, openEntryModal, closeModal, saveEntry, deleteEntry, removePreview, viewImage, closeViewer, openLink, renderGrid, renderStats } from './ui.js';
import { storage } from './storage.js';
import { checkUrgentOnLoad } from './assistant.js';
import { requestNotificationPermission, checkAndNotify } from './notifications.js';

// Expose functions to global scope for onclick handlers
window.openEntryModal = openEntryModal;
window.closeModal = closeModal;
window.saveEntry = saveEntry;
window.deleteEntry = deleteEntry;
window.removePreview = removePreview;
window.viewImage = viewImage;
window.closeViewer = closeViewer;
window.openLink = openLink;
window.renderGrid = renderGrid;
window.renderStats = renderStats;

// Export/Import functions
window.exportData = () => storage.export();
window.importData = async () => {
  const imported = await storage.import();
  if (imported) {
    let entries = storage.getAll();
    const existingIds = new Set(entries.map((e) => e.id));
    imported.forEach((e) => {
      if (!existingIds.has(e.id)) entries.push(e);
    });
    storage.save(entries);
    renderGrid();
    renderStats();
    alert('Import successful!');
  }
};

async function init() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', reg);
    } catch (err) {
      console.log('Service Worker registration failed:', err);
    }
  }

  // Request notification permission
  const hasNotifPerm = await requestNotificationPermission();
  if (hasNotifPerm) {
    checkAndNotify(storage.getAll());
  }

  // Initialize UI
  initUI();

  // Check for urgent alerts
  checkUrgentOnLoad(storage.getAll());

  // Install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    const deferredPrompt = e;
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
      installBtn.style.display = 'flex';
      installBtn.addEventListener('click', async () => {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        installBtn.style.display = 'none';
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
