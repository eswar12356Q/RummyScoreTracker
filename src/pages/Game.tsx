import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { SimpleGrid } from '../components/ScoringTable';
import { GameStatus, RoundScoreEntry } from '../components/GameControls';
import { Button, Card } from '../components/common';
import { Eye, EyeOff, Plus, History } from 'lucide-react';

const Game: React.FC = () => {
  const {
    players,
    roundHistory,
    gameType,
    currentRound,
    isGameActive,
    isCompleted,
  } = useGameStore();

  const [showScoreEntry, setShowScoreEntry] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  const activePlayers = players.filter(p => p.isActive && !p.isEliminated);

  const handleRoundComplete = () => {
    setShowScoreEntry(false);
  };

  const canStartNewRound = activePlayers.length > 1 && !isCompleted;

  if (!isGameActive) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No Active Game
              </h2>
              <p className="text-gray-600 mb-6">
                Start a new game to begin tracking scores
              </p>
              <Button
                variant="primary"
                onClick={() => window.location.href = '/setup'}
              >
                Start New Game
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Rummy Score Tracker
          </h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showHistory ? 'Hide' : 'Show'} History
            </Button>
          </div>
        </div>

        {/* Game Status */}
        <GameStatus
          players={players}
          gameType={gameType}
          currentRound={currentRound}
          isCompleted={isCompleted}
        />

        {/* Score History */}
        {showHistory && roundHistory.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <History className="w-5 h-5 mr-2 text-primary-600" />
                Score History
              </h2>
              <div className="text-sm text-gray-600">
                {roundHistory.length} round{roundHistory.length !== 1 ? 's' : ''} played
              </div>
            </div>
            <SimpleGrid players={players} rounds={roundHistory} />
          </div>
        )}

        {/* Score Entry Section */}
        {!isCompleted && (
          <div>
            {!showScoreEntry ? (
              <Card>
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready for Round {currentRound}?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Enter scores for all active players to continue the game
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowScoreEntry(true)}
                    disabled={!canStartNewRound}
                    className="w-full max-w-xs"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start Round {currentRound}
                  </Button>
                  {!canStartNewRound && (
                    <p className="text-sm text-red-600 mt-2">
                      {activePlayers.length <= 1
                        ? 'Need at least 2 active players to continue'
                        : 'Game is completed'}
                    </p>
                  )}
                </div>
              </Card>
            ) : (
              <RoundScoreEntry
                players={players}
                currentRound={currentRound}
                onRoundComplete={handleRoundComplete}
              />
            )}
          </div>
        )}

        {/* Empty State for No Rounds */}
        {roundHistory.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <History className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No rounds played yet
              </h3>
              <p className="text-gray-600">
                Start the first round to see the score history
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Game;