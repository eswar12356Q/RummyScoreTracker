import React, { useState } from 'react';
import { Player } from '../../types';
import { useGameStore } from '../../stores/gameStore';
import { Button, Input, Card } from '../common';
import { gameHelpers } from '../../utils/gameHelpers';
import { Plus, UserX, Trophy } from 'lucide-react';

interface RoundScoreEntryProps {
  players: Player[];
  currentRound: number;
  onRoundComplete: () => void;
}

const RoundScoreEntry: React.FC<RoundScoreEntryProps> = ({
  players,
  currentRound,
  onRoundComplete,
}) => {
  const addRound = useGameStore((state) => state.addRound);
  const dropPlayer = useGameStore((state) => state.dropPlayer);
  const setRoundWinner = useGameStore((state) => state.setRoundWinner);

  const [scores, setScores] = useState<{ [playerId: string]: string }>({});
  const [errors, setErrors] = useState<{ [playerId: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activePlayers = gameHelpers.getActivePlayers(players);

  const handleScoreChange = (playerId: string, value: string) => {
    setScores(prev => ({ ...prev, [playerId]: value }));

    // Clear error when user starts typing
    if (errors[playerId]) {
      setErrors(prev => ({ ...prev, [playerId]: '' }));
    }
  };

  const handleDropPlayer = (playerId: string) => {
    dropPlayer(playerId);
    // Remove score entry for dropped player
    setScores(prev => {
      const newScores = { ...prev };
      delete newScores[playerId];
      return newScores;
    });
  };

  const handleSetWinner = (playerId: string) => {
    setRoundWinner(playerId);
    // Set winner score to 0
    setScores(prev => ({ ...prev, [playerId]: '0' }));
  };

  const validateScores = (): boolean => {
    const newErrors: { [playerId: string]: string } = {};
    let isValid = true;

    activePlayers.forEach(player => {
      const score = scores[player.id];

      if (score === undefined || score === '') {
        newErrors[player.id] = 'Score is required';
        isValid = false;
      } else {
        const validation = gameHelpers.validateScoreInput(score);
        if (!validation.isValid) {
          newErrors[player.id] = validation.error || 'Invalid score';
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateScores()) return;

    setIsSubmitting(true);

    const roundScores: { [playerId: string]: number } = {};

    activePlayers.forEach(player => {
      const score = scores[player.id] || '0';
      roundScores[player.id] = parseInt(score, 10);
    });

    addRound(roundScores);
    setScores({});
    setErrors({});
    setIsSubmitting(false);
    onRoundComplete();
  };

  const canSubmit = activePlayers.every(player => scores[player.id] !== undefined && scores[player.id] !== '');

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Round {currentRound} Scores
        </h3>
        <p className="text-sm text-gray-600">
          Enter scores for all active players or mark actions
        </p>
      </div>

      <div className="space-y-4">
        {activePlayers.map(player => (
          <div key={player.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{player.name}</h4>
                <p className="text-sm text-gray-600">
                  Current Score: {player.currentScore}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDropPlayer(player.id)}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <UserX className="w-4 h-4 mr-1" />
                  Drop
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetWinner(player.id)}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  <Trophy className="w-4 h-4 mr-1" />
                  Won
                </Button>
              </div>
            </div>

            <Input
              type="number"
              placeholder="Enter score"
              value={scores[player.id] || ''}
              onChange={(value) => handleScoreChange(player.id, value)}
              error={errors[player.id]}
              min="0"
              max="999"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full max-w-xs"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Adding Round...' : 'Complete Round'}
        </Button>
      </div>
    </Card>
  );
};

export default RoundScoreEntry;