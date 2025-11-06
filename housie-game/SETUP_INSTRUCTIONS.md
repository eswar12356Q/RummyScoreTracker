# 🎲 Multiplayer Housie/Tambola Game - Complete Setup Instructions

## 📁 Project Structure
```
housie-game/
├── backend/                 # Node.js server (port 3001)
├── frontend/               # React app (port 3000)
├── shared/                 # TypeScript types
├── demo.html              # Interactive demo (port 8080)
└── README.md              # Documentation
```

## 🚀 Quick Setup

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend will start on: http://localhost:3001

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend will start on: http://localhost:3000

### 3. Demo HTML (Easiest Option)
```bash
# In the housie-game root directory
python3 -m http.server 8080
```
Then open: http://localhost:8080/demo.html

## 🎮 Game Features
- ✅ Multiplayer rooms (up to 10 players)
- ✅ Unique ticket generation
- ✅ All winning patterns (Early Five, Lines, Full House)
- ✅ Real-time gameplay with Socket.io
- ✅ Room creation and joining
- ✅ Claim validation system
- ✅ SQLite database storage

## 🛠️ Technologies Used
- **Backend**: Node.js, Express, Socket.io, SQLite, TypeScript
- **Frontend**: React 18, TypeScript, CSS3
- **Real-time**: WebSocket connections
- **Database**: SQLite with complete schema

## 📋 How to Play
1. Create a room or join an existing one
2. Select your tickets (up to 3 per player)
3. Host starts the game and calls numbers
4. Mark numbers on your tickets as they're called
5. Make claims when you complete winning patterns
6. First valid claim wins each pattern

## 🏆 Winning Patterns
- **Early Five**: First 5 numbers marked
- **Top Line**: Complete first row
- **Middle Line**: Complete second row
- **Bottom Line**: Complete third row
- **Full House**: All 15 numbers marked

## 🔧 API Endpoints
- `GET /api/health` - Server health check
- `GET /api/rooms` - Get public rooms
- `GET /api/rooms/:id` - Get room details
- `GET /api/rooms/:id/can-join` - Check if room can be joined

## 🎯 Socket.io Events
- `create-room` - Create new room
- `join-room` - Join existing room
- `start-game` - Start game (host only)
- `call-number` - Call number (host only)
- `make-claim` - Make pattern claim
- `mark-number` - Mark number on ticket

## 📱 Testing
Open demo.html in your browser to test:
- Backend API connectivity
- Room management interface
- Live room updates
- Interactive UI components

## 🐛 Troubleshooting
- Ensure Node.js 16+ is installed
- Check that ports 3001, 3000, and 8080 are available
- Verify all npm dependencies are installed
- Run backend first, then frontend

## 📞 Support
This is a complete implementation with all game logic, real-time features, and a modern UI. Everything is production-ready!