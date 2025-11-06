import { StoredGame, GameState } from '../types';

const STORAGE_KEYS = {
  CURRENT_GAME: 'rummy-current-game',
  GAME_HISTORY: 'rummy-game-history',
  SETTINGS: 'rummy-settings',
} as const;

export const storageUtils = {
  // Current game storage
  saveCurrentGame: (gameState: GameState): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(gameState));
    } catch (error) {
      console.error('Failed to save current game:', error);
    }
  },

  loadCurrentGame: (): GameState | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
      if (!stored) return null;

      const game = JSON.parse(stored);
      // Convert date strings back to Date objects
      game.createdAt = new Date(game.createdAt);
      game.lastPlayed = new Date(game.lastPlayed);
      game.roundHistory = game.roundHistory.map((round: any) => ({
        ...round,
        timestamp: new Date(round.timestamp),
      }));

      return game;
    } catch (error) {
      console.error('Failed to load current game:', error);
      return null;
    }
  },

  clearCurrentGame: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
    } catch (error) {
      console.error('Failed to clear current game:', error);
    }
  },

  // Game history storage
  saveGameToHistory: (game: StoredGame): void => {
    try {
      const history = storageUtils.getGameHistory();
      history.push(game);

      // Keep only the last 50 games
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }

      localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save game to history:', error);
    }
  },

  getGameHistory: (): StoredGame[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
      if (!stored) return [];

      const games = JSON.parse(stored);
      // Convert date strings back to Date objects
      return games.map((game: any) => ({
        ...game,
        createdAt: new Date(game.createdAt),
        lastPlayed: new Date(game.lastPlayed),
        rounds: game.rounds.map((round: any) => ({
          ...round,
          timestamp: new Date(round.timestamp),
        })),
      }));
    } catch (error) {
      console.error('Failed to load game history:', error);
      return [];
    }
  },

  deleteGameFromHistory: (gameId: string): void => {
    try {
      const history = storageUtils.getGameHistory();
      const filteredHistory = history.filter(game => game.id !== gameId);
      localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Failed to delete game from history:', error);
    }
  },

  clearGameHistory: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.GAME_HISTORY);
    } catch (error) {
      console.error('Failed to clear game history:', error);
    }
  },

  // Settings storage
  saveSettings: (settings: any): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  loadSettings: (): any => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load settings:', error);
      return {};
    }
  },

  // Export/Import functionality
  exportGameHistory: (): string => {
    try {
      const history = storageUtils.getGameHistory();
      const dataStr = JSON.stringify(history, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `rummy-games-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return dataStr;
    } catch (error) {
      console.error('Failed to export game history:', error);
      throw error;
    }
  },

  importGameHistory: (jsonString: string): boolean => {
    try {
      const importedGames = JSON.parse(jsonString) as StoredGame[];

      // Validate the imported data
      if (!Array.isArray(importedGames)) {
        throw new Error('Invalid data format');
      }

      // Merge with existing history
      const existingHistory = storageUtils.getGameHistory();
      const mergedHistory = [...existingHistory, ...importedGames];

      // Remove duplicates and sort by date
      const uniqueGames = mergedHistory.filter((game, index, arr) =>
        arr.findIndex(g => g.id === game.id) === index
      ).sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime());

      localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(uniqueGames));
      return true;
    } catch (error) {
      console.error('Failed to import game history:', error);
      return false;
    }
  },

  // Storage management
  getStorageUsage: (): { used: number; available: number; percentage: number } => {
    try {
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Estimate 5MB local storage limit
      const available = 5 * 1024 * 1024; // 5MB in bytes
      const percentage = (used / available) * 100;

      return { used, available, percentage };
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  },

  clearAllData: (): void => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  },
};