'use client';

import { useEffect, useState, Suspense, lazy } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGameState, useAppState } from '@/lib/context';
import { footballAPIService } from '@/lib/api';
import { Lineup, PlayerGuess } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

// Lazy load heavy components for better performance
const FormationDisplay = lazy(() => import('@/components/FormationDisplay'));
const CongratsModal = lazy(() => import('@/components/CongratsModal'));

/**
 * GamePage Component (Inner)
 * Main game interface for guessing the starting XI
 * Requirements: 4.3, 8.2, 10.2, 6.1, 6.2, 6.3, 9.1, 9.3, 8.1, 8.2
 */
function GamePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state } = useAppState();
  const {
    selectedFixture,
    selectedTeam,
    currentGame,
    setGame,
    updateGame,
    resetGame,
    setLineupCache,
    getLineupForFixture,
  } = useGameState();

  const [lineup, setLineup] = useState<Lineup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);
  const [isGivenUp, setIsGivenUp] = useState(false);

  // Get fixture and team from URL params if not in context
  const fixtureIdParam = searchParams.get('fixtureId');
  const teamIdParam = searchParams.get('teamId');

  // Fetch lineup data on mount
  useEffect(() => {
    async function fetchLineup() {
      // Determine which fixture and team to use
      let fixtureId: number | null = null;
      let teamId: number | null = null;

      // Try to get from context first
      if (selectedFixture && selectedTeam) {
        fixtureId = selectedFixture.id;
        teamId = selectedTeam.id;
      } 
      // Fall back to URL params
      else if (fixtureIdParam && teamIdParam) {
        fixtureId = parseInt(fixtureIdParam, 10);
        teamId = parseInt(teamIdParam, 10);
      }

      // Validate that we have the required data
      if (!fixtureId || !teamId) {
        setError('No fixture or team selected. Please go back and select a fixture.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Check cache first
        const cachedLineup = getLineupForFixture(fixtureId);
        if (cachedLineup) {
          setLineup(cachedLineup);
          initializeGameState(fixtureId, teamId, cachedLineup);
          setIsLoading(false);
          return;
        }

        // Fetch from API
        const fetchedLineup = await footballAPIService.getLineup(
          fixtureId,
          teamId
        );

        // Cache the lineup
        setLineupCache(fixtureId, fetchedLineup);
        setLineup(fetchedLineup);
        initializeGameState(fixtureId, teamId, fetchedLineup);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching lineup:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load lineup data. Please try again.'
        );
        setIsLoading(false);
      }
    }

    fetchLineup();
  }, [selectedFixture, selectedTeam, fixtureIdParam, teamIdParam]);

  // Initialize game state if not already started
  function initializeGameState(fixtureId: number, teamId: number, lineupData: Lineup) {
    if (!currentGame || currentGame.fixtureId !== fixtureId) {
      setGame({
        fixtureId: fixtureId,
        teamId: teamId,
        startTime: Date.now(),
        guessedPlayers: new Map(),
        attempts: 0,
        completed: false,
      });
    }
  }

  // Handle player guess
  // Requirements: 6.1, 6.2, 6.3, 9.1, 9.3
  function handlePlayerGuess(position: number, guess: string, isCorrect: boolean) {
    if (!currentGame) return;

    // Increment total attempts
    const newAttempts = currentGame.attempts + 1;

    if (isCorrect) {
      // Create new guessed players map with the correct guess
      const newGuessedPlayers = new Map(currentGame.guessedPlayers);
      const existingGuess = newGuessedPlayers.get(position);
      
      newGuessedPlayers.set(position, {
        playerName: guess,
        isCorrect: true,
        attemptCount: existingGuess ? existingGuess.attemptCount + 1 : 1,
      });

      // Check if all 11 positions are guessed (game completion)
      const allGuessed = newGuessedPlayers.size === 11;

      // Update game state
      updateGame({
        guessedPlayers: newGuessedPlayers,
        attempts: newAttempts,
        completed: allGuessed,
      });

      // Show congratulations modal if game is complete
      if (allGuessed) {
        setShowCongratsModal(true);
      }
    } else {
      // Just increment attempts for incorrect guesses
      updateGame({
        attempts: newAttempts,
      });
    }
  }

  // Handle play again
  function handlePlayAgain() {
    setShowCongratsModal(false);
    resetGame();
    router.push('/fixtures');
  }

  // Handle back to fixtures
  function handleBackToFixtures() {
    setShowCongratsModal(false);
    router.push('/fixtures');
  }

  // Handle back button
  function handleBack() {
    router.push('/fixtures');
  }

  // Handle give up button click
  function handleGiveUpClick() {
    setShowGiveUpConfirm(true);
  }

  // Handle give up confirmation
  function handleGiveUpConfirm() {
    if (!currentGame || !lineup) return;
    
    // Mark as given up
    setIsGivenUp(true);
    
    // Don't change guessedPlayers - keep the ones they got right
    // Just mark the game as completed so they can't guess anymore
    updateGame({
      completed: true,
    });

    setShowGiveUpConfirm(false);
  }

  // Handle give up cancel
  function handleGiveUpCancel() {
    setShowGiveUpConfirm(false);
  }

  // Calculate progress
  const guessedCount = currentGame?.guessedPlayers.size || 0;
  const totalPlayers = 11;

  // Calculate time elapsed for stats
  function formatTimeElapsed(): string {
    if (!currentGame) return '0:00';
    const elapsed = Date.now() - currentGame.startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← Back to Fixtures
          </button>
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" text="Loading lineup..." />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !lineup) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← Back to Fixtures
          </button>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Unable to Load Game
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'Missing required data. Please select a fixture to play.'}
            </p>
            <button
              onClick={handleBack}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Fixtures
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get fixture info - either from context or construct from lineup
  const fixtureInfo = selectedFixture || {
    id: lineup.fixtureId,
    homeTeam: { id: 0, name: 'Home Team', logo: '' },
    awayTeam: { id: 0, name: 'Away Team', logo: '' },
    score: '-',
    date: new Date().toISOString(),
    competition: 'Match',
    venue: 'Stadium',
    status: 'FT',
  };

  const teamInfo = selectedTeam || {
    id: lineup.teamId,
    name: lineup.teamName,
    logo: '',
    code: '',
  };

  // Determine which team is home/away (only if we have full fixture info)
  const isHomeTeam = selectedFixture ? teamInfo.id === selectedFixture.homeTeam.id : true;
  const opponentTeam = selectedFixture
    ? (isHomeTeam ? selectedFixture.awayTeam : selectedFixture.homeTeam)
    : { id: 0, name: 'Opponent', logo: '' };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-pitch focus:ring-offset-2 rounded px-2 py-1"
          aria-label="Go back to fixtures"
        >
          ← Back to Fixtures
        </button>

        {/* Match Header */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6" role="banner">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Home Team */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {fixtureInfo.homeTeam.logo && (
                <img
                  src={fixtureInfo.homeTeam.logo}
                  alt={`${fixtureInfo.homeTeam.name} logo`}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
                />
              )}
              <span className="font-semibold text-sm sm:text-lg truncate">
                {fixtureInfo.homeTeam.name}
              </span>
            </div>

            {/* Score */}
            <div className="text-center px-2 sm:px-4 flex-shrink-0" aria-label={`Score: ${fixtureInfo.score}`}>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {fixtureInfo.score}
              </div>
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0">
              <span className="font-semibold text-sm sm:text-lg truncate">
                {fixtureInfo.awayTeam.name}
              </span>
              {fixtureInfo.awayTeam.logo && (
                <img
                  src={fixtureInfo.awayTeam.logo}
                  alt={`${fixtureInfo.awayTeam.name} logo`}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
                />
              )}
            </div>
          </div>

          {/* Match Details */}
          <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600">
            {new Date(fixtureInfo.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            • {fixtureInfo.competition} • {fixtureInfo.venue}
          </div>
        </div>

        {/* Progress Counter */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6" role="status" aria-live="polite">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <span className="text-base sm:text-lg font-semibold text-gray-900">
              Progress: {guessedCount}/{totalPlayers} Players
            </span>
            <div className="flex items-center gap-3">
              <div className="flex gap-1" aria-label={`${guessedCount} out of ${totalPlayers} players guessed`}>
                {Array.from({ length: totalPlayers }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full ${
                      index < guessedCount ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              {!currentGame?.completed && (
                <button
                  onClick={handleGiveUpClick}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-300 hover:border-red-400"
                  aria-label="Give up and reveal all players"
                >
                  Give Up
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Formation Display */}
        <div className="mb-4">
          <div className="text-center mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              Guess the {teamInfo.name} Starting XI
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Formation: {lineup.formation}</p>
          </div>

          <Suspense fallback={<LoadingSpinner size="lg" text="Loading formation..." />}>
            <FormationDisplay
              lineup={lineup}
              guessedPlayers={currentGame?.guessedPlayers}
              onPlayerGuess={handlePlayerGuess}
              isRevealed={isGivenUp}
            />
          </Suspense>
        </div>

        {/* Tip */}
        <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600 px-4" role="note">
          💡 Tip: Enter the player&apos;s last name only
        </div>

        {/* Give Up Confirmation Modal */}
        {showGiveUpConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Give Up?</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to give up? This will reveal all the players and end the game.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleGiveUpCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGiveUpConfirm}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium"
                >
                  Yes, Give Up
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Congratulations Modal */}
        <Suspense fallback={null}>
          <CongratsModal
            isOpen={showCongratsModal}
            fixtureInfo={{
              homeTeam: fixtureInfo.homeTeam.name,
              awayTeam: fixtureInfo.awayTeam.name,
              score: fixtureInfo.score,
              date: new Date(fixtureInfo.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
            }}
            stats={{
              attempts: currentGame?.attempts || 0,
              timeElapsed: formatTimeElapsed(),
            }}
            onPlayAgain={handlePlayAgain}
            onBackToFixtures={handleBackToFixtures}
          />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * GamePage Component (Wrapper with Suspense)
 * Wraps GamePageContent in Suspense boundary for useSearchParams
 */
export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading game...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <GamePageContent />
    </Suspense>
  );
}
