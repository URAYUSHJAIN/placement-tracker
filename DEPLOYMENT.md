# Deploy to Vercel (5 minutes)

Free, instant deployment. Your app gets a live URL and works everywhere.

## Step 1: Push to GitHub

```bash
# Navigate to tracker folder
cd c:\Users\urayu\OneDrive\Desktop\tracker

# Initialize git repo (if not already done)
git init
git add .
git commit -m "Initial placement tracker PWA"

# Create a new repo on GitHub at github.com/new
# Then push:
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/placement-tracker.git
git push -u origin main
```

## Step 2: Deploy on Vercel

**Method A: Web UI (Easiest)**

1. Go to https://vercel.com/
2. Click **"Sign Up"** → use GitHub account
3. Authorize Vercel to access GitHub
4. Click **"New Project"**
5. Select your `placement-tracker` repo
6. Click **Deploy**
7. Wait ~30 seconds
8. You'll get a live URL like `https://placement-tracker-abc123.vercel.app`

**Method B: CLI (If you prefer terminal)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd c:\Users\urayu\OneDrive\Desktop\tracker
vercel

# Follow prompts:
# - Link to existing project? No (first time)
# - Set project name? (default is fine)
# - Continue to dashboard
```

## Step 3: Update DNS (Optional)

If you want a custom domain like `tracker.yourname.com`:

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records with your registrar (Vercel shows exact steps)

## Step 4: Done! 🎉

Your app is live and accessible from:
- **Desktop**: https://your-deployment-url.vercel.app
- **Android**: Open in Chrome, tap menu → Install app
- **iOS**: Safari → Share → Add to Home Screen
- **Windows**: Open in Edge/Chrome, click install icon

### Features After Deployment

✅ **Works offline** (service worker caches everything)
✅ **Installable** on Android, Windows, iOS
✅ **HTTPS by default** (Vercel provides free SSL)
✅ **Fast everywhere** (global CDN)
✅ **No backend needed** (all data in localStorage)

## Sync Data Across Devices

Since data stays in localStorage on each device:

**Option 1: Manual Sync (Recommended)**
- On Device A: Click "⬇ Export JSON"
- Save to Google Drive
- On Device B: Download JSON from Drive, Click "⬆ Import"

**Option 2: Real-time Sync (Future Enhancement)**
- Would require backend or Firebase
- Not needed for personal use case

## Update Your Deployed App

After making changes locally:

```bash
git add .
git commit -m "Add new feature"
git push origin main
```

Vercel auto-deploys within 30 seconds. No manual redeploy needed!

## Troubleshooting

### "Deployment failed"
- Check that all files are committed to git
- Verify no sensitive files in .gitignore (you don't have any)
- Try redeploying from Vercel dashboard

### App shows blank page
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors (F12 → Console)

### Service worker not caching
- Vercel's service worker caching works; just reload page 2x
- First load fetches; second load serves from cache

### Notifications not working on production
- Some browsers restrict Notifications from non-HTTPS origins
- Vercel HTTPS is automatic, so it should work
- Grant permission when prompted

## Environment Variables (Not needed for this app)

If you ever need API keys or secrets:

1. Vercel Dashboard → Settings → Environment Variables
2. Add variables
3. They're automatically available in your app's requests

This app doesn't need any for localStorage-only usage.

## Monitoring

Vercel dashboard shows:
- Deployment history
- Build logs
- Analytics (page views, response times)
- Performance metrics

---

**That's it!** Your placement tracker is now live, installable, and works offline everywhere.
