# 🏐 College Sports Auction System

> A real-time auction platform I built for managing college volleyball/throwball player auctions. Features a fancy spin wheel, live updates, and all the bells and whistles you'd expect from a modern web app.

## Why I Built This

Running sports auctions manually was chaotic - paper lists, calculator math, people shouting bids. I wanted something that could handle the entire flow digitally, make it exciting with animations, and give everyone live updates. Plus, I got to work with some cool tech.

## What It Does

**The Short Version:** Upload players via CSV, create teams with budgets, spin a wheel to randomly select players, conduct 30-second bidding rounds, and export everything when you're done.

**The Cool Parts:**
- 🎯 Spin wheel animation that actually looks good (took me a while to get the physics right)
- ⏱️ 30-second countdown that auto-marks players as unsold if no one bids
- 🎊 Confetti explosion when a player gets sold (because why not?)
- 🔊 Sound effects for that gameshow feel
- 📊 Real-time updates across all connected browsers using Socket.io
- 💾 CSV import/export for easy data management

## Tech Stack

**Frontend:**
- React 19 with TypeScript (type safety is your friend)
- Tailwind CSS (utility classes > writing CSS from scratch)
- Socket.io client for real-time magic
- Framer Motion for smooth animations
- React Router for navigation

**Backend:**
- Node.js + Express (classic combo)
- MongoDB Atlas (free tier works great)
- Socket.io server for WebSocket connections
- Multer for handling CSV uploads

**Why These Choices?**
- React because it's what I know best and the component model fits perfectly
- TypeScript because debugging type errors at compile time > runtime surprises
- Socket.io because polling is so 2010
- MongoDB because the data structure is pretty straightforward and JSON-like documents make sense here

## Getting Started

### Prerequisites
```bash
node -v  # Need v16 or higher
npm -v   # Or yarn if that's your thing
```

You'll also need a MongoDB Atlas account (it's free). Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and set one up if you haven't.

### Installation

**1. Clone and Install**
```bash
git clone https://github.com/mganeshgani/sports-auction.git
cd sports-auction

# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

**2. Environment Setup**

Create `backend/.env`:
```env
PORT=5001
MONGODB_URI=mongodb+srv://your-username:password@cluster.mongodb.net/sports-auction
```
*Replace with your actual MongoDB Atlas connection string*

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5001/api
```

**3. Run It**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

App opens at `http://localhost:3000`. Backend runs on `http://localhost:5001`.

## Quick Walkthrough

**First Time Setup:**
1. Hit the **Players** page, upload the `sample_players.csv` (or your own)
2. Go to **Teams**, create a few teams with budgets (e.g., ₹50,000 each)
3. Navigate to **Auction** and click "Next Player"

**Running the Auction:**
- Wheel spins for 4 seconds (satisfying to watch)
- Random player appears with a 30-second timer
- Enter bid amount, select a team, hit "Assign to Team"
- Confetti goes boom 🎉, sound plays, everyone's screen updates
- Repeat until all players are sold

**Cleanup:**
- Unsold players? Check the **Unsold** page and re-auction them
- When done, go to **Results** and export everything as CSV

## Project Structure

```
sports-auction/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Business logic (player/team operations)
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   └── server.js        # Express app + Socket.io setup
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   │   ├── auction/     # SpinWheel, PlayerCard, etc.
│   │   │   └── players/     # CSVUpload component
│   │   ├── pages/       # Main route components
│   │   │   ├── AuctionPage.tsx    # Where the magic happens
│   │   │   ├── TeamsPage.tsx      # CRUD for teams
│   │   │   ├── PlayersPage.tsx    # Player management
│   │   │   ├── UnsoldPage.tsx     # Re-auction interface
│   │   │   └── ResultsPage.tsx    # Stats and export
│   │   ├── contexts/    # AuctionContext for Socket.io state
│   │   ├── services/    # API calls (axios)
│   │   └── types/       # TypeScript interfaces
│   └── public/          # Static assets
│
└── sample_players.csv   # Example data to get started
```

## How It Works Under the Hood

**Real-Time Updates:**
```
User assigns player → Backend updates MongoDB → Socket.io broadcasts event
→ All connected clients receive update → React state updates → UI re-renders
```

**The Spin Wheel:**
Just CSS transforms and some math. Rotates between 1800-3600 degrees (5-10 full spins) over 4 seconds with cubic-bezier easing. Callback fires when animation completes to fetch the random player.

**Budget Tracking:**
MongoDB stores teams with budgets. When a player is sold, we deduct from `remainingBudget`. Virtual fields calculate filled slots. Socket.io keeps everyone in sync.

## Common Issues I've Encountered

**"Connection refused" on backend:**
- MongoDB IP whitelist issue (add `0.0.0.0/0` in Atlas)
- Wrong connection string in `.env`
- MongoDB cluster is paused (free tier auto-pauses after inactivity)

**CSV upload fails:**
- Check file encoding (needs to be UTF-8)
- Make sure headers match exactly: `name,regNo,position,class,photoUrl`
- File size limit is 5MB

**Port 5001 already in use:**
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5001 | xargs kill
```

**Socket.io not connecting:**
- Check CORS settings in `backend/server.js`
- Verify `REACT_APP_API_URL` in frontend `.env`
- Make sure backend is actually running

## API Reference

Built a REST API with these main endpoints:

**Players:**
- `POST /api/players/upload` - Bulk CSV upload
- `GET /api/players` - Get all players
- `PATCH /api/players/:id` - Update player status/team
- `POST /api/players/:id/assign` - Assign to team

**Teams:**
- `POST /api/teams` - Create team
- `GET /api/teams` - Get all teams
- `PATCH /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team (only if no players)

**Real-time (Socket.io):**
- `playerUpdated` - Emitted when player changes
- `teamUpdated` - Emitted when team budget/slots change

## Deployment

I've deployed this on:
- **Backend:** Render.com (free tier)
- **Frontend:** Vercel (free tier)
- **Database:** MongoDB Atlas (free M0 cluster)

Check `DEPLOYMENT.md` and `QUICKSTART.md` for detailed deployment steps.

## Things I'd Add If I Had More Time

- [ ] Admin authentication (right now anyone can do anything)
- [ ] Undo/redo for auction mistakes
- [ ] PDF export with team logos
- [ ] Mobile app (React Native maybe?)
- [ ] Live streaming for spectators
- [ ] Player stats and performance tracking
- [ ] Multi-sport support (cricket, football, etc.)

## Lessons Learned

- Socket.io is awesome but can be tricky with React state - use contexts wisely
- Tailwind's utility classes speed up development significantly
- TypeScript catches SO many bugs before runtime
- MongoDB's flexibility is great until you need complex joins (kept it simple here)
- User testing reveals UI issues you'd never think of (hence the countdown timer)

## Contributing

Found a bug? Want to add a feature? PRs welcome! Just:
1. Fork it
2. Create a feature branch (`git checkout -b cool-feature`)
3. Commit changes (`git commit -am 'Add cool feature'`)
4. Push (`git push origin cool-feature`)
5. Open a PR

## License

MIT - do whatever you want with it

## Questions?

Hit me up if you run into issues or just want to chat about the tech choices. I'm always happy to discuss web development stuff.

---

Built with ☕ and late nights by [@mganeshgani](https://github.com/mganeshgani)

*Made for St. Aloysius College sports events*
