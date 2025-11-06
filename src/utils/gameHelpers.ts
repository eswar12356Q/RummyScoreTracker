import { Player, GameType, Round } from '../types';

export const DROPOUT_PENALTY = 20;

export const gameHelpers = {
  // Player calculations
  calculateTotalScore: (player: Player): number => {
    return player.roundScores.reduce((sum, score) => sum + score, 0);
  },

  isActivePlayer: (player: Player): boolean => {
    return player.isActive && !player.isEliminated;
  },

  getActivePlayers: (players: Player[]): Player[] => {
    return players.filter(gameHelpers.isActivePlayer);
  },

  getEliminatedPlayers: (players: Player[]): Player[] => {
    return players.filter(p => p.isEliminated);
  },

  // Game logic
  isPlayerEliminated: (player: Player, gameType: GameType): boolean => {
    return player.currentScore >= gameType;
  },

  calculateRejoinScore: (players: Player[]): number => {
    const activePlayers = gameHelpers.getActivePlayers(players);
    if (activePlayers.length < 2) return 0;

    const scores = activePlayers.map(p => p.currentScore).sort((a, b) => b - a);
    return scores[1] || 0;
  },

  getGameWinner: (players: Player[]): Player | null => {
    const activePlayers = gameHelpers.getActivePlayers(players);

    if (activePlayers.length === 1) {
      return activePlayers[0];
    }

    // If no active players, find the player with the lowest score
    if (activePlayers.length === 0) {
      const nonEliminatedPlayers = players.filter(p => !p.hasRejoined);
      if (nonEliminatedPlayers.length > 0) {
        return nonEliminatedPlayers.reduce((winner, player) =>
          player.currentScore < winner.currentScore ? player : winner
        );
      }
    }

    return null;
  },

  // Round management
  formatScore: (score: number): string => {
    return score.toString();
  },

  getScoreDisplay: (score: number, isDrop: boolean, isWinner: boolean): string => {
    if (isWinner) return '0★';
    if (isDrop) return `${score}↓`;
    return score.toString();
  },

  // Table display
  generateTableData: (players: Player[], rounds: Round[]) => {

    // Create rows for each round
    const roundRows = rounds.map((round, index) => {
      const row: { [key: string]: string | number } = {
        round: index + 1,
      };

      players.forEach(player => {
        const score = round.playerScores[player.id] || 0;
        const isDrop = round.droppedPlayers.includes(player.id);
        const isWinner = round.roundWinner === player.id;

        row[player.id] = gameHelpers.getScoreDisplay(score, isDrop, isWinner);
      });

      return row;
    });

    // Add total row
    const totalRow: { [key: string]: string | number } = {
      round: 'Total',
    };

    players.forEach(player => {
      const total = player.roundScores.reduce((sum, score) => sum + score, 0);
      const isEliminated = player.isEliminated;

      totalRow[player.id] = isEliminated ? `${total}×` : total.toString();
    });

    return {
      headers: ['Round', ...players.map(p => p.name)],
      rows: [...roundRows, totalRow],
      players,
    };
  },

  // Validation
  validateScoreInput: (value: string): { isValid: boolean; score?: number; error?: string } => {
    if (!value || value.trim() === '') {
      return { isValid: false, error: 'Score is required' };
    }

    const score = parseInt(value, 10);

    if (isNaN(score)) {
      return { isValid: false, error: 'Please enter a valid number' };
    }

    if (score < 0) {
      return { isValid: false, error: 'Score cannot be negative' };
    }

    if (score > 999) {
      return { isValid: false, error: 'Score cannot exceed 999' };
    }

    return { isValid: true, score };
  },

  validatePlayerName: (name: string, existingNames: string[]): { isValid: boolean; error?: string } => {
    if (!name || name.trim() === '') {
      return { isValid: false, error: 'Player name is required' };
    }

    const trimmedName = name.trim();

    if (trimmedName.length > 20) {
      return { isValid: false, error: 'Player name cannot exceed 20 characters' };
    }

    if (existingNames.includes(trimmedName)) {
      return { isValid: false, error: 'Player name must be unique' };
    }

    return { isValid: true };
  },

  // Game status
  getGameStatus: (players: Player[], gameType: GameType): {
    isCompleted: boolean;
    winner: Player | null;
    activePlayerCount: number;
    eliminatedPlayerCount: number;
  } => {
    const activePlayers = gameHelpers.getActivePlayers(players);
    const eliminatedPlayers = gameHelpers.getEliminatedPlayers(players);
    const winner = gameHelpers.getGameWinner(players);

    // Check if any player has reached or exceeded the game type score
    const hasPlayerReachedTarget = players.some(p => p.currentScore >= gameType);

    return {
      isCompleted: activePlayers.length <= 1 || hasPlayerReachedTarget,
      winner,
      activePlayerCount: activePlayers.length,
      eliminatedPlayerCount: eliminatedPlayers.length,
    };
  },

  // Export helpers
  exportGameAsText: (players: Player[], rounds: Round[]): string => {
    const tableData = gameHelpers.generateTableData(players, rounds);
    const date = new Date().toLocaleDateString();

    let output = `Rummy Score Tracker Game\n`;
    output += `Date: ${date}\n`;
    output += `Players: ${players.map(p => p.name).join(', ')}\n`;
    output += `Rounds: ${rounds.length}\n\n`;

    // Generate table
    const headers = tableData.headers.join(' | ');
    output += headers + '\n';
    output += '='.repeat(headers.length) + '\n';

    tableData.rows.forEach(row => {
      const values = tableData.headers.map(header => String(row[header] || '-')).join(' | ');
      output += values + '\n';
    });

    output += '\nLegend:\n';
    output += '★ = Round Winner\n';
    output += '↓ = Dropped (20 points)\n';
    output += '× = Eliminated\n';

    return output;
  },
};