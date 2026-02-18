import React from 'react';
import Link from 'next/link';
import { League } from '@/types';

interface LeagueCardProps {
  league: League;
  onClick: (league: League) => void;
}

/**
 * LeagueCard component displays a single league option with logo, name, country, and flag
 * Requirements: 1.1 - League selection interface
 */
const LeagueCard = React.memo(function LeagueCard({ league, onClick }: LeagueCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick(league);
  };

  return (
    <Link
      href="/seasons"
      onClick={handleClick}
      className="group relative flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-pitch focus:ring-offset-2 border-2 border-transparent hover:border-pitch-light"
      aria-label={`Select ${league.name} from ${league.country}`}
    >
      {/* League Logo */}
      <div className="w-24 h-24 flex items-center justify-center mb-2">
        <img
          src={league.logo}
          alt={`${league.name} logo`}
          className="max-w-full max-h-full object-contain drop-shadow-lg"
        />
      </div>

      {/* League Name */}
      <h3 className="text-xl font-bold text-gray-900 text-center group-hover:text-pitch-dark transition-colors leading-tight">
        {league.name}
      </h3>

      {/* Country with Flag */}
      <div className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-pitch transition-colors">
        <img
          src={league.countryFlag}
          alt={`${league.country} flag`}
          className="w-6 h-4 object-cover rounded-sm shadow-sm"
        />
        <span className="font-medium">{league.country}</span>
      </div>

      {/* Hover indicator */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-pitch-light transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl"></div>
    </Link>
  );
});

export default LeagueCard;
