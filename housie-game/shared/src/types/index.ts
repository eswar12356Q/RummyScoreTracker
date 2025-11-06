// Game data models for multiplayer housie/tambola game

export interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  currentNumber: number | null;
  calledNumbers: number[];
  winningClaims: Claim[];
  isPublic: boolean;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
}

export interface Player {
  id: string;
  name: string;
  roomId: string;
  tickets: Ticket[];
  isHost: boolean;
  joinedAt: Date;
  isConnected: boolean;
}

export interface Ticket {
  id: string;
  playerId: string;
  roomId: string;
  grid: (number | null)[][];
  markedNumbers: Set<number>;
  isGenerated: boolean;
}

export interface Claim {
  id: string;
  playerId: string;
  roomId: string;
  type: 'early_five' | 'first_line' | 'second_line' | 'third_line' | 'full_house';
  claimedAt: Date;
  isValid: boolean;
  verifiedNumbers: number[];
}

export type ClaimType = 'early_five' | 'first_line' | 'second_line' | 'third_line' | 'full_house';

export interface RoomSettings {
  maxPlayers: number;
  isPublic: boolean;
  autoValidateClaims: boolean;
  claimTimeLimit?: number; // in seconds
}

export interface CreateRoomRequest {
  roomName: string;
  playerName: string;
  settings: RoomSettings;
}

export interface JoinRoomRequest {
  roomId: string;
  playerName: string;
}

export interface NumberCallRequest {
  roomId: string;
  number: number;
}

export interface ClaimRequest {
  roomId: string;
  playerId: string;
  claimType: ClaimType;
  ticketId: string;
}

// Socket event types
export interface SocketEvents {
  // Client to Server
  'create-room': CreateRoomRequest;
  'join-room': JoinRoomRequest;
  'leave-room': { roomId: string; playerId: string };
  'start-game': { roomId: string };
  'call-number': NumberCallRequest;
  'make-claim': ClaimRequest;
  'mark-number': { roomId: string; playerId: string; ticketId: string; number: number };

  // Server to Client
  'room-created': { room: GameRoom; player: Player };
  'room-joined': { room: GameRoom; player: Player };
  'room-left': { playerId: string };
  'player-joined': { player: Player };
  'player-left': { playerId: string };
  'game-started': { calledNumbers: number[] };
  'number-called': { number: number; calledNumbers: number[] };
  'claim-made': { claim: Claim; player: Player };
  'claim-validated': { claim: Claim; isValid: boolean; message: string };
  'game-finished': { winners: Array<{ player: Player; claims: Claim[] }> };
  'error': { message: string; code?: string };
  'room-updated': { room: GameRoom };
}

// Ticket generation constants
export const TICKET_ROWS = 3;
export const TICKET_COLUMNS = 9;
export const NUMBERS_PER_ROW = 5;
export const MIN_NUMBERS_PER_COLUMN = 1;
export const MAX_NUMBERS_PER_COLUMN = 3;
export const TOTAL_NUMBERS = 90;

// Column ranges for housie tickets
export const COLUMN_RANGES = [
  [1, 9],     // Column 1: 1-9
  [10, 19],   // Column 2: 10-19
  [20, 29],   // Column 3: 20-29
  [30, 39],   // Column 4: 30-39
  [40, 49],   // Column 5: 40-49
  [50, 59],   // Column 6: 50-59
  [60, 69],   // Column 7: 60-69
  [70, 79],   // Column 8: 70-79
  [80, 90],   // Column 9: 80-90
];

// Pattern validation functions signature
export type PatternValidator = (ticket: Ticket, calledNumbers: number[]) => boolean;

// Game statistics
export interface GameStats {
  totalNumbersCalled: number;
  averageCallTime: number; // in seconds
  claimsPerPattern: Record<ClaimType, number>;
  gameDuration: number; // in seconds
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RoomListResponse {
  rooms: Array<{
    id: string;
    name: string;
    playerCount: number;
    maxPlayers: number;
    hostName: string;
    status: 'waiting' | 'playing' | 'finished';
  }>;
}