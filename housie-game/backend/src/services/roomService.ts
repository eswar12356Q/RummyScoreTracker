import { GameRoom, Player, RoomSettings, CreateRoomRequest, JoinRoomRequest } from '../../../shared/src/types';
import { database } from '../models/database';
import { v4 as uuidv4 } from 'uuid';
import { ShortUniqueId } from 'short-unique-id';

const uid = new ShortUniqueId({ length: 6 });

export class RoomService {
  // Create a new game room
  async createRoom(request: CreateRoomRequest): Promise<{ room: GameRoom; player: Player }> {
    const roomId = uid.rnd();
    const playerId = uuidv4();
    const now = new Date();

    // Create room
    const room: GameRoom = {
      id: roomId,
      name: request.roomName,
      hostId: playerId,
      players: [],
      maxPlayers: request.settings.maxPlayers,
      status: 'waiting',
      currentNumber: null,
      calledNumbers: [],
      winningClaims: [],
      isPublic: request.settings.isPublic,
      createdAt: now
    };

    // Create host player
    const player: Player = {
      id: playerId,
      name: request.playerName,
      roomId: roomId,
      tickets: [],
      isHost: true,
      joinedAt: now,
      isConnected: true
    };

    room.players.push(player);

    // Save to database
    await this.saveRoom(room);
    await this.savePlayer(player);

    return { room, player };
  }

  // Join an existing room
  async joinRoom(request: JoinRoomRequest): Promise<{ room: GameRoom; player: Player }> {
    const room = await this.getRoom(request.roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status !== 'waiting') {
      throw new Error('Game has already started');
    }

    if (room.players.length >= room.maxPlayers) {
      throw new Error('Room is full');
    }

    const playerId = uuidv4();
    const now = new Date();

    const player: Player = {
      id: playerId,
      name: request.playerName,
      roomId: request.roomId,
      tickets: [],
      isHost: false,
      joinedAt: now,
      isConnected: true
    };

    room.players.push(player);

    // Save to database
    await this.savePlayer(player);
    await this.updateRoom(room);

    return { room, player };
  }

  // Leave a room
  async leaveRoom(roomId: string, playerId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    if (!room) {
      return;
    }

    // Remove player from room
    room.players = room.players.filter(p => p.id !== playerId);

    // If host leaves, promote another player
    if (room.hostId === playerId && room.players.length > 0) {
      const newHost = room.players[0];
      newHost.isHost = true;
      room.hostId = newHost.id;
      await this.updatePlayer(newHost);
    }

    // If no players left, delete room
    if (room.players.length === 0) {
      await this.deleteRoom(roomId);
    } else {
      await this.updateRoom(room);
    }

    // Delete player from database
    await this.deletePlayer(playerId);
  }

  // Get room by ID
  async getRoom(roomId: string): Promise<GameRoom | null> {
    try {
      const row = await database.get(
        'SELECT * FROM rooms WHERE id = ?',
        [roomId]
      );

      if (!row) {
        return null;
      }

      const players = await this.getRoomPlayers(roomId);
      const winningClaims = await this.getRoomClaims(roomId);

      return {
        id: row.id,
        name: row.name,
        hostId: row.host_id,
        players,
        maxPlayers: row.max_players,
        status: row.status,
        currentNumber: row.current_number,
        calledNumbers: row.called_numbers ? JSON.parse(row.called_numbers) : [],
        winningClaims,
        isPublic: Boolean(row.is_public),
        createdAt: new Date(row.created_at),
        startedAt: row.started_at ? new Date(row.started_at) : undefined,
        finishedAt: row.finished_at ? new Date(row.finished_at) : undefined
      };
    } catch (error) {
      console.error('Error getting room:', error);
      return null;
    }
  }

  // Get all public rooms
  async getPublicRooms(): Promise<GameRoom[]> {
    try {
      const rows = await database.all(
        'SELECT * FROM rooms WHERE is_public = 1 AND status != "finished" ORDER BY created_at DESC'
      );

      const rooms: GameRoom[] = [];
      for (const row of rows) {
        const players = await this.getRoomPlayers(row.id);
        const winningClaims = await this.getRoomClaims(row.id);

        rooms.push({
          id: row.id,
          name: row.name,
          hostId: row.host_id,
          players,
          maxPlayers: row.max_players,
          status: row.status,
          currentNumber: row.current_number,
          calledNumbers: row.called_numbers ? JSON.parse(row.called_numbers) : [],
          winningClaims,
          isPublic: Boolean(row.is_public),
          createdAt: new Date(row.created_at),
          startedAt: row.started_at ? new Date(row.started_at) : undefined,
          finishedAt: row.finished_at ? new Date(row.finished_at) : undefined
        });
      }

      return rooms;
    } catch (error) {
      console.error('Error getting public rooms:', error);
      return [];
    }
  }

  // Start game in room
  async startGame(roomId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status !== 'waiting') {
      throw new Error('Game has already started');
    }

    if (room.players.length < 2) {
      throw new Error('At least 2 players required to start');
    }

    room.status = 'playing';
    room.startedAt = new Date();
    room.calledNumbers = [];

    await this.updateRoom(room);
  }

  // Update room
  async updateRoom(room: GameRoom): Promise<void> {
    await database.run(
      `UPDATE rooms SET
       status = ?,
       current_number = ?,
       called_numbers = ?,
       started_at = ?,
       finished_at = ?
       WHERE id = ?`,
      [
        room.status,
        room.currentNumber,
        JSON.stringify(room.calledNumbers),
        room.startedAt?.toISOString(),
        room.finishedAt?.toISOString(),
        room.id
      ]
    );
  }

  // Save room to database
  private async saveRoom(room: GameRoom): Promise<void> {
    await database.run(
      `INSERT INTO rooms (
        id, name, host_id, max_players, status, is_public,
        current_number, called_numbers, created_at, started_at, finished_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        room.id,
        room.name,
        room.hostId,
        room.maxPlayers,
        room.status,
        room.isPublic ? 1 : 0,
        room.currentNumber,
        JSON.stringify(room.calledNumbers),
        room.createdAt.toISOString(),
        room.startedAt?.toISOString(),
        room.finishedAt?.toISOString()
      ]
    );
  }

  // Save player to database
  private async savePlayer(player: Player): Promise<void> {
    await database.run(
      `INSERT INTO players (
        id, name, room_id, is_host, joined_at, is_connected
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        player.id,
        player.name,
        player.roomId,
        player.isHost ? 1 : 0,
        player.joinedAt.toISOString(),
        player.isConnected ? 1 : 0
      ]
    );
  }

  // Update player
  async updatePlayer(player: Player): Promise<void> {
    await database.run(
      `UPDATE players SET
       name = ?,
       is_host = ?,
       is_connected = ?
       WHERE id = ?`,
      [
        player.name,
        player.isHost ? 1 : 0,
        player.isConnected ? 1 : 0,
        player.id
      ]
    );
  }

  // Delete player from database
  private async deletePlayer(playerId: string): Promise<void> {
    await database.run('DELETE FROM players WHERE id = ?', [playerId]);
  }

  // Delete room from database
  private async deleteRoom(roomId: string): Promise<void> {
    await database.run('DELETE FROM rooms WHERE id = ?', [roomId]);
  }

  // Get all players in a room
  private async getRoomPlayers(roomId: string): Promise<Player[]> {
    const rows = await database.all(
      'SELECT * FROM players WHERE room_id = ? ORDER BY joined_at ASC',
      [roomId]
    );

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      roomId: row.room_id,
      tickets: [], // Will be loaded separately if needed
      isHost: Boolean(row.is_host),
      joinedAt: new Date(row.joined_at),
      isConnected: Boolean(row.is_connected)
    }));
  }

  // Get all claims in a room
  private async getRoomClaims(roomId: string): Promise<any[]> {
    const rows = await database.all(
      'SELECT * FROM claims WHERE room_id = ? ORDER BY claimed_at ASC',
      [roomId]
    );

    return rows.map(row => ({
      id: row.id,
      playerId: row.player_id,
      roomId: row.room_id,
      ticketId: row.ticket_id,
      type: row.claim_type,
      claimedAt: new Date(row.claimed_at),
      isValid: Boolean(row.is_valid),
      verifiedNumbers: row.verified_numbers ? JSON.parse(row.verified_numbers) : []
    }));
  }

  // Update player connection status
  async updatePlayerConnection(playerId: string, isConnected: boolean): Promise<void> {
    await database.run(
      'UPDATE players SET is_connected = ? WHERE id = ?',
      [isConnected ? 1 : 0, playerId]
    );
  }

  // Check if room exists and is joinable
  async canJoinRoom(roomId: string): Promise<{ exists: boolean; canJoin: boolean; reason?: string }> {
    const room = await this.getRoom(roomId);

    if (!room) {
      return { exists: false, canJoin: false, reason: 'Room not found' };
    }

    if (room.status !== 'waiting') {
      return { exists: true, canJoin: false, reason: 'Game has already started' };
    }

    if (room.players.length >= room.maxPlayers) {
      return { exists: true, canJoin: false, reason: 'Room is full' };
    }

    return { exists: true, canJoin: true };
  }
}

export const roomService = new RoomService();