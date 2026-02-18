'use client';

import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { Player } from '@/types';
import { nameMatchingService } from '@/lib/nameMatching';

/**
 * PositionSlot Component
 * Displays a single player position with letter hint and input field
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

interface PositionSlotProps {
  player: Player;
  positionLabel: 'GK' | 'DEF' | 'MID' | 'FWD';
  onGuess?: (guess: string, isCorrect: boolean) => void;
  guessedPlayer?: { playerName: string; isCorrect: boolean };
  isRevealed?: boolean; // New prop to indicate if player was revealed via give up
}

const PositionSlot = React.memo(function PositionSlot({
  player,
  positionLabel,
  onGuess,
  guessedPlayer,
  isRevealed = false,
}: PositionSlotProps) {
  const [inputValue, setInputValue] = useState('');
  const [showIncorrect, setShowIncorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate letter hint
  const letterHint = nameMatchingService.generateLetterHint(player.name);

  // Determine current state
  const isCorrect = guessedPlayer?.isCorrect || false;
  const isEmpty = !guessedPlayer;
  const wasMissed = isRevealed && isEmpty; // Player was revealed but not guessed

  // Handle input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isCorrect) {
      return;
    }

    // Check if guess is correct using NameMatchingService
    const isMatch = nameMatchingService.isMatch(inputValue.trim(), player.name);
    
    // Call parent handler with guess and result
    if (onGuess) {
      onGuess(inputValue.trim(), isMatch);
    }
    
    if (!isMatch) {
      // Show incorrect feedback (red flash)
      setShowIncorrect(true);
      setInputValue('');
      
      // Remove incorrect feedback after animation
      setTimeout(() => {
        setShowIncorrect(false);
      }, 500);
    } else {
      // Clear input on correct guess
      setInputValue('');
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Auto-focus on mount for first empty slot (optional enhancement)
  useEffect(() => {
    if (isEmpty && player.gridPosition === 0 && inputRef.current) {
      // Only auto-focus the goalkeeper position on initial load
      // This provides a starting point for the user
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 min-w-[110px] sm:min-w-[130px] md:min-w-[150px]">
      {/* Position label */}
      <div className="text-xs sm:text-sm font-semibold text-green-200 uppercase tracking-wider">
        {positionLabel}
      </div>

      {/* Player card */}
      <div
        className={`
          bg-white rounded-lg shadow-md p-3 sm:p-4 w-full transition-all duration-300
          ${isCorrect && !wasMissed ? 'bg-green-100 border-2 border-green-500' : ''}
          ${wasMissed ? 'bg-orange-100 border-2 border-orange-500' : ''}
          ${showIncorrect ? 'bg-red-100 border-2 border-red-500 animate-shake' : ''}
          ${isEmpty && !wasMissed ? 'border-2 border-gray-300' : ''}
        `}
      >
        {/* Player number badge */}
        {player.number && (
          <div className="text-center mb-2">
            <span className="inline-block bg-gray-800 text-white text-xs sm:text-sm font-bold rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
              {player.number}
            </span>
          </div>
        )}

        {/* Letter hint or revealed name */}
        <div className="text-center mb-2 min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center px-1">
          {isCorrect || wasMissed ? (
            <div className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">
              {player.name}
            </div>
          ) : (
            <div className="font-mono text-gray-600 text-xs sm:text-sm tracking-wider break-all">
              {letterHint}
            </div>
          )}
        </div>

        {/* Input field, checkmark, or warning icon */}
        {isCorrect && !wasMissed ? (
          <div className="text-center text-green-600 text-2xl sm:text-3xl" aria-label="Correct guess">✓</div>
        ) : wasMissed ? (
          <div className="text-center text-orange-500 text-2xl sm:text-3xl" aria-label="Missed player">⚠</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleChange}
              placeholder="Type name..."
              autoComplete="off"
              aria-label={`Guess player name for ${positionLabel} position. Hint: ${letterHint}`}
              aria-describedby={`hint-${player.gridPosition}`}
              className="w-full px-2 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center touch-manipulation"
              disabled={isCorrect || isRevealed}
            />
            <span id={`hint-${player.gridPosition}`} className="sr-only">
              Letter hint: {letterHint}
            </span>
          </form>
        )}
      </div>
    </div>
  );
});

export default PositionSlot;
