# Multiplayer Housie/Tambola Game

A fully functional multiplayer housie/tambola game built with React, Node.js, and Socket.io. Features real-time gameplay, room management, unique ticket generation, and comprehensive claim validation.

## Features

### 🎮 Core Gameplay
- **Multiplayer Support**: Real-time gameplay with up to 10 players per room
- **Room Management**: Create public/private rooms with customizable settings
- **Unique Ticket Generation**: Algorithm ensures all tickets are unique and follow housie rules
- **Number Calling**: Manual number calling by host (1-90)
- **Claim Validation**: Automatic validation for all winning patterns

### 🏆 Winning Patterns
- **Early Five**: First 5 numbers marked on ticket
- **Top Line**: Complete first row marked
- **Middle Line**: Complete second row marked
- **Bottom Line**: Complete third row marked
- **Full House**: All 15 numbers marked

### 🎯 Game Features
- **Interactive Tickets**: Click to mark/unmark numbers
- **Real-time Updates**: Live synchronization across all players
- **Claim History**: Track all claims and winners
- **Room Codes**: 6-digit codes for easy room joining
- **Player Management**: Host controls and player status tracking

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Socket.io Client** for real-time communication
- **CSS3** with custom styling (no external UI library)
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **Socket.io** for WebSocket connections
- **SQLite** for data persistence
- **TypeScript** for type safety

### Shared
- **TypeScript** types shared between frontend and backend

## Project Structure

```
housie-game/
├── backend/                 # Node.js backend server
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   ├── game/          # Game engine
│   │   ├── socket/        # Socket.io handlers
│   │   └── index.ts       # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Game/      # Game components
│   │   │   ├── Room/      # Room management
│   │   │   └── Common/    # Shared components
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
└── shared/                 # Shared TypeScript types
    ├── src/
    │   └── types/
    │       └── index.ts
    ├── package.json
    └── tsconfig.json
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (if this were a real git repo)
2. **Install dependencies** for all three packages:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install shared dependencies
cd ../shared
npm install
```

### Running the Application

1. **Start the backend server**:
```bash
cd backend
npm run dev
```
The server will start on `http://localhost:3001`

2. **Start the frontend** (in a new terminal):
```bash
cd frontend
npm start
```
The app will open on `http://localhost:3000`

3. **Build shared types** (optional, for development):
```bash
cd shared
npm run dev
```

## How to Play

### Creating a Room
1. Enter your name
2. Click "Create Room"
3. Configure room settings (name, max players, public/private)
4. Share the 6-digit room code with friends

### Joining a Room
1. Enter your name
2. Either browse public rooms or enter a room code directly
3. Click "Join Room"

### Game Flow
1. **Room Lobby**: Wait for players to join (minimum 2 required)
2. **Ticket Selection**: Each player selects up to 3 tickets
3. **Game Start**: Host starts the game
4. **Number Calling**: Host calls numbers one by one
5. **Marking Numbers**: Players click numbers on their tickets to mark them
6. **Making Claims**: Players click claim buttons when they complete patterns
7. **Validation**: System automatically validates claims
8. **Winning**: First valid claim for each pattern wins

### Housie Rules
- Each ticket has 15 numbers (5 per row) in a 3x9 grid
- Numbers are distributed by column (1-9, 10-19, 20-29, etc.)
- Players can only mark numbers that have been called
- First valid claim for each pattern wins
- Full House ends the game

## API Endpoints

### GET `/api/rooms`
Get list of public rooms

### GET `/api/rooms/:roomId`
Get room details by ID

### GET `/api/rooms/:roomId/can-join`
Check if room can be joined

### GET `/api/health`
Health check endpoint

## Socket.io Events

### Client → Server
- `create-room`: Create new game room
- `join-room`: Join existing room
- `leave-room`: Leave current room
- `start-game`: Start the game (host only)
- `call-number`: Call a number (host only)
- `make-claim`: Make a pattern claim
- `mark-number`: Mark/unmark number on ticket

### Server → Client
- `room-created`: Room created successfully
- `room-joined`: Successfully joined room
- `player-joined`: New player joined
- `player-left`: Player left room
- `game-started`: Game has started
- `number-called`: New number called
- `claim-made`: Player made a claim
- `claim-validated`: Claim validation result
- `game-finished`: Game completed
- `room-updated`: Room state updated
- `error`: Error message

## Game Logic

### Ticket Generation Algorithm
1. Each column gets numbers from its designated range
2. Each row must have exactly 5 numbers
3. Each column must have at least 1 number
4. Tickets are validated for uniqueness within room
5. Maximum 3 tickets per player

### Claim Validation
- Early Five: Any 5 numbers marked
- Lines: All 5 numbers in specific row marked
- Full House: All 15 numbers marked
- All marked numbers must be in called numbers
- First valid claim wins each pattern

## Development

### Building for Production
```bash
# Build shared types
cd shared && npm run build

# Build backend
cd ../backend && npm run build

# Build frontend
cd ../frontend && npm run build
```

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Contributing

This is a demonstration project showcasing:
- Real-time multiplayer functionality
- Complex game logic implementation
- Modern web development practices
- TypeScript usage across full stack

## License

MIT License - feel free to use this code for learning and development.