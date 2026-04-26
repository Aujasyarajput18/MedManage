# ========================
# MedManage — Deploy Guide
# ========================

## Deploy to Vercel (takes 5 minutes)

### Step 1 — Push to GitHub
```bash
cd "/Users/aujasyarajput/Documents/medication project/medmanage-web"
git init
git add .
git commit -m "MedManage v1.0 — jury build"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/medmanage-web.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your `medmanage-web` GitHub repo
4. Add these Environment Variables (from your .env.local file):

```
NEXT_PUBLIC_FIREBASE_API_KEY       = (copy from your .env.local)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN   = (copy from your .env.local)
NEXT_PUBLIC_FIREBASE_PROJECT_ID    = (copy from your .env.local)
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET= (copy from your .env.local)
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = (copy from your .env.local)
NEXT_PUBLIC_FIREBASE_APP_ID        = (copy from your .env.local)
CLAUDE_API_KEY                     = (get from console.anthropic.com)
FAST2SMS_API_KEY                   = (get from fast2sms.com dashboard)
```

5. Click **Deploy**
6. Your URL: `https://medmanage-web.vercel.app`

### Step 3 — Enable PWA "Install as App"
Firebase Console → Authentication → Authorized Domains → Add your Vercel URL

### Step 4 — Test on your phone
1. Open the Vercel URL on your phone in Chrome/Safari
2. Chrome: tap ⋮ menu → "Add to Home Screen"
3. Safari: tap share icon → "Add to Home Screen"
4. It installs like a native app — icon on home screen, no browser bar!

## For the Jury Demo
- Print or show the QR code to your Vercel URL
- They scan it → opens in phone browser
- Tap "Add to Home Screen" → installed!
- Or just tap "Try Demo" — no login needed

## Quick commands
```bash
npm run dev    # local dev server
npm run build  # test production build
```
