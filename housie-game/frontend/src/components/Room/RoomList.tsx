import React from 'react';

interface Room {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  hostName: string;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: string;
}

interface Props {
  rooms: Room[];
  onJoinRoom: (roomId: string) => void;
  disabled?: boolean;
}

const RoomList: React.FC<Props> = ({ rooms, onJoinRoom, disabled = false }) => {
  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'waiting':
        return 'text-success';
      case 'playing':
        return 'text-error';
      case 'finished':
        return 'text-muted';
      default:
        return 'text-muted';
    }
  };

  const getStatusText = (status: Room['status']) => {
    switch (status) {
      case 'waiting':
        return 'Waiting';
      case 'playing':
        return 'Playing';
      case 'finished':
        return 'Finished';
      default:
        return 'Unknown';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const canJoin = (room: Room) => {
    return room.status === 'waiting' && room.playerCount < room.maxPlayers;
  };

  return (
    <div className="space-y-4">
      {rooms.map((room) => (
        <div key={room.id} className="card hover:shadow-lg transition-all">
          <div className="flex-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">{room.name}</h3>
                <span className={`text-sm font-medium ${getStatusColor(room.status)}`}>
                  {getStatusText(room.status)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted mb-3">
                <span>👑 Host: {room.hostName}</span>
                <span>👥 Players: {room.playerCount}/{room.maxPlayers}</span>
                <span>🕐 Created: {formatTimeAgo(room.createdAt)}</span>
              </div>

              {/* Player count bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${(room.playerCount / room.maxPlayers) * 100}%`
                  }}
                ></div>
              </div>

              {/* Room features */}
              <div className="flex gap-3 text-xs text-muted">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                  Public Room
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  Code: {room.id}
                </span>
                {room.playerCount >= 2 && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                    Ready to Play
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 ml-4">
              <button
                onClick={() => onJoinRoom(room.id)}
                className={`btn btn-secondary px-6 ${
                  !canJoin(room) || disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!canJoin(room) || disabled}
              >
                {disabled
                  ? 'Enter Name First'
                  : room.status === 'playing'
                  ? 'Game in Progress'
                  : room.playerCount >= room.maxPlayers
                  ? 'Room Full'
                  : 'Join Room'
                }
              </button>
            </div>
          </div>

          {/* Additional room info */}
          {room.status === 'playing' && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Game is currently in progress. You can join when the next game starts.
              </p>
            </div>
          )}

          {room.status === 'finished' && (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">
                🏁 Game has finished. Waiting for host to start a new game.
              </p>
            </div>
          )}
        </div>
      ))}

      {rooms.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎲</div>
          <h3 className="text-xl font-semibold mb-2">No Rooms Available</h3>
          <p className="text-muted mb-4">
            Be the first to create a room and invite your friends!
          </p>
        </div>
      )}
    </div>
  );
};

export default RoomList;