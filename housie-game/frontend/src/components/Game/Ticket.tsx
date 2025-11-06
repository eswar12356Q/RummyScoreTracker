import React from 'react';
import { Ticket } from '../../../../shared/src/types';

interface Props {
  ticket: Ticket;
  calledNumbers: number[];
  onNumberClick?: (number: number) => void;
  isInteractive?: boolean;
  selectedTicket?: boolean;
}

const TicketComponent: React.FC<Props> = ({
  ticket,
  calledNumbers,
  onNumberClick,
  isInteractive = true,
  selectedTicket = false
}) => {
  const handleNumberClick = (number: number) => {
    if (!isInteractive) return;

    // Only allow clicking if number has been called
    if (!calledNumbers.includes(number)) return;

    onNumberClick?.(number);
  };

  const getNumberCellClass = (number: number | null) => {
    if (number === null) return 'ticket-cell empty';

    const isCalled = calledNumbers.includes(number);
    const isMarked = ticket.markedNumbers.has(number);

    let baseClass = 'ticket-cell number';

    if (isMarked) {
      baseClass += ' marked';
    } else if (isCalled) {
      baseClass += ' called';
    }

    if (isInteractive && isCalled) {
      baseClass += ' clickable';
    }

    return baseClass;
  };

  return (
    <div className={`ticket ${selectedTicket ? 'selected' : ''}`}>
      <div className="ticket-grid">
        {/* Column headers */}
        <div className="ticket-header">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(col => (
            <div key={col} className="ticket-header-cell">
              {col === 1 ? '1-9' :
               col === 2 ? '10-19' :
               col === 3 ? '20-29' :
               col === 4 ? '30-39' :
               col === 5 ? '40-49' :
               col === 6 ? '50-59' :
               col === 7 ? '60-69' :
               col === 8 ? '70-79' :
               '80-90'}
            </div>
          ))}
        </div>

        {/* Ticket grid */}
        {ticket.grid.map((row, rowIndex) => (
          <div key={rowIndex} className="ticket-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getNumberCellClass(cell)}
                onClick={() => cell && handleNumberClick(cell)}
              >
                {cell !== null && (
                  <span className="number-text">
                    {cell}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Row indicators */}
        <div className="ticket-row-indicators">
          {['Top', 'Middle', 'Bottom'].map((label, index) => (
            <div key={label} className="row-indicator">
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Ticket stats */}
      <div className="ticket-stats">
        <span className="marked-count">
          {ticket.markedNumbers.size}/15 marked
        </span>
      </div>

      <style jsx>{`
        .ticket {
          background: white;
          border: 2px solid #e1e5e9;
          border-radius: 12px;
          padding: 16px;
          margin: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .ticket.selected {
          border-color: #667eea;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        }

        .ticket:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .ticket-grid {
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 8px;
        }

        .ticket-header {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          gap: 2px;
          margin-bottom: 8px;
        }

        .ticket-header-cell {
          background: #f8f9fa;
          padding: 4px;
          text-align: center;
          font-size: 10px;
          font-weight: 600;
          color: #666;
          border-radius: 4px;
        }

        .ticket-row {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          gap: 2px;
          margin-bottom: 2px;
        }

        .ticket-cell {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          min-height: 32px;
        }

        .ticket-cell.empty {
          background: #f8f9fa;
        }

        .ticket-cell.number {
          background: #ffffff;
          border: 1px solid #dee2e6;
          color: #333;
        }

        .ticket-cell.number.called {
          background: #fff3cd;
          border-color: #ffc107;
          color: #856404;
        }

        .ticket-cell.number.marked {
          background: #d1f2eb;
          border-color: #51cf66;
          color: #2b8a3e;
          position: relative;
        }

        .ticket-cell.number.marked::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 20%;
          right: 20%;
          height: 2px;
          background: #2b8a3e;
          transform: rotate(-5deg);
        }

        .ticket-cell.number.clickable {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ticket-cell.number.clickable:hover {
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          z-index: 1;
        }

        .number-text {
          position: relative;
          z-index: 2;
        }

        .ticket-row-indicators {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 8px;
        }

        .row-indicator {
          text-align: center;
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }

        .ticket-stats {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e9ecef;
          text-align: center;
        }

        .marked-count {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .ticket {
            padding: 12px;
            margin: 4px;
          }

          .ticket-cell {
            font-size: 12px;
            min-height: 28px;
          }

          .ticket-header-cell {
            font-size: 9px;
            padding: 2px;
          }

          .row-indicator {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

export default TicketComponent;