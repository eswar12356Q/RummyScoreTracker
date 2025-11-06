import { create } from 'zustand';
import { GameState, Player, Round, GameSetupConfig } from '../types';

interface GameStore extends GameState {
  // Actions
  initializeGame: (config: GameSetupConfig) => void;
  addRound: (roundScores: { [playerId: string]: number }) => void;
  dropPlayer: (playerId: string) => void;
  eliminatePlayer: (playerId: string) => void;
  rejoinPlayer: (playerId: string) => void;
  setRoundWinner: (playerId: string) => void;
  resetGame: () => void;
  loadGame: (gameId: string) => void;
  deleteGame: (gameId: string) => void;
  getAllGames: () => GameState[];
  updatePlayerName: (playerId: string, name: string) => void;
}

const DROPOUT_PENALTY = 20;

const createPlayer = (id: string, name: string): Player => ({
  id,
  name,
  currentScore: 0,
  roundScores: [],
  isActive: true,
  isEliminated: false,
  hasRejoined: false,
});

const calculateSecondHighestScore = (players: Player[]): number => {
  const activePlayers = players.filter(p => p.isActive && !p.isEliminated);
  if (activePlayers.length < 2) return 0;

  const scores = activePlayers.map(p => p.currentScore).sort((a, b) => b - a);
  return scores[1] || 0;
};

export const useGameStore = create<GameStore>()((set, get) => ({
      // Initial state
      id: '',
      gameType: 101,
      players: [],
      currentRound: 1,
      isGameActive: false,
      roundHistory: [],
      gameStarted: false,
      createdAt: new Date(),
      lastPlayed: new Date(),
      isCompleted: false,

      initializeGame: (config: GameSetupConfig) => {
        const players: Player[] = [];

        for (let i = 0; i < config.playerCount; i++) {
          const name = config.useCustomNames && config.playerNames?.[i]
            ? config.playerNames[i]
            : `Player ${i + 1}`;
          players.push(createPlayer(`player-${i}`, name));
        }

        const gameId = `game-${Date.now()}`;

        set({
          id: gameId,
          gameType: config.gameType,
          players,
          currentRound: 1,
          isGameActive: true,
          roundHistory: [],
          gameStarted: true,
          createdAt: new Date(),
          lastPlayed: new Date(),
          isCompleted: false,
        });
      },

      addRound: (roundScores: { [playerId: string]: number }) => {
        const state = get();
        const updatedPlayers = state.players.map(player => {
          if (!player.isActive || player.isEliminated) return player;

          const score = roundScores[player.id] || 0;
          const newCurrentScore = player.currentScore + score;
          const newRoundScores = [...player.roundScores, score];

          // Check for elimination
          const isEliminated = newCurrentScore >= state.gameType;

          return {
            ...player,
            currentScore: newCurrentScore,
            roundScores: newRoundScores,
            isEliminated,
            isActive: !isEliminated,
            eliminationRound: isEliminated ? state.currentRound : player.eliminationRound,
          };
        });

        const newRound: Round = {
          roundNumber: state.currentRound,
          playerScores: roundScores,
          droppedPlayers: [],
          timestamp: new Date(),
        };

        const activePlayerCount = updatedPlayers.filter(p => p.isActive && !p.isEliminated).length;
        const isCompleted = activePlayerCount <= 1;

        set({
          players: updatedPlayers,
          roundHistory: [...state.roundHistory, newRound],
          currentRound: state.currentRound + 1,
          lastPlayed: new Date(),
          isCompleted,
        });
      },

      dropPlayer: (playerId: string) => {
        const state = get();
        const updatedPlayers = state.players.map(player => {
          if (player.id !== playerId) return player;

          const newCurrentScore = player.currentScore + DROPOUT_PENALTY;
          const newRoundScores = [...player.roundScores, DROPOUT_PENALTY];

          return {
            ...player,
            currentScore: newCurrentScore,
            roundScores: newRoundScores,
          };
        });

        // Update the last round with the dropped player
        const updatedHistory = [...state.roundHistory];
        if (updatedHistory.length > 0) {
          const lastRound = updatedHistory[updatedHistory.length - 1];
          lastRound.droppedPlayers.push(playerId);
        }

        set({
          players: updatedPlayers,
          roundHistory: updatedHistory,
          lastPlayed: new Date(),
        });
      },

      eliminatePlayer: (playerId: string) => {
        const state = get();
        const updatedPlayers = state.players.map(player => {
          if (player.id !== playerId) return player;

          return {
            ...player,
            isEliminated: true,
            isActive: false,
            eliminationRound: state.currentRound - 1,
          };
        });

        set({
          players: updatedPlayers,
          lastPlayed: new Date(),
        });
      },

      rejoinPlayer: (playerId: string) => {
        const state = get();
        const rejoinScore = calculateSecondHighestScore(state.players);

        const updatedPlayers = state.players.map(player => {
          if (player.id !== playerId) return player;

          return {
            ...player,
            isActive: true,
            isEliminated: false,
            hasRejoined: true,
            rejoinScore,
            currentScore: rejoinScore,
          };
        });

        set({
          players: updatedPlayers,
          lastPlayed: new Date(),
        });
      },

      setRoundWinner: (playerId: string) => {
        const state = get();
        const updatedHistory = [...state.roundHistory];

        if (updatedHistory.length > 0) {
          const lastRound = updatedHistory[updatedHistory.length - 1];
          lastRound.roundWinner = playerId;

          // Ensure winner gets 0 points for this round
          const updatedPlayers = state.players.map(player => {
            if (player.id === playerId && player.roundScores.length > 0) {
              const newRoundScores = [...player.roundScores];
              newRoundScores[newRoundScores.length - 1] = 0;

              // Recalculate current score
              const newCurrentScore = newRoundScores.reduce((sum, score) => sum + score, 0);

              return {
                ...player,
                roundScores: newRoundScores,
                currentScore: newCurrentScore,
              };
            }
            return player;
          });

          set({
            players: updatedPlayers,
            roundHistory: updatedHistory,
            lastPlayed: new Date(),
          });
        }
      },

      resetGame: () => {
        set({
          id: '',
          gameType: 101,
          players: [],
          currentRound: 1,
          isGameActive: false,
          roundHistory: [],
          gameStarted: false,
          createdAt: new Date(),
          lastPlayed: new Date(),
          isCompleted: false,
        });
      },

      loadGame: (gameId: string) => {
        // This would load from a stored games collection
        // For now, we'll implement basic functionality
        console.log('Loading game:', gameId);
      },

      deleteGame: (gameId: string) => {
        // This would delete from stored games collection
        console.log('Deleting game:', gameId);
      },

      getAllGames: () => {
        // This would return all stored games
        // For now, return current game if it exists
        const state = get();
        return state.gameStarted ? [state] : [];
      },

      updatePlayerName: (playerId: string, name: string) => {
        const state = get();
        const updatedPlayers = state.players.map(player =>
          player.id === playerId ? { ...player, name } : player
        );

        set({ players: updatedPlayers });
      },
    })
);