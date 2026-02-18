'use client';

import { Lineup, Player } from '@/types';
import PositionSlot from './PositionSlot';

/**
 * FormationDisplay Component
 * Displays the 4-4-2 formation with 11 player positions
 * Requirements: 7.1, 7.2
 */

interface FormationDisplayProps {
  lineup: Lineup;
  onPlayerGuess?: (position: number, guess: string, isCorrect: boolean) => void;
  guessedPlayers?: Map<number, { playerName: string; isCorrect: boolean }>;
  isRevealed?: boolean; // New prop to indicate if lineup was revealed via give up
}

export default function FormationDisplay({
  lineup,
  onPlayerGuess,
  guessedPlayers = new Map(),
  isRevealed = false,
}: FormationDisplayProps) {
  // Sort players by grid position (0-10)
  const sortedPlayers = [...lineup.startXI].sort(
    (a, b) => a.gridPosition - b.gridPosition
  );

  // Parse formation to determine how many players per line
  const formationParts = lineup.formation.split('-').map(Number);
  
  // Group players dynamically based on formation
  const goalkeeper = sortedPlayers.filter((p) => p.gridPosition === 0);
  
  // Create arrays for each line based on formation
  const lines: Player[][] = [];
  let currentPosition = 1; // Start after goalkeeper
  
  formationParts.forEach((count) => {
    const line = sortedPlayers.filter(
      (p) => p.gridPosition >= currentPosition && p.gridPosition < currentPosition + count
    );
    lines.push(line);
    currentPosition += count;
  });

  // Reverse lines so forwards are at top
  const reversedLines = [...lines].reverse();

  return (
    <div className="relative w-full">
      {/* Football pitch background */}
      <div 
        className="bg-gradient-to-b from-green-700 via-green-800 to-green-900 rounded-lg p-3 sm:p-6 md:p-8 shadow-lg overflow-x-auto"
        role="region"
        aria-label={`Football formation ${lineup.formation} with 11 player positions`}
      >
        {/* Formation grid */}
        <div className="flex flex-col gap-3 sm:gap-6 md:gap-8 min-w-[320px]">
          {/* Render each line from forwards to defenders */}
          {reversedLines.map((line, lineIndex) => {
            // Determine position label based on line index (reversed)
            const actualLineIndex = formationParts.length - 1 - lineIndex;
            let positionLabel: 'DEF' | 'MID' | 'FWD' | 'GK' = 'MID';
            
            if (actualLineIndex === 0) {
              positionLabel = 'DEF';
            } else if (actualLineIndex === formationParts.length - 1) {
              positionLabel = 'FWD';
            }
            
            return (
              <div key={lineIndex} className="flex justify-center gap-2 sm:gap-4 md:gap-6">
                {line.map((player) => (
                  <PositionSlot
                    key={player.gridPosition}
                    player={player}
                    positionLabel={positionLabel}
                    onGuess={
                      onPlayerGuess
                        ? (guess, isCorrect) => onPlayerGuess(player.gridPosition, guess, isCorrect)
                        : undefined
                    }
                    guessedPlayer={guessedPlayers.get(player.gridPosition)}
                    isRevealed={isRevealed}
                  />
                ))}
              </div>
            );
          })}

          {/* Goalkeeper line */}
          <div className="flex justify-center">
            {goalkeeper.map((player) => (
              <PositionSlot
                key={player.gridPosition}
                player={player}
                positionLabel="GK"
                onGuess={
                  onPlayerGuess
                    ? (guess, isCorrect) => onPlayerGuess(player.gridPosition, guess, isCorrect)
                    : undefined
                }
                guessedPlayer={guessedPlayers.get(player.gridPosition)}
                isRevealed={isRevealed}
              />
            ))}
          </div>
        </div>

        {/* Pitch lines decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full bg-white"></div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-white"></div>
        </div>
      </div>
    </div>
  );
}
