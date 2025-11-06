export type GameType = 101 | 201 | 301;

export interface Player {
  id: string;
  name: string;
  currentScore: number;
  roundScores: number[];
  isActive: boolean;
  isEliminated: boolean;
  eliminationRound?: number;
  hasRejoined: boolean;
  rejoinScore?: number;
}

export interface Round {
  roundNumber: number;
  playerScores: { [playerId: string]: number };
  droppedPlayers: string[];
  roundWinner?: string;
  timestamp: Date;
}

export interface GameState {
  id: string;
  gameType: GameType;
  players: Player[];
  currentRound: number;
  isGameActive: boolean;
  roundHistory: Round[];
  gameStarted: boolean;
  createdAt: Date;
  lastPlayed: Date;
  isCompleted: boolean;
}

export interface StoredGame {
  id: string;
  gameType: GameType;
  players: Player[];
  rounds: Round[];
  createdAt: Date;
  lastPlayed: Date;
  isCompleted: boolean;
}

export interface GameSetupConfig {
  gameType: GameType;
  playerCount: number;
  useCustomNames: boolean;
  playerNames?: string[];
}

export interface ScoreEntry {
  playerId: string;
  score: number;
  isDrop?: boolean;
  isWinner?: boolean;
}

export interface PlayerAction {
  type: 'drop' | 'eliminate' | 'rejoin';
  playerId: string;
  score?: number;
  round?: number;
}