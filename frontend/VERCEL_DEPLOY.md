# Vercel Deployment Guide for Frontend

## Environment Variables to Add in Vercel Dashboard:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

⚠️ **IMPORTANT:** Replace `your-backend-url.onrender.com` with your actual Render backend URL!

## Build Settings (Auto-detected):
- **Framework Preset:** Create React App
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Install Command:** `npm install`

## After Backend is Deployed:
1. Get your Render backend URL (e.g., `https://sports-auction-abc123.onrender.com`)
2. Add `/api` to the end
3. Set it as `REACT_APP_API_URL` in Vercel
4. Redeploy if already deployed
