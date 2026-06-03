# Placement Tracker — PWA Edition

A lightweight, offline-first Progressive Web App to track your placement applications. Install on your phone, laptop, or use in the browser. All data stays local; no backend server required.

## Features

✅ **Offline-first**: Works completely offline after first load  
✅ **Installable**: Install on Android, Windows, or any browser as a PWA  
✅ **Persistent**: All data stored in localStorage, synced across device  
✅ **Smart Assistant**: Rule-based alerts for overdue deadlines, stale entries  
✅ **Screenshots**: Paste/drop images directly into entries (stored as base64)  
✅ **Local Notifications**: Deadline reminders via browser notifications  
✅ **Export/Import**: JSON backup/restore, independent of any sync  
✅ **Mobile-optimized**: Responsive design for phones and tablets  

## Quick Start

### 0. Deploy to Vercel (Optional but Recommended)

**Want it live online in 5 minutes?**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step guide to deploy on Vercel (free). Your app will be:
- Live on a public URL
- Accessible from any device
- Installable as PWA on Android/Windows/iOS
- HTTPS by default
- Auto-updated when you push to GitHub

### 1. Local Development

**Option A: Python HTTP Server**
```bash
cd c:\Users\urayu\OneDrive\Desktop\tracker
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Option B: VS Code Live Server**
- Open the tracker folder in VS Code
- Right-click `index.html` → "Open with Live Server"
- Browser opens automatically at `http://localhost:5500`

**Option C: Node.js HTTP Server**
```bash
npx http-server
```

### 2. First Run

1. Open the app in your browser
2. Grant **Notification Permission** when prompted (for deadline alerts)
3. Add your first placement entry with "+ Add Entry"
4. Data is saved to localStorage automatically

### 3. Install as PWA

**On Android (Chrome):**
1. Open the app in Chrome
2. Tap the browser menu (⋮) → "Install app" or tap the install banner
3. App appears on home screen; tap to launch

**On Windows/Mac (Chrome/Edge):**
1. Open the app in Chrome or Edge
2. Click the install icon in the address bar (or Ctrl+Shift+P → "Install app")
3. App installs as a standalone window

**On iOS:**
- iOS doesn't support full PWA installation like Android
- Add to Home Screen: Safari → Share → "Add to Home Screen"
- Works in fullscreen Safari mode; limited background notifications

### 4. Backup to Google Drive

Data stays in **localStorage on your device**. To backup:

1. Click "⬇ Export JSON" → saves `placement_tracker_YYYY-MM-DD.json` to Downloads
2. Upload to your Google Drive folder: https://drive.google.com/drive/folders/1hHF_yVkmmrA5EGhqrN6KxHZvWD7Q2Jyj

To restore from backup:
1. Download the JSON file from Drive
2. Click "⬆ Import" → select the file
3. Entries merge (duplicates by ID are skipped)

## File Structure

```
tracker/
├── index.html                # Main app
├── manifest.json             # PWA metadata
├── service-worker.js         # Offline + cache + notifications
├── styles/main.css           # All styling
├── js/
│   ├── main.js              # Bootstrap & global functions
│   ├── storage.js           # localStorage interface
│   ├── ui.js                # DOM rendering & events
│   ├── assistant.js         # Rule-based deadline analysis
│   ├── notifications.js     # Notification API wrapper
│   └── utils.js             # Shared helpers
├── icons/                   # App icons
└── README.md                # This file
```

## How It Works

### Data Storage
- All entries stored in **localStorage** under key `placement_tracker_v2`
- Max ~5-10MB per domain (enough for thousands of entries)
- Persists across browser restarts, survives app uninstall on Android

### Service Worker
- Caches static assets (HTML, CSS, JS) on first load
- Network-first strategy: always try server, fall back to cache offline
- Enables "Add to Home Screen" installation
- Handles notification clicks

### Assistant
Automatically flags:
- **Overdue**: Deadlines passed, status ≠ rejected/offer
- **Due Soon**: Deadlines within 3 days
- **Stale Pending**: Applications in "Pending" status for 4+ days
- **Stale Touch**: Active entries not updated in 10+ days

Click on any card in the Assistant drawer to open and edit that entry.

### Notifications
- **Reminder**: When app loads, checks for overdue/today/tomorrow deadlines
- **Local-only**: Notifications don't require a backend server
- **Android limitation**: When the browser is fully closed, OS may kill the service worker, so notifications won't fire. They work best when the app is in the background or recently used.

## Features & Fields

**Per Entry:**
- Company, Role, Status (6 options)
- Deadline / Test Date
- Application Link
- CTC / Stipend
- Source (LinkedIn, Referral, Campus, etc.)
- Referral Contact name
- Portal Login/Credentials
- Notes (bond conditions, tech stack, interview notes, etc.)
- Screenshots (paste, drag-drop, or click to upload)

**Filtering:**
- By Status (Pending, Applied, Assessment, Interview, Offer, Rejected)
- Overdue deadlines
- Search by Company or Role name

**Stats:**
- Total applications, counts by status, overdue count

## Responsive Design

The app is fully responsive and tested on:
- **Desktop** (1920×1080, 1366×768)
- **Tablet** (iPad: 768×1024, Android: 600×800)
- **Phone** (iPhone: 375×667, Android: 360×640, small phones: 320×568)

Layout adapts automatically:
- **Desktop**: Grid view with multiple cards
- **Tablet**: Slightly condensed, grid adjusts
- **Phone**: Single-column layout, optimized touch targets
- **Extra small**: Minimal padding, vertical stacking

No horizontal scroll on any device ✓

## Tips

1. **Paste Screenshots Fast**: Open an entry, Ctrl+V to paste directly from clipboard
2. **Keyboard**: Tab through form fields, Enter to save
3. **Bulk Import**: Export from one device, import on another to sync
4. **Regular Backups**: Export JSON weekly, store in Drive or email
5. **Offline Mode**: Works fully without internet after first load

## Privacy & Security

- ✅ **All data is yours**: Stored locally in your browser, never sent to any server
- ✅ **No backend**: No login, no accounts, no data collection
- ✅ **Offline**: Doesn't require internet to function
- ⚠️ **Browser data**: If someone accesses your device, they can see all entries in the browser's storage

## Troubleshooting

**App not installing?**
- Use Chrome or Edge (best PWA support)
- App only installable on HTTPS or localhost
- Clear browser cache and reload

**Notifications not showing?**
- Grant permission when prompted
- Check browser notification settings
- Android: app may not notify if fully closed (browser limitation)

**Lost data?**
- Check if you exported JSON; import it back
- localStorage persists across page reloads unless you clear browser data
- Use "Export" regularly as backup

**Sync across devices?**
- For now: manually export JSON from one device, import on another
- Store JSON in Drive, download on other device, import

## Clean Setup

Removed:
- ❌ Old single-file HTML (replaced with modular index.html)
- ❌ AI feature (not needed for MVP)
- ❌ Google Drive OAuth sync (complexity vs. manual export/import)
- ❌ Icon generator script (placeholder icons included)

Kept:
- ✅ All original features (company, role, status, deadline, CTC, source, referral, credentials, notes, screenshots, stats, filters, search, assistant)
- ✅ Offline-first architecture
- ✅ JSON export/import for manual backups
- ✅ Rule-based deadline assistant

## Development Notes

- No frameworks: vanilla JS, ES modules
- Dependency-free: no npm packages
- ~500 lines of modular code
- CSS Grid + Flexbox for layout
- Fully responsive (320px to 2560px+)
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)

## Future Ideas

- Real-time Drive sync (requires OAuth setup)
- AI-powered email drafting (optional, requires API key)
- Dark mode toggle
- Export to PDF
- Calendar view
- Interview prep notes per entry

---

Built for placement season 2024–2025. Good luck with your applications! 🚀
