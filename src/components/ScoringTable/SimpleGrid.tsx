import React from 'react';
import { Player, Round } from '../../types';
import { gameHelpers } from '../../utils/gameHelpers';
import { Card } from '../common';

interface SimpleGridProps {
  players: Player[];
  rounds: Round[];
}

const SimpleGrid: React.FC<SimpleGridProps> = ({ players, rounds }) => {
  const tableData = gameHelpers.generateTableData(players, rounds);

  if (players.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-500">
          No players in the game yet
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto">
      <div className="min-w-full">
        {/* Table Header */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 mb-4 pb-2 border-b">
          {tableData.headers.map((header, index) => (
            <div
              key={header}
              className={`text-sm font-semibold text-gray-900 ${
                index === 0 ? 'col-span-1' : 'col-span-1'
              }`}
            >
              {header}
            </div>
          ))}
        </div>

        {/* Table Rows */}
        <div className="space-y-2">
          {tableData.rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 p-2 rounded-lg ${
                rowIndex === tableData.rows.length - 1
                  ? 'bg-gray-100 font-semibold'
                  : rowIndex % 2 === 0
                  ? 'bg-gray-50'
                  : 'bg-white'
              }`}
            >
              {tableData.headers.map((header, colIndex) => {
                const value = row[header];
                const playerId = header;

                // Determine cell styling based on content
                let cellClass = 'text-sm text-center py-1 px-1 rounded';

                if (colIndex === 0) {
                  // Round number column
                  cellClass += ' font-medium text-gray-700';
                } else if (typeof value === 'string') {
                  // Player score column
                  const player = players.find(p => p.id === playerId);

                  if (player?.isEliminated) {
                    cellClass += ' bg-red-100 text-red-800';
                  } else if (value.includes('★')) {
                    cellClass += ' bg-green-100 text-green-800 font-semibold';
                  } else if (value.includes('↓')) {
                    cellClass += ' bg-orange-100 text-orange-800';
                  } else if (value.includes('×')) {
                    cellClass += ' bg-red-100 text-red-800';
                  } else {
                    cellClass += ' text-gray-900';
                  }
                }

                return (
                  <div key={colIndex} className={cellClass}>
                    {value}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Legend:</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-1">★</span>
              <span className="text-gray-600">Round Winner</span>
            </div>
            <div className="flex items-center">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded mr-1">↓</span>
              <span className="text-gray-600">Dropped (20 points)</span>
            </div>
            <div className="flex items-center">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded mr-1">×</span>
              <span className="text-gray-600">Eliminated</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SimpleGrid;