import { Server, Socket } from 'socket.io';
import { roomService } from '../services/roomService';
import { ticketGenerator } from '../services/ticketGenerator';
import { claimValidator } from '../services/claimValidator';
import { gameEngine } from '../game/gameEngine';
import { CreateRoomRequest, JoinRoomRequest, ClaimRequest } from '../../../shared/src/types';

export class SocketHandlers {
  private io: Server;
  private connectedPlayers: Map<string, { socketId: string; roomId: string }> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  // Handle socket connection
  handleConnection(socket: Socket): void {
    console.log(`Player connected: ${socket.id}`);

    // Create room
    socket.on('create-room', async (data: CreateRoomRequest) => {
      try {
        const { room, player } = await roomService.createRoom(data);

        // Join socket to room
        socket.join(room.id);
        this.connectedPlayers.set(player.id, { socketId: socket.id, roomId: room.id });

        // Save player tickets to database
        await this.savePlayerTickets(player);

        // Send room data to creator
        socket.emit('room-created', { room, player });

        console.log(`Room created: ${room.id} by ${player.name}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Join room
    socket.on('join-room', async (data: JoinRoomRequest) => {
      try {
        const canJoin = await roomService.canJoinRoom(data.roomId);
        if (!canJoin.canJoin) {
          socket.emit('error', { message: canJoin.reason || 'Cannot join room' });
          return;
        }

        const { room, player } = await roomService.joinRoom(data);

        // Join socket to room
        socket.join(room.id);
        this.connectedPlayers.set(player.id, { socketId: socket.id, roomId: room.id });

        // Save player tickets to database
        await this.savePlayerTickets(player);

        // Send room data to joining player
        socket.emit('room-joined', { room, player });

        // Notify other players in room
        socket.to(room.id).emit('player-joined', { player });

        // Broadcast updated room to all players
        this.broadcastRoomUpdate(room.id);

        console.log(`Player ${player.name} joined room ${room.id}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Leave room
    socket.on('leave-room', async (data: { roomId: string; playerId: string }) => {
      try {
        await roomService.leaveRoom(data.roomId, data.playerId);

        // Remove from connected players
        this.connectedPlayers.delete(data.playerId);

        // Leave socket room
        socket.leave(data.roomId);

        // Notify other players
        socket.to(data.roomId).emit('player-left', { playerId: data.playerId });
        socket.emit('room-left', { playerId: data.playerId });

        // Broadcast updated room if it still exists
        const room = await roomService.getRoom(data.roomId);
        if (room) {
          this.broadcastRoomUpdate(room.id);
        }

        console.log(`Player left room ${data.roomId}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Start game
    socket.on('start-game', async (data: { roomId: string }) => {
      try {
        const room = await roomService.getRoom(data.roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if player is host
        const player = room.players.find(p => p.id === this.getPlayerIdBySocket(socket.id));
        if (!player || !player.isHost) {
          socket.emit('error', { message: 'Only the host can start the game' });
          return;
        }

        await roomService.startGame(data.roomId);
        const updatedRoom = await roomService.getRoom(data.roomId);

        if (updatedRoom) {
          // Notify all players in room
          this.io.to(data.roomId).emit('game-started', {
            calledNumbers: updatedRoom.calledNumbers
          });

          // Broadcast updated room
          this.broadcastRoomUpdate(data.roomId);

          console.log(`Game started in room ${data.roomId}`);
        }
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Call number (host only)
    socket.on('call-number', async (data: { roomId: string; number: number }) => {
      try {
        const room = await roomService.getRoom(data.roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if player is host
        const player = room.players.find(p => p.id === this.getPlayerIdBySocket(socket.id));
        if (!player || !player.isHost) {
          socket.emit('error', { message: 'Only the host can call numbers' });
          return;
        }

        // Validate number
        if (data.number < 1 || data.number > 90) {
          socket.emit('error', { message: 'Number must be between 1 and 90' });
          return;
        }

        if (room.calledNumbers.includes(data.number)) {
          socket.emit('error', { message: 'This number has already been called' });
          return;
        }

        // Call the number
        const result = await gameEngine.callNumber(data.roomId, data.number);

        if (result) {
          // Broadcast to all players
          this.io.to(data.roomId).emit('number-called', {
            number: data.number,
            calledNumbers: result.calledNumbers
          });

          // Broadcast updated room
          this.broadcastRoomUpdate(data.roomId);

          console.log(`Number ${data.number} called in room ${data.roomId}`);
        }
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Make claim
    socket.on('make-claim', async (data: ClaimRequest) => {
      try {
        const room = await roomService.getRoom(data.roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        const player = room.players.find(p => p.id === data.playerId);
        if (!player) {
          socket.emit('error', { message: 'Player not found in room' });
          return;
        }

        // Get player's ticket
        const ticket = player.tickets.find(t => t.id === data.ticketId);
        if (!ticket) {
          socket.emit('error', { message: 'Ticket not found' });
          return;
        }

        // Validate claim can be made
        const canMakeClaim = claimValidator.canMakeClaim(
          data.playerId,
          data.claimType,
          room.winningClaims,
          room.status
        );

        if (!canMakeClaim.canClaim) {
          socket.emit('error', { message: canMakeClaim.reason || 'Cannot make this claim' });
          return;
        }

        // Validate the claim
        const validation = claimValidator.validateClaim(
          ticket,
          data.claimType,
          room.calledNumbers
        );

        // Create claim object
        const claim = claimValidator.createClaim(
          data.playerId,
          data.roomId,
          data.ticketId,
          data.claimType,
          validation.isValid,
          validation.verifiedNumbers
        );

        // Save claim to room
        room.winningClaims.push(claim);
        await roomService.updateRoom(room);

        // Broadcast claim result to all players
        this.io.to(data.roomId).emit('claim-made', { claim, player });

        this.io.to(data.roomId).emit('claim-validated', {
          claim,
          isValid: validation.isValid,
          message: validation.message
        });

        // Check if game should end (Full House)
        if (claimValidator.shouldGameEnd(room.winningClaims)) {
          await gameEngine.endGame(data.roomId);
          const updatedRoom = await roomService.getRoom(data.roomId);

          if (updatedRoom) {
            const winners = this.getWinners(updatedRoom);
            this.io.to(data.roomId).emit('game-finished', { winners });
          }
        }

        // Broadcast updated room
        this.broadcastRoomUpdate(data.roomId);

        console.log(`Claim ${data.claimType} by ${player.name}: ${validation.isValid}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Mark number on ticket
    socket.on('mark-number', async (data: { roomId: string; playerId: string; ticketId: string; number: number }) => {
      try {
        const room = await roomService.getRoom(data.roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        const player = room.players.find(p => p.id === data.playerId);
        if (!player) {
          socket.emit('error', { message: 'Player not found' });
          return;
        }

        const ticket = player.tickets.find(t => t.id === data.ticketId);
        if (!ticket) {
          socket.emit('error', { message: 'Ticket not found' });
          return;
        }

        // Check if number has been called
        if (!room.calledNumbers.includes(data.number)) {
          socket.emit('error', { message: 'This number has not been called yet' });
          return;
        }

        // Check if number exists on ticket
        const numberExists = ticket.grid.some(row => row.includes(data.number));
        if (!numberExists) {
          socket.emit('error', { message: 'This number does not exist on your ticket' });
          return;
        }

        // Toggle number marking
        if (ticket.markedNumbers.has(data.number)) {
          ticket.markedNumbers.delete(data.number);
        } else {
          ticket.markedNumbers.add(data.number);
        }

        // Update player data (in-memory, would persist to DB in production)
        const playerIndex = room.players.findIndex(p => p.id === data.playerId);
        room.players[playerIndex] = player;

        // Broadcast updated room
        this.broadcastRoomUpdate(data.roomId);

      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`Player disconnected: ${socket.id}`);

      // Find player by socket ID
      const playerId = this.getPlayerIdBySocket(socket.id);
      if (playerId) {
        const playerData = this.connectedPlayers.get(playerId);
        if (playerData) {
          // Update connection status in database
          await roomService.updatePlayerConnection(playerId, false);

          // Remove from connected players
          this.connectedPlayers.delete(playerId);

          // Notify other players in room
          socket.to(playerData.roomId).emit('player-disconnected', { playerId });

          // Broadcast updated room
          this.broadcastRoomUpdate(playerData.roomId);
        }
      }
    });
  }

  // Save initial tickets for player
  private async savePlayerTickets(player: any): Promise<void> {
    // Generate 3 initial tickets for the player
    const tickets = ticketGenerator.generateMultipleTickets(player.id, player.roomId, 3);
    player.tickets = tickets;

    // In a real implementation, these would be saved to the database
    // For now, they're kept in memory
  }

  // Get player ID by socket ID
  private getPlayerIdBySocket(socketId: string): string | null {
    for (const [playerId, data] of this.connectedPlayers.entries()) {
      if (data.socketId === socketId) {
        return playerId;
      }
    }
    return null;
  }

  // Broadcast room update to all players in room
  private async broadcastRoomUpdate(roomId: string): Promise<void> {
    const room = await roomService.getRoom(roomId);
    if (room) {
      this.io.to(roomId).emit('room-updated', { room });
    }
  }

  // Get winners from finished game
  private getWinners(room: any): Array<{ player: any; claims: any[] }> {
    const winners: Array<{ player: any; claims: any[] }> = [];

    room.players.forEach((player: any) => {
      const playerClaims = room.winningClaims.filter((claim: any) =>
        claim.playerId === player.id && claim.isValid
      );

      if (playerClaims.length > 0) {
        winners.push({ player, claims: playerClaims });
      }
    });

    return winners;
  }
}