import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { GameSetupConfig, GameType } from '../types';
import { useGameStore } from '../stores/gameStore';
import { Button, Input, Card } from '../components/common';
import { Target, Users, Trophy } from 'lucide-react';

interface GameSetupFormData {
  gameType: GameType;
  playerCount: number;
  useCustomNames: boolean;
  playerNames: string[];
}

const GameSetup: React.FC = () => {
  const navigate = useNavigate();
  const initializeGame = useGameStore((state) => state.initializeGame);
  const [useCustomNames, setUseCustomNames] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<GameSetupFormData>({
    defaultValues: {
      gameType: 101,
      playerCount: 2,
      useCustomNames: false,
      playerNames: Array(6).fill(''),
    },
  });

  const selectedGameType = watch('gameType');
  const selectedPlayerCount = watch('playerCount');

  const gameTypes: { value: GameType; label: string; description: string }[] = [
    {
      value: 101,
      label: '101 Pool',
      description: 'Quick games, first to reach 101 points is eliminated'
    },
    {
      value: 201,
      label: '201 Pool',
      description: 'Medium length games, more strategic gameplay'
    },
    {
      value: 301,
      label: '301 Pool',
      description: 'Long games for experienced players'
    },
  ];

  const onSubmit = (data: GameSetupFormData) => {
    const config: GameSetupConfig = {
      gameType: data.gameType,
      playerCount: data.playerCount,
      useCustomNames: data.useCustomNames,
      playerNames: data.useCustomNames ? data.playerNames.slice(0, data.playerCount) : undefined,
    };

    initializeGame(config);
    navigate('/game');
  };

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    setValue('playerCount', count);
  };

  const handleUseCustomNamesChange = (useCustom: boolean) => {
    setUseCustomNames(useCustom);
    setValue('useCustomNames', useCustom);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <Trophy className="w-8 h-8 text-primary-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Rummy Score Tracker</h1>
          </div>
          <p className="text-gray-600">Track scores for pool rummy games with 2-6 players</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Game Type Selection */}
          <Card>
            <div className="flex items-center mb-4">
              <Target className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Game Type</h2>
            </div>

            <div className="space-y-3">
              {gameTypes.map((type) => (
                <label key={type.value} className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value={type.value}
                    {...register('gameType', { required: true })}
                    className="mt-1 mr-3 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Player Count Selection */}
          <Card>
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Number of Players</h2>
            </div>

            <div className="flex items-center space-x-2">
              {[2, 3, 4, 5, 6].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => handlePlayerCountChange(count)}
                  className={`w-12 h-12 rounded-lg font-medium transition-colors ${
                    selectedPlayerCount === count
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </Card>

          {/* Player Names */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Player Names</h2>
              </div>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomNames}
                  onChange={(e) => handleUseCustomNamesChange(e.target.checked)}
                  className="mr-2 text-primary-600 focus:ring-primary-500 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Custom Names</span>
              </label>
            </div>

            {useCustomNames ? (
              <div className="space-y-3">
                {Array.from({ length: selectedPlayerCount }, (_, i) => (
                  <Input
                    key={i}
                    label={`Player ${i + 1} Name`}
                    placeholder={`Enter name for Player ${i + 1}`}
                    value={watch(`playerNames.${i}`)}
                    onChange={(value) => setValue(`playerNames.${i}`, value)}
                    required
                    {...register(`playerNames.${i}`, {
                      required: 'Player name is required',
                      maxLength: {
                        value: 20,
                        message: 'Name cannot exceed 20 characters',
                      },
                      validate: (value, allValues) => {
                        const names = allValues.playerNames?.slice(0, selectedPlayerCount) || [];
                        const duplicates = names.filter((name, index) =>
                          name === value && names.indexOf(name) !== index
                        );
                        return duplicates.length === 0 || 'Player names must be unique';
                      },
                    })}
                    error={errors.playerNames?.[i]?.message}
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                Players will be named "Player 1", "Player 2", etc.
              </div>
            )}
          </Card>

          {/* Start Game Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full max-w-xs"
            >
              Start Game
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameSetup;