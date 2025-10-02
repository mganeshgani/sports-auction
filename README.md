# 🏐 Sports Auction Management System

A complete real-time auction system for College Volleyball/Throwball sports events with spin wheel animation, live updates, and comprehensive player management.

## ✨ Features

### 1. **Player Management**
- CSV bulk upload with template support
- Player profiles with photos, registration numbers, and classes
- Filter by status (All/Available/Sold/Unsold)
- Automatic status tracking

### 2. **Team Management**
- Create teams with custom budgets and player slots
- Real-time budget tracking
- Automatic calculation of remaining budget and filled slots
- Visual dashboard with live updates

### 3. **Live Auction Flow**
- 🎯 **Spin Wheel Animation** - Random player selection with 4-second rotation
- ⏱️ **30-Second Countdown Timer** - Auto-unsold when time expires
- 🎉 **Confetti Celebration** - Visual feedback on successful sale
- 🔊 **Sound Effects** - Audio notification on player sold
- Real-time updates via Socket.io

### 4. **Unsold Player Management**
- Dedicated page for unsold players
- Re-auction functionality
- Convert unsold back to available status

### 5. **Results & Export**
- Complete auction statistics
- Team-wise roster display
- CSV export functionality
- Budget tracking and analysis

## 🛠️ Tech Stack

### Frontend
- React 19.2.0 with TypeScript
- Tailwind CSS v3.4.0
- React Router v7.9.3
- Socket.io-client for real-time updates
- Canvas Confetti for celebrations
- React-CSV for exports

### Backend
- Node.js + Express + TypeScript
- MongoDB Atlas
- Socket.io for real-time communication
- Multer for file uploads
- CSV-Parse for player data import

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd AuctionFinal
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
PORT=5001
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/sports-auction?retryWrites=true&w=majority
```

Build and start backend:
```bash
npm run build
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:
```env
REACT_APP_API_URL=http://localhost:5001/api
```

Start frontend:
```bash
npm start
```

The application will open at `http://localhost:3000`

## 📝 Usage Guide

### Step 1: Upload Players
1. Navigate to **Players** page
2. Click **Upload CSV** button
3. Select your CSV file (use `sample_players.csv` as template)
4. Players will be imported with status "available"

**CSV Format:**
```csv
name,regNo,position,class,photoUrl
Rahul Kumar,2021001,Spiker,SE Comp A,https://example.com/photo.jpg
```

### Step 2: Create Teams
1. Navigate to **Teams** page
2. Click **Add New Team**
3. Enter team name, budget, and total slots
4. Teams will appear with remaining budget tracking

### Step 3: Conduct Auction
1. Navigate to **Auction** page
2. Click **🎯 Next Player** to spin the wheel
3. After 4-second spin, a random player is selected
4. **30-second countdown** starts automatically
5. Select a team and enter sold amount
6. Click **Assign to Team** for sale (plays sound + confetti)
7. Or click **Mark as Unsold** (or wait for countdown to reach 0)

### Step 4: Manage Unsold Players
1. Navigate to **Unsold** page
2. View all unsold players
3. Click **Re-Auction** to make them available again

### Step 5: View Results
1. Navigate to **Results** page
2. See complete statistics and team rosters
3. Click **📥 Export CSV** to download results

## 🎨 Key UI Features

### Spin Wheel
- 12 segments with player icons
- 4-second cubic bezier rotation
- Center pointer with glow effect
- Smooth animation completion

### Countdown Timer
- Displayed prominently during auction
- Red pulsing animation when ≤ 10 seconds
- Auto-marks player as unsold at 0 seconds

### Team Dashboard
- Live budget updates
- Filled/Total slots tracker
- Remaining budget display
- Color-coded indicators

## 🗂️ Project Structure

```
AuctionFinal/
├── backend/
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   │   ├── Player.ts
│   │   │   └── Team.ts
│   │   ├── routes/         # API endpoints
│   │   │   ├── player.routes.ts
│   │   │   ├── team.routes.ts
│   │   │   └── auction.routes.ts
│   │   └── server.ts       # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── auction/
│   │   │   │   ├── SpinWheel.tsx
│   │   │   │   └── SpinWheel.css
│   │   │   └── common/
│   │   │       └── CSVUpload.tsx
│   │   ├── pages/          # Main pages
│   │   │   ├── AuctionPage.tsx
│   │   │   ├── PlayersPage.tsx
│   │   │   ├── TeamsPage.tsx
│   │   │   ├── UnsoldPage.tsx
│   │   │   └── ResultsPage.tsx
│   │   ├── types/          # TypeScript interfaces
│   │   └── App.tsx
│   └── package.json
└── sample_players.csv      # Example CSV template
```

## 🔧 API Endpoints

### Players
- `GET /api/players` - Get all players
- `POST /api/players` - Create player
- `POST /api/players/upload` - Upload CSV
- `PATCH /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create team
- `PATCH /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Auction
- `GET /api/auction/available` - Get available players
- `POST /api/auction/assign` - Assign player to team
- `POST /api/auction/unsold` - Mark player as unsold

## 🐛 Troubleshooting

### Port Conflicts
If port 5001 is in use, update backend `.env`:
```env
PORT=5002
```
And frontend `.env`:
```env
REACT_APP_API_URL=http://localhost:5002/api
```

### MongoDB Connection Issues
- Ensure MongoDB Atlas cluster is running
- Whitelist your IP address in Atlas
- Verify connection string format
- Check username/password encoding

### CSV Upload Errors
- Ensure CSV has headers: `name,regNo,position,class,photoUrl`
- Check for special characters in data
- Verify file encoding (UTF-8)

## 📊 Database Schema

### Player Model
```typescript
{
  name: string,
  regNo: string,
  position: string,
  class: string,
  photoUrl?: string,
  status: 'available' | 'sold' | 'unsold',
  team?: ObjectId,
  soldAmount?: number
}
```

### Team Model
```typescript
{
  name: string,
  budget: number,
  totalSlots: number,
  players: ObjectId[],
  remainingBudget: number (virtual),
  filledSlots: number (virtual)
}
```

## 🎯 Future Enhancements
- [ ] WebSocket live streaming for audience
- [ ] Admin authentication
- [ ] Player statistics and ratings
- [ ] Multi-sport support
- [ ] Undo/Redo auction actions
- [ ] PDF export with branding
- [ ] Mobile app version

## 📄 License
MIT License

## 👨‍💻 Developer
Built with ❤️ for College Sports Events

---

**Need Help?** Check the troubleshooting section or create an issue on GitHub.
