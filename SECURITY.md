# 🔒 Security Policy

## API Keys & Secrets

This project uses several third-party APIs. **Never commit real credentials to git.**

### Files that contain secrets (always gitignored)

| File | Contents | Status |
|---|---|---|
| `.env.local` | All API keys + Firebase config | ✅ Gitignored |
| `service-account*.json` | Firebase Admin credentials | ✅ Gitignored |
| `firebase-adminsdk*.json` | Firebase Admin credentials | ✅ Gitignored |

### Setting up locally

1. Copy the template:
   ```bash
   cp .env.local.example .env.local
   ```
2. Fill in your real values in `.env.local` — see comments in the file for where to get each key.

### Required environment variables

| Variable | Service | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase | [Firebase Console](https://console.firebase.google.com) → Project Settings → Your Apps |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | FCM Web Push | Firebase Console → Project Settings → Cloud Messaging |
| `GEMINI_API_KEY` | Gemini AI | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `FAST2SMS_API_KEY` | SOS SMS | [fast2sms.com](https://fast2sms.com) → Developer → API |

### Deploying to Vercel

Add all variables from `.env.local` to:
**Vercel Dashboard → Your Project → Settings → Environment Variables**

Never put real API keys in:
- Source code
- Comments
- `README.md`
- Any tracked file

### If a key is accidentally committed

1. **Immediately revoke/regenerate** the exposed key from its dashboard
2. Remove it from git history:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```
3. Update `.gitignore` to prevent it happening again
