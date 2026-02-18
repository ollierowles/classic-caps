import React from 'react';
import { Fixture } from '@/types';

interface FixtureCardProps {
  fixture: Fixture;
  selectedTeamId: number;
  onClick: (fixture: Fixture) => void;
}

/**
 * FixtureCard component
 * Displays fixture information with date, teams, score, venue, and competition
 * Requirements: 4.2, 12.2
 */
export default function FixtureCard({ fixture, selectedTeamId, onClick }: FixtureCardProps) {
  // Format date to readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Determine if selected team is home or away
  const isHomeTeam = fixture.homeTeam.id === selectedTeamId;
  const selectedTeam = isHomeTeam ? fixture.homeTeam : fixture.awayTeam;
  const opponentTeam = isHomeTeam ? fixture.awayTeam : fixture.homeTeam;

  return (
    <button
      onClick={() => onClick(fixture)}
      className="w-full bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border-2 border-transparent hover:border-pitch-light focus:outline-none focus:ring-2 focus:ring-pitch focus:ring-offset-2 text-left"
      aria-label={`Play match: ${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`}
    >
      {/* Date and Competition */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
        <span className="font-medium">{formatDate(fixture.date)}</span>
        <span>•</span>
        <span>{fixture.competition}</span>
      </div>

      {/* Teams and Score */}
      <div className="flex items-center justify-between mb-3">
        {/* Home Team */}
        <div className="flex items-center gap-3 flex-1">
          <img
            src={fixture.homeTeam.logo}
            alt={`${fixture.homeTeam.name} logo`}
            className="w-10 h-10 object-contain"
          />
          <span className="font-semibold text-gray-900 text-lg">
            {fixture.homeTeam.name}
          </span>
        </div>

        {/* Score */}
        <div className="px-4">
          <span className="text-2xl font-bold text-pitch">
            {fixture.score}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="font-semibold text-gray-900 text-lg">
            {fixture.awayTeam.name}
          </span>
          <img
            src={fixture.awayTeam.logo}
            alt={`${fixture.awayTeam.name} logo`}
            className="w-10 h-10 object-contain"
          />
        </div>
      </div>

      {/* Venue and Play Button */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>{fixture.venue}</span>
        </div>

        {/* Play Button */}
        <div className="flex items-center gap-2 px-4 py-2 bg-pitch text-white rounded-md font-medium hover:bg-pitch-dark transition-colors">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>Play</span>
        </div>
      </div>
    </button>
  );
}
