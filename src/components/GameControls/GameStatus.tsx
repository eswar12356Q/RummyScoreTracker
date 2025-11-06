import React from 'react';
import { Player, GameType } from '../../types';
import { gameHelpers } from '../../utils/gameHelpers';
import { Card, Button } from '../common';
import { Trophy, Users, AlertCircle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';

interface GameStatusProps {
  players: Player[];
  gameType: GameType;
  currentRound: number;
  isCompleted: boolean;
}

const GameStatus: React.FC<GameStatusProps> = ({
  players,
  gameType,
  currentRound,
  isCompleted,
}) => {
  const navigate = useNavigate();
  const resetGame = useGameStore((state) => state.resetGame);

  const gameStatus = gameHelpers.getGameStatus(players, gameType);
  const activePlayers = gameHelpers.getActivePlayers(players);
  const eliminatedPlayers = gameHelpers.getEliminatedPlayers(players);

  const handleNewGame = () => {
    resetGame();
    navigate('/setup');
  };

  if (isCompleted && gameStatus.winner) {
    return (
      <Card className="border-2 border-green-500 bg-green-50">
        <div className="text-center py-6">
          <Trophy className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Game Complete!
          </h2>
          <p className="text-lg text-green-700 mb-4">
            🎉 {gameStatus.winner.name} wins the game! 🎉
          </p>
          <p className="text-sm text-green-600 mb-6">
            Final Score: {gameStatus.winner.currentScore} points
          </p>

          <div className="flex justify-center space-x-4">
            <Button
              variant="primary"
              onClick={handleNewGame}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Game
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        {/* Game Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {gameType} Point Game
            </h3>
            <p className="text-sm text-gray-600">
              Round {currentRound - 1} of {gameType} points
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNewGame}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game
          </Button>
        </div>

        {/* Player Status Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-800">
              {activePlayers.length}
            </div>
            <div className="text-xs text-blue-600">Active Players</div>
          </div>

          <div className="text-center p-3 bg-red-50 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-red-800">
              {eliminatedPlayers.length}
            </div>
            <div className="text-xs text-red-600">Eliminated</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Trophy className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-800">
              {gameHelpers.getGameWinner(players)?.name || '-'}
            </div>
            <div className="text-xs text-green-600">Current Leader</div>
          </div>
        </div>

        {/* Player Rankings */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Rankings:</h4>
          <div className="space-y-2">
            {players
              .sort((a, b) => a.currentScore - b.currentScore)
              .map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    player.isEliminated
                      ? 'bg-red-50 opacity-60'
                      : player.isActive
                      ? 'bg-green-50'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-3">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {player.name}
                    </span>
                    {player.isEliminated && (
                      <span className="ml-2 text-xs text-red-600">(Eliminated)</span>
                    )}
                    {player.hasRejoined && (
                      <span className="ml-2 text-xs text-blue-600">(Rejoined)</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {player.currentScore}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GameStatus;