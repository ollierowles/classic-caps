'use client';

import { useRouter } from 'next/navigation';

/**
 * CongratsModal Component
 * Displays congratulations message when all players are guessed
 * Requirements: 8.1, 8.2, 8.3
 */

interface CongratsModalProps {
  isOpen: boolean;
  fixtureInfo: {
    homeTeam: string;
    awayTeam: string;
    score: string;
    date: string;
  };
  stats: {
    attempts: number;
    timeElapsed: string;
  };
  onPlayAgain: () => void;
  onBackToFixtures: () => void;
}

export default function CongratsModal({
  isOpen,
  fixtureInfo,
  stats,
  onPlayAgain,
  onBackToFixtures,
}: CongratsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 animate-fadeIn">
        {/* Celebration Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            CONGRATULATIONS!
          </h2>
          <p className="text-lg text-gray-600">
            You&apos;ve guessed the entire lineup!
          </p>
        </div>

        {/* Match Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
          <div className="font-semibold text-gray-900 mb-1">
            {fixtureInfo.homeTeam} {fixtureInfo.score} {fixtureInfo.awayTeam}
          </div>
          <div className="text-sm text-gray-600">{fixtureInfo.date}</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">⏱️</div>
            <div className="text-sm text-gray-600 mb-1">Time</div>
            <div className="font-bold text-gray-900">{stats.timeElapsed}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-sm text-gray-600 mb-1">Attempts</div>
            <div className="font-bold text-gray-900">{stats.attempts}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            🔄 Play Another Game
          </button>
          <button
            onClick={onBackToFixtures}
            className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            ← Back to Fixtures
          </button>
        </div>
      </div>
    </div>
  );
}
