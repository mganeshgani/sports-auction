# 🚀 Deployment Guide

## Production Deployment Options

### Option 1: Deploy to Vercel (Frontend) + Railway (Backend)

#### Backend - Railway
1. Create account on [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables:
   ```
   PORT=5001
   MONGODB_URI=your_mongodb_atlas_connection_string
   NODE_ENV=production
   ```
5. Railway will auto-deploy from `/backend` folder
6. Note your backend URL: `https://your-app.railway.app`

#### Frontend - Vercel
1. Create account on [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure build settings:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-app.railway.app/api
   ```
5. Deploy!

---

### Option 2: Deploy to Render (Full Stack)

#### Backend Service
1. Go to [Render.com](https://render.com)
2. New → Web Service
3. Connect your GitHub repo
4. Configure:
   - Name: `sports-auction-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variables:
   ```
   PORT=5001
   MONGODB_URI=your_mongodb_uri
   NODE_ENV=production
   ```

#### Frontend Static Site
1. New → Static Site
2. Connect same repo
3. Configure:
   - Name: `sports-auction-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://sports-auction-backend.onrender.com/api
   ```

---

### Option 3: Deploy to Heroku (Full Stack)

#### Backend
```bash
cd backend
heroku create sports-auction-api
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set NODE_ENV=production
git subtree push --prefix backend heroku main
```

#### Frontend
```bash
cd frontend
heroku create sports-auction-web
heroku buildpacks:set heroku/nodejs
heroku config:set REACT_APP_API_URL=https://sports-auction-api.herokuapp.com/api
git subtree push --prefix frontend heroku main
```

---

### Option 4: Deploy to DigitalOcean App Platform

1. Create [DigitalOcean](https://www.digitalocean.com/) account
2. Go to App Platform
3. Create App from GitHub
4. Configure two components:

**Backend Component:**
- Type: Web Service
- Source: `/backend`
- Build Command: `npm install && npm run build`
- Run Command: `npm start`
- Environment Variables:
  ```
  MONGODB_URI=your_mongodb_uri
  PORT=5001
  ```

**Frontend Component:**
- Type: Static Site
- Source: `/frontend`
- Build Command: `npm install && npm run build`
- Output Directory: `build`
- Environment Variables:
  ```
  REACT_APP_API_URL=${backend.PUBLIC_URL}/api
  ```

---

## MongoDB Atlas Setup (Required for All Options)

1. Create account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a FREE cluster (M0 Sandbox)
3. Database Access:
   - Create database user with password
   - Note username and password
4. Network Access:
   - Add IP: `0.0.0.0/0` (allow from anywhere)
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Example: `mongodb+srv://admin:mypass123@cluster0.xxxxx.mongodb.net/sports-auction?retryWrites=true&w=majority`

---

## Environment Variables Summary

### Backend `.env`
```env
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sports-auction
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.com
```

### Frontend `.env`
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

---

## Pre-Deployment Checklist

- [ ] Update CORS settings in `backend/src/server.ts`
- [ ] Set production MongoDB URI
- [ ] Configure frontend API URL
- [ ] Test CSV upload with sample file
- [ ] Verify socket.io connection
- [ ] Test all pages (Players, Teams, Auction, Unsold, Results)
- [ ] Check mobile responsiveness
- [ ] Enable error logging

---

## CORS Configuration for Production

Update `backend/src/server.ts`:

```typescript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
};

app.use(cors(corsOptions));
```

Add to backend `.env`:
```env
CORS_ORIGIN=https://your-frontend-domain.com
```

---

## Post-Deployment Testing

1. **Players Page**
   - Upload sample CSV
   - Verify players appear
   - Check photo display

2. **Teams Page**
   - Create 2-3 teams
   - Verify budget tracking
   - Test edit/delete

3. **Auction Page**
   - Click "Next Player"
   - Verify spin wheel animation
   - Check countdown timer
   - Test assign to team (sound + confetti)
   - Test mark as unsold

4. **Unsold Page**
   - Verify unsold players list
   - Test re-auction functionality

5. **Results Page**
   - Check statistics
   - Verify team rosters
   - Test CSV export

---

## Performance Optimization

### Frontend
```bash
# Build with optimization
cd frontend
npm run build

# Analyze bundle size
npx source-map-explorer build/static/js/*.js
```

### Backend
- Enable gzip compression
- Add request rate limiting
- Implement Redis caching for frequently accessed data

---

## Monitoring & Logging

### Recommended Services
- **Frontend**: Vercel Analytics, Google Analytics
- **Backend**: LogRocket, Sentry
- **Database**: MongoDB Atlas Monitoring
- **Uptime**: UptimeRobot, Pingdom

---

## Backup & Security

### Database Backups
- MongoDB Atlas: Enable automated backups (Cloud Backup)
- Schedule daily backups
- Test restore process

### Security Best Practices
- Use environment variables for secrets
- Enable HTTPS (most platforms do this automatically)
- Implement rate limiting on API endpoints
- Validate and sanitize all user inputs
- Keep dependencies updated

---

## Support

For deployment issues:
1. Check platform-specific logs
2. Verify environment variables are set correctly
3. Test MongoDB connection from deployment platform
4. Check CORS configuration
5. Review build logs for errors

---

**Happy Deploying! 🎉**
