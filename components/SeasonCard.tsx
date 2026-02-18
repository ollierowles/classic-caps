import React from 'react';
import { Season } from '@/types';

/**
 * SeasonCard component
 * Displays a season as a clickable card with year and date range
 * Requirements: 2.1
 */
interface SeasonCardProps {
  season: Season;
  onClick: (season: Season) => void;
}

export default function SeasonCard({ season, onClick }: SeasonCardProps) {
  const handleClick = () => {
    onClick(season);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(season);
    }
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="w-full bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-pitch focus:ring-offset-2 border-2 border-transparent hover:border-pitch-light text-left group"
      aria-label={`Select ${season.year} season`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-pitch-dark transition-colors mb-2">
            {season.year}-{season.year + 1}
          </h3>
          <p className="text-gray-600 group-hover:text-pitch transition-colors">
            {new Date(season.start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            {' - '}
            {new Date(season.end).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="text-pitch-light group-hover:text-pitch-dark transition-colors text-2xl">
          →
        </div>
      </div>
    </button>
  );
}
