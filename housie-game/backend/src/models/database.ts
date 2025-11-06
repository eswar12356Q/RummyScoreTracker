import sqlite3 from 'sqlite3';
import { promisify } from 'util';

export class Database {
  private db: sqlite3.Database;

  constructor(dbPath: string = './housie.db') {
    this.db = new sqlite3.Database(dbPath);
  }

  // Initialize database with all required tables
  async initialize(): Promise<void> {
    const runAsync = promisify(this.db.run.bind(this.db));

    try {
      // Create rooms table
      await runAsync(`
        CREATE TABLE IF NOT EXISTS rooms (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          host_id TEXT NOT NULL,
          max_players INTEGER DEFAULT 10,
          status TEXT DEFAULT 'waiting',
          is_public BOOLEAN DEFAULT TRUE,
          current_number INTEGER,
          called_numbers TEXT, -- JSON array
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          started_at DATETIME,
          finished_at DATETIME
        )
      `);

      // Create players table
      await runAsync(`
        CREATE TABLE IF NOT EXISTS players (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          room_id TEXT NOT NULL,
          is_host BOOLEAN DEFAULT FALSE,
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_connected BOOLEAN DEFAULT TRUE,
          FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
        )
      `);

      // Create tickets table
      await runAsync(`
        CREATE TABLE IF NOT EXISTS tickets (
          id TEXT PRIMARY KEY,
          player_id TEXT NOT NULL,
          room_id TEXT NOT NULL,
          grid_data TEXT NOT NULL, -- JSON string of 3x9 grid
          marked_numbers TEXT, -- JSON array of marked numbers
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
          FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
          UNIQUE(player_id, room_id, id)
        )
      `);

      // Create claims table
      await runAsync(`
        CREATE TABLE IF NOT EXISTS claims (
          id TEXT PRIMARY KEY,
          player_id TEXT NOT NULL,
          room_id TEXT NOT NULL,
          ticket_id TEXT NOT NULL,
          claim_type TEXT NOT NULL,
          claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_valid BOOLEAN DEFAULT FALSE,
          verified_numbers TEXT, -- JSON array
          FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
          FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
          FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
        )
      `);

      // Create indexes for better performance
      await runAsync('CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id)');
      await runAsync('CREATE INDEX IF NOT EXISTS idx_tickets_player_id ON tickets(player_id)');
      await runAsync('CREATE INDEX IF NOT EXISTS idx_tickets_room_id ON tickets(room_id)');
      await runAsync('CREATE INDEX IF NOT EXISTS idx_claims_room_id ON claims(room_id)');
      await runAsync('CREATE INDEX IF NOT EXISTS idx_claims_player_id ON claims(player_id)');

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  // Helper method to run queries asynchronously
  async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  // Helper method to get single row
  async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Helper method to get all rows
  async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Close database connection
  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// Export singleton instance
export const database = new Database();