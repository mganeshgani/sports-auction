# Render Deployment Guide for Backend

## Environment Variables to Add in Render Dashboard:

```
MONGODB_URI=your_mongodb_connection_string_here
PORT=5001
NODE_ENV=production
```

## Build Settings:
- **Build Command:** `npm install`
- **Start Command:** `npm start` or `node server.js`
- **Node Version:** 18.x or latest

## Important:
After deployment, you'll get a URL like:
`https://sports-auction-backend.onrender.com`

Use this URL + `/api` for your frontend:
`https://sports-auction-backend.onrender.com/api`
