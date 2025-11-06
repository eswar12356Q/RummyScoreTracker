import { roomService } from '../services/roomService';

export class GameEngine {
  private numberPool: Map<string, number[]> = new Map(); // roomId -> available numbers

  // Initialize game for a room
  async initializeGame(roomId: string): Promise<void> {
    // Create pool of numbers 1-90
    const numbers = Array.from({ length: 90 }, (_, i) => i + 1);
    this.numberPool.set(roomId, numbers);
  }

  // Call a specific number (manual calling by host)
  async callNumber(roomId: string, number: number): Promise<{ calledNumbers: number[] } | null> {
    const room = await roomService.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status !== 'playing') {
      throw new Error('Game is not in playing state');
    }

    // Check if number has already been called
    if (room.calledNumbers.includes(number)) {
      throw new Error('Number has already been called');
    }

    // Check if number is in valid range
    if (number < 1 || number > 90) {
      throw new Error('Number must be between 1 and 90');
    }

    // Add number to called numbers
    room.calledNumbers.push(number);
    room.currentNumber = number;

    // Update room in database
    await roomService.updateRoom(room);

    return {
      calledNumbers: room.calledNumbers
    };
  }

  // Call a random number (automatic calling - not used in current implementation)
  async callRandomNumber(roomId: string): Promise<{ number: number; calledNumbers: number[] } | null> {
    const room = await roomService.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status !== 'playing') {
      throw new Error('Game is not in playing state');
    }

    // Get available numbers for this room
    let availableNumbers = this.numberPool.get(roomId);
    if (!availableNumbers) {
      await this.initializeGame(roomId);
      availableNumbers = this.numberPool.get(roomId)!;
    }

    // Filter out already called numbers
    availableNumbers = availableNumbers.filter(num => !room.calledNumbers.includes(num));

    if (availableNumbers.length === 0) {
      throw new Error('No more numbers available to call');
    }

    // Select random number
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const selectedNumber = availableNumbers[randomIndex];

    // Add to called numbers
    room.calledNumbers.push(selectedNumber);
    room.currentNumber = selectedNumber;

    // Update room in database
    await roomService.updateRoom(room);

    return {
      number: selectedNumber,
      calledNumbers: room.calledNumbers
    };
  }

  // End game and mark as finished
  async endGame(roomId: string): Promise<void> {
    const room = await roomService.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    room.status = 'finished';
    room.finishedAt = new Date();

    // Clean up number pool
    this.numberPool.delete(roomId);

    // Update room in database
    await roomService.updateRoom(room);
  }

  // Reset game to waiting state (for new game)
  async resetGame(roomId: string): Promise<void> {
    const room = await roomService.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    room.status = 'waiting';
    room.currentNumber = null;
    room.calledNumbers = [];
    room.startedAt = undefined;
    room.finishedAt = undefined;

    // Reset player tickets
    room.players.forEach(player => {
      player.tickets.forEach(ticket => {
        ticket.markedNumbers.clear();
      });
    });

    // Clear winning claims
    room.winningClaims = [];

    // Reinitialize number pool
    await this.initializeGame(roomId);

    // Update room in database
    await roomService.updateRoom(room);
  }

  // Get game statistics
  async getGameStats(roomId: string): Promise<{
    totalNumbersCalled: number;
    remainingNumbers: number;
    percentageComplete: number;
    gameDuration?: number; // in seconds
  }> {
    const room = await roomService.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const totalNumbersCalled = room.calledNumbers.length;
    const remainingNumbers = 90 - totalNumbersCalled;
    const percentageComplete = (totalNumbersCalled / 90) * 100;

    let gameDuration;
    if (room.startedAt) {
      const endTime = room.finishedAt || new Date();
      gameDuration = Math.floor((endTime.getTime() - room.startedAt.getTime()) / 1000);
    }

    return {
      totalNumbersCalled,
      remainingNumbers,
      percentageComplete,
      gameDuration
    };
  }

  // Get next suggested numbers (for host assistance)
  async getNextSuggestedNumbers(roomId: string, count: number = 5): Promise<number[]> {
    const room = await roomService.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    const availableNumbers = allNumbers.filter(num => !room.calledNumbers.includes(num));

    // Sort by column and suggest evenly distributed numbers
    const columnRanges = [
      [1, 9], [10, 19], [20, 29], [30, 39], [40, 49],
      [50, 59], [60, 69], [70, 79], [80, 90]
    ];

    const suggestions: number[] = [];
    const numbersPerColumn = Math.ceil(count / 9);

    for (const [min, max] of columnRanges) {
      const columnNumbers = availableNumbers.filter(num => num >= min && num <= max);
      const selectedFromColumn = columnNumbers
        .sort(() => Math.random() - 0.5) // Shuffle
        .slice(0, numbersPerColumn);

      suggestions.push(...selectedFromColumn);
    }

    return suggestions.slice(0, count);
  }

  // Validate game state consistency
  async validateGameState(roomId: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const room = await roomService.getRoom(roomId);
    if (!room) {
      return {
        isValid: false,
        issues: ['Room not found']
      };
    }

    const issues: string[] = [];

    // Check for duplicate called numbers
    const uniqueCalledNumbers = new Set(room.calledNumbers);
    if (uniqueCalledNumbers.size !== room.calledNumbers.length) {
      issues.push('Duplicate numbers in called numbers list');
    }

    // Check called number range
    const invalidNumbers = room.calledNumbers.filter(num => num < 1 || num > 90);
    if (invalidNumbers.length > 0) {
      issues.push(`Invalid numbers found: ${invalidNumbers.join(', ')}`);
    }

    // Check if current number is in called numbers
    if (room.currentNumber && !room.calledNumbers.includes(room.currentNumber)) {
      issues.push('Current number is not in called numbers list');
    }

    // Validate player tickets
    for (const player of room.players) {
      for (const ticket of player.tickets) {
        // Check marked numbers are actually on ticket
        const ticketNumbers = ticket.grid.flat().filter(num => num !== null) as number[];
        const invalidMarkedNumbers = Array.from(ticket.markedNumbers)
          .filter(num => !ticketNumbers.includes(num));

        if (invalidMarkedNumbers.length > 0) {
          issues.push(`Player ${player.name} has marked invalid numbers: ${invalidMarkedNumbers.join(', ')}`);
        }

        // Check marked numbers have been called
        const unmarkedCalledNumbers = Array.from(ticket.markedNumbers)
          .filter(num => !room.calledNumbers.includes(num));

        if (unmarkedCalledNumbers.length > 0) {
          issues.push(`Player ${player.name} has marked numbers that haven't been called: ${unmarkedCalledNumbers.join(', ')}`);
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  // Export game data for analysis/backup
  async exportGameData(roomId: string): Promise<{
    room: any;
    exportDate: Date;
    statistics: any;
  }> {
    const room = await roomService.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const statistics = await this.getGameStats(roomId);
    const validation = await this.validateGameState(roomId);

    return {
      room: {
        ...room,
        // Convert Sets to Arrays for JSON serialization
        players: room.players.map(player => ({
          ...player,
          tickets: player.tickets.map(ticket => ({
            ...ticket,
            markedNumbers: Array.from(ticket.markedNumbers)
          }))
        }))
      },
      exportDate: new Date(),
      statistics: {
        ...statistics,
        validation
      }
    };
  }

  // Clean up finished games (for maintenance)
  async cleanupFinishedGames(olderThanHours: number = 24): Promise<number> {
    // This would be implemented to clean up old finished games
    // For now, return 0 as placeholder
    return 0;
  }
}

export const gameEngine = new GameEngine();