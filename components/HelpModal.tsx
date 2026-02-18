'use client';

/**
 * HelpModal Component
 * Provides instructions and tips for playing the game
 * Requirements: 19.3 - Helpful tips and instructions
 */

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">How to Play</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-pitch"
            aria-label="Close help"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-6">
          {/* Game Overview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-2xl">⚽</span>
              Game Overview
            </h3>
            <p className="text-gray-600">
              Classic Caps is a football lineup guessing game where you test your knowledge of historical matches by identifying the starting XI players from a specific fixture.
            </p>
          </div>

          {/* How to Play */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Play</h3>
            <ol className="space-y-3 text-gray-600">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-pitch text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span><strong>Select a League:</strong> Choose from major football leagues like Premier League, La Liga, Serie A, etc.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-pitch text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span><strong>Pick a Season:</strong> Select the season you want to play from.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-pitch text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span><strong>Choose a Team:</strong> Select your favorite team or any team you&apos;re familiar with.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-pitch text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span><strong>Select a Fixture:</strong> Pick a specific match to guess the starting lineup for.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-pitch text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <span><strong>Guess the Players:</strong> Type player names into each position slot. The game will tell you if you&apos;re correct!</span>
              </li>
            </ol>
          </div>

          {/* Tips & Tricks */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tips & Tricks</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex gap-2">
                <span className="text-green-600">✓</span>
                <span>You can enter just the <strong>last name</strong> (e.g., &quot;Fernandes&quot; instead of &quot;Bruno Fernandes&quot;)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600">✓</span>
                <span>Names are <strong>case-insensitive</strong> - &quot;MESSI&quot; works just as well as &quot;messi&quot;</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600">✓</span>
                <span>The game accepts names <strong>with or without accents</strong> (e.g., &quot;Muller&quot; or &quot;Müller&quot;)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600">✓</span>
                <span>Use the <strong>letter hints</strong> (underscores) to help you figure out the player names</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-600">✓</span>
                <span>Your progress is <strong>automatically saved</strong> - you can close the browser and come back later</span>
              </li>
            </ul>
          </div>

          {/* Understanding the Formation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Understanding the Formation</h3>
            <p className="text-gray-600 mb-2">
              The game displays players in a <strong>4-4-2 formation</strong>:
            </p>
            <ul className="space-y-1 text-gray-600 ml-4">
              <li>• <strong>FWD</strong> - Forwards (2 players)</li>
              <li>• <strong>MID</strong> - Midfielders (4 players)</li>
              <li>• <strong>DEF</strong> - Defenders (4 players)</li>
              <li>• <strong>GK</strong> - Goalkeeper (1 player)</li>
            </ul>
          </div>

          {/* Keyboard Navigation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Keyboard Navigation</h3>
            <p className="text-gray-600">
              Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">Tab</kbd> to move between player positions. Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">Enter</kbd> to submit your guess.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 bg-pitch hover:bg-pitch-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pitch focus:ring-offset-2"
        >
          Got it, let&apos;s play!
        </button>
      </div>
    </div>
  );
}
