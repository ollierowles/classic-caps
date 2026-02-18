import React from 'react';
import { Team } from '@/types';

interface TeamCardProps {
  team: Team;
  onClick: (team: Team) => void;
}

/**
 * TeamCard component
 * Displays a team with logo, name, and code
 * Requirements: 3.2
 */
const TeamCard = React.memo(function TeamCard({ team, onClick }: TeamCardProps) {
  return (
    <button
      onClick={() => onClick(team)}
      className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-pitch-light focus:outline-none focus:ring-2 focus:ring-pitch focus:ring-offset-2 w-full"
      aria-label={`Select ${team.name}`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Team Logo */}
        <div className="w-20 h-20 flex items-center justify-center">
          <img
            src={team.logo}
            alt={`${team.name} logo`}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Team Name */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {team.name}
          </h3>
          
          {/* Team Code */}
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {team.code}
          </p>
        </div>
      </div>
    </button>
  );
});

export default TeamCard;
