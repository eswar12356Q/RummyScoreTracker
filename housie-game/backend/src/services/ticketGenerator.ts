import { Ticket, COLUMN_RANGES, TICKET_ROWS, TICKET_COLUMNS, NUMBERS_PER_ROW } from '../../../shared/src/types';
import { v4 as uuidv4 } from 'uuid';

export class TicketGenerator {

  // Generate a single housie ticket following all rules
  generateTicket(): (number | null)[][] {
    const ticket: (number | null)[][] = Array(TICKET_ROWS).fill(null).map(() => Array(TICKET_COLUMNS).fill(null));

    // Generate numbers for each column
    for (let col = 0; col < TICKET_COLUMNS; col++) {
      const [min, max] = COLUMN_RANGES[col];
      const columnNumbers = this.generateColumnNumbers(min, max);

      // Distribute numbers in this column
      const positions = this.getRandomPositionsForColumn(columnNumbers.length);
      positions.forEach((row, index) => {
        ticket[row][col] = columnNumbers[index];
      });
    }

    // Validate ticket rules
    if (!this.validateTicketStructure(ticket)) {
      // If validation fails, generate again
      return this.generateTicket();
    }

    return ticket;
  }

  // Generate numbers for a single column
  private generateColumnNumbers(min: number, max: number): number[] {
    const range = max - min + 1;
    const count = Math.min(Math.floor(Math.random() * 3) + 1, range); // 1-3 numbers per column

    const numbers: number[] = [];
    const used = new Set<number>();

    while (numbers.length < count) {
      const num = Math.floor(Math.random() * range) + min;
      if (!used.has(num)) {
        used.add(num);
        numbers.push(num);
      }
    }

    return numbers.sort((a, b) => a - b);
  }

  // Get random row positions for column numbers
  private getRandomPositionsForColumn(count: number): number[] {
    const positions = [0, 1, 2];

    // Shuffle and take required number of positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    return positions.slice(0, count);
  }

  // Validate ticket structure according to housie rules
  private validateTicketStructure(ticket: (number | null)[][]): boolean {
    // Check each row has exactly 5 numbers
    for (let row = 0; row < TICKET_ROWS; row++) {
      const numberCount = ticket[row].filter(cell => cell !== null).length;
      if (numberCount !== NUMBERS_PER_ROW) {
        return false;
      }
    }

    // Check each column has at least 1 number
    for (let col = 0; col < TICKET_COLUMNS; col++) {
      const hasNumber = ticket.some(row => row[col] !== null);
      if (!hasNumber) {
        return false;
      }
    }

    // Check column ranges
    for (let col = 0; col < TICKET_COLUMNS; col++) {
      const [min, max] = COLUMN_RANGES[col];
      for (let row = 0; row < TICKET_ROWS; row++) {
        const num = ticket[row][col];
        if (num !== null && (num < min || num > max)) {
          return false;
        }
      }
    }

    return true;
  }

  // Create ticket object with metadata
  createTicket(playerId: string, roomId: string): Ticket {
    const grid = this.generateTicket();
    const flatNumbers = grid.flat().filter(num => num !== null) as number[];

    return {
      id: uuidv4(),
      playerId,
      roomId,
      grid,
      markedNumbers: new Set<number>(),
      isGenerated: true
    };
  }

  // Generate multiple unique tickets for a player
  generateMultipleTickets(playerId: string, roomId: string, count: number): Ticket[] {
    const tickets: Ticket[] = [];
    const seenGrids = new Set<string>();

    while (tickets.length < count) {
      const ticket = this.createTicket(playerId, roomId);
      const gridSignature = this.gridToSignature(ticket.grid);

      // Ensure uniqueness within this batch
      if (!seenGrids.has(gridSignature)) {
        seenGrids.add(gridSignature);
        tickets.push(ticket);
      }
    }

    return tickets;
  }

  // Convert grid to string signature for uniqueness checking
  private gridToSignature(grid: (number | null)[][]): string {
    return grid.map(row =>
      row.map(cell => cell === null ? 'null' : cell.toString()).join(',')
    ).join('|');
  }

  // Check if a ticket grid is unique compared to existing tickets
  async isTicketUnique(grid: (number | null)[][], existingTickets: Ticket[]): Promise<boolean> {
    const newSignature = this.gridToSignature(grid);

    for (const ticket of existingTickets) {
      if (this.gridToSignature(ticket.grid) === newSignature) {
        return false;
      }
    }

    return true;
  }

  // Generate ticket ensuring uniqueness across room
  async generateUniqueTicket(playerId: string, roomId: string, existingTickets: Ticket[]): Promise<Ticket> {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const ticket = this.createTicket(playerId, roomId);

      if (await this.isTicketUnique(ticket.grid, existingTickets)) {
        return ticket;
      }

      attempts++;
    }

    // If we couldn't generate unique ticket after many attempts, throw error
    throw new Error('Unable to generate unique ticket after maximum attempts');
  }

  // Verify a ticket is valid according to housie rules
  static validateTicket(ticket: Ticket): boolean {
    const { grid } = ticket;

    // Check dimensions
    if (grid.length !== TICKET_ROWS || grid.some(row => row.length !== TICKET_COLUMNS)) {
      return false;
    }

    // Check each row has exactly 5 numbers
    for (let row = 0; row < TICKET_ROWS; row++) {
      const numberCount = grid[row].filter(cell => cell !== null).length;
      if (numberCount !== NUMBERS_PER_ROW) {
        return false;
      }
    }

    // Check each column has at least 1 number
    for (let col = 0; col < TICKET_COLUMNS; col++) {
      const hasNumber = grid.some(row => row[col] !== null);
      if (!hasNumber) {
        return false;
      }
    }

    // Check number ranges and duplicates
    const allNumbers = new Set<number>();
    for (let col = 0; col < TICKET_COLUMNS; col++) {
      const [min, max] = COLUMN_RANGES[col];
      const columnNumbers: number[] = [];

      for (let row = 0; row < TICKET_ROWS; row++) {
        const num = grid[row][col];
        if (num !== null) {
          // Check range
          if (num < min || num > max) {
            return false;
          }

          // Check for duplicates in column
          if (columnNumbers.includes(num)) {
            return false;
          }

          columnNumbers.push(num);

          // Check for global duplicates
          if (allNumbers.has(num)) {
            return false;
          }

          allNumbers.add(num);
        }
      }
    }

    return true;
  }
}

export const ticketGenerator = new TicketGenerator();