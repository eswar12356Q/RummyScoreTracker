import React, { useState, useEffect } from 'react';
import { CreateRoomRequest, JoinRoomRequest } from '../../shared/src/types';
import CreateRoomModal from './Room/CreateRoomModal';
import RoomList from './Room/RoomList';
import { toast } from 'react-toastify';

interface Room {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  hostName: string;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: string;
}

const HomePage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [joining, setJoining] = useState(false);

  // Fetch public rooms on component mount
  useEffect(() => {
    fetchPublicRooms();
  }, []);

  const fetchPublicRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rooms');
      const data = await response.json();

      if (data.success) {
        setRooms(data.data);
      } else {
        console.error('Failed to fetch rooms:', data.error);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name to create a room');
      return;
    }
    setShowCreateModal(true);
  };

  const handleJoinByCode = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!joinRoomCode.trim()) {
      alert('Please enter a room code');
      return;
    }

    try {
      setJoining(true);

      // Check if room can be joined
      const checkResponse = await fetch(`/api/rooms/${joinRoomCode}/can-join`);
      const checkData = await checkResponse.json();

      if (!checkData.success || !checkData.data.canJoin) {
        alert(checkData.data.reason || 'Cannot join this room');
        return;
      }

      // In a real implementation, this would connect to socket and join room
      // For now, we'll just show a success message
      alert(`Successfully joined room ${joinRoomCode}!`);

    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room. Please check the room code and try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleRoomCreated = (roomData: any) => {
    setShowCreateModal(false);
    // In a real implementation, this would navigate to the room page
    alert(`Room created successfully! Room code: ${roomData.room.id}`);
  };

  const handleJoinPublicRoom = async (roomId: string) => {
    if (!playerName.trim()) {
      alert('Please enter your name to join a room');
      return;
    }

    try {
      // Check if room can be joined
      const checkResponse = await fetch(`/api/rooms/${roomId}/can-join`);
      const checkData = await checkResponse.json();

      if (!checkData.success || !checkData.data.canJoin) {
        alert(checkData.data.reason || 'Cannot join this room');
        return;
      }

      // In a real implementation, this would connect to socket and join room
      alert(`Successfully joined room ${roomId}!`);

    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room. Please try again.');
    }
  };

  const refreshRooms = () => {
    fetchPublicRooms();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container py-6">
          <div className="flex-between">
            <div className="flex-center gap-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🎲 Housie Game
              </h1>
              <span className="text-sm text-muted">Multiplayer Tambola</span>
            </div>
            <button
              onClick={handleCreateRoom}
              className="btn"
              disabled={!playerName.trim()}
            >
              Create Room
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Player Name Input */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Enter Your Name</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="form-input flex-1"
              maxLength={30}
            />
          </div>
        </div>

        {/* Join Room by Code */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Join Room with Code</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter 6-digit room code"
              value={joinRoomCode}
              onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
              className="form-input flex-1"
              maxLength={6}
            />
            <button
              onClick={handleJoinByCode}
              className="btn btn-secondary"
              disabled={!playerName.trim() || !joinRoomCode.trim() || joining}
            >
              {joining ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </div>

        {/* Browse Public Rooms */}
        <div className="card">
          <div className="flex-between mb-6">
            <h2 className="text-xl font-semibold">Browse Public Rooms</h2>
            <button
              onClick={refreshRooms}
              className="btn btn-secondary"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted mb-4">No public rooms available</p>
              <p className="text-sm text-muted">
                Create your own room or wait for others to create one
              </p>
            </div>
          ) : (
            <RoomList
              rooms={rooms}
              onJoinRoom={handleJoinPublicRoom}
              disabled={!playerName.trim()}
            />
          )}
        </div>

        {/* How to Play */}
        <div className="card mt-8">
          <h2 className="text-xl font-semibold mb-4">How to Play</h2>
          <div className="grid grid-2">
            <div>
              <h3 className="font-semibold mb-2">🎯 Objective</h3>
              <p className="text-muted mb-4">
                Mark numbers on your ticket as they're called. Be the first to complete winning patterns!
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🏆 Winning Patterns</h3>
              <ul className="text-muted space-y-1">
                <li>• Early Five - First 5 numbers marked</li>
                <li>• Top Line - Complete first row</li>
                <li>• Middle Line - Complete second row</li>
                <li>• Bottom Line - Complete third row</li>
                <li>• Full House - All 15 numbers marked</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          playerName={playerName}
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
    </div>
  );
};

export default HomePage;