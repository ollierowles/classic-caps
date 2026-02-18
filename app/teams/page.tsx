'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamSelection } from '@/lib/context';
import { footballAPIService, APIError } from '@/lib/api';
import { Team } from '@/types';
import TeamCard from '@/components/TeamCard';

/**
 * TeamSelectionPage component
 * Displays teams for the selected league and season with search functionality
 * Requirements: 3.1, 3.2, 3.4, 10.2
 */
export default function TeamSelectionPage() {
  const router = useRouter();
  const {
    selectedLeague,
    selectedSeason,
    setTeam,
    setTeamsCache,
    getTeamsForLeagueSeason,
  } = useTeamSelection();

  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Redirect if no league or season is selected
    if (!selectedLeague) {
      router.push('/');
      return;
    }
    if (!selectedSeason) {
      router.push('/seasons');
      return;
    }

    loadTeams();
  }, [selectedLeague, selectedSeason]);

  const loadTeams = async () => {
    if (!selectedLeague || !selectedSeason) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cachedTeams = getTeamsForLeagueSeason(
        selectedLeague.id,
        selectedSeason.year
      );
      
      if (cachedTeams.length > 0) {
        setTeams(cachedTeams);
        setIsLoading(false);
        return;
      }

      // Fetch from API
      const fetchedTeams = await footballAPIService.getTeamsByLeagueSeason(
        selectedLeague.id,
        selectedSeason.year
      );

      setTeams(fetchedTeams);
      setTeamsCache(selectedLeague.id, selectedSeason.year, fetchedTeams);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('Failed to load teams. Please try again.');
      }
      console.error('Error loading teams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter teams based on search query
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) {
      return teams;
    }

    const query = searchQuery.toLowerCase();
    return teams.filter(
      (team) =>
        team.name.toLowerCase().includes(query) ||
        team.code.toLowerCase().includes(query)
    );
  }, [teams, searchQuery]);

  const handleTeamClick = (team: Team) => {
    setTeam(team);
    router.push('/fixtures');
  };

  const handleBackClick = () => {
    router.push('/seasons');
  };

  const handleRetry = () => {
    loadTeams();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-pitch hover:text-pitch-dark transition-colors mb-6"
              aria-label="Back to seasons"
            >
              <span className="text-xl">←</span>
              <span className="font-medium">Back to Seasons</span>
            </button>

            {selectedLeague && selectedSeason && (
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedLeague.logo}
                  alt={`${selectedLeague.name} logo`}
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {selectedLeague.name}
                  </h1>
                  <p className="text-lg text-gray-600">{selectedSeason.year}</p>
                </div>
              </div>
            )}

            <h2 className="text-xl text-gray-600">Select a Team</h2>
          </div>

          {/* Loading skeleton */}
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-pitch-light border-t-pitch-dark mb-4"></div>
              <p className="text-gray-600 text-lg">Loading teams...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-pitch hover:text-pitch-dark transition-colors mb-6"
              aria-label="Back to seasons"
            >
              <span className="text-xl">←</span>
              <span className="font-medium">Back to Seasons</span>
            </button>

            {selectedLeague && selectedSeason && (
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedLeague.logo}
                  alt={`${selectedLeague.name} logo`}
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {selectedLeague.name}
                  </h1>
                  <p className="text-lg text-gray-600">{selectedSeason.year}</p>
                </div>
              </div>
            )}

            <h2 className="text-xl text-gray-600">Select a Team</h2>
          </div>

          {/* Error message */}
          <div className="max-w-md mx-auto bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">
              {error}
            </div>
            <button
              onClick={handleRetry}
              className="mt-4 px-6 py-2 bg-pitch text-white rounded-lg hover:bg-pitch-dark transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (teams.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-pitch hover:text-pitch-dark transition-colors mb-6"
              aria-label="Back to seasons"
            >
              <span className="text-xl">←</span>
              <span className="font-medium">Back to Seasons</span>
            </button>

            {selectedLeague && selectedSeason && (
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedLeague.logo}
                  alt={`${selectedLeague.name} logo`}
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {selectedLeague.name}
                  </h1>
                  <p className="text-lg text-gray-600">{selectedSeason.year}</p>
                </div>
              </div>
            )}

            <h2 className="text-xl text-gray-600">Select a Team</h2>
          </div>

          {/* Empty message */}
          <div className="max-w-md mx-auto bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-yellow-800 text-lg">
              No teams available for this league and season.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-pitch hover:text-pitch-dark transition-colors mb-6"
            aria-label="Back to seasons"
          >
            <span className="text-xl">←</span>
            <span className="font-medium">Back to Seasons</span>
          </button>

          {selectedLeague && selectedSeason && (
            <div className="flex items-center gap-4 mb-4">
              <img
                src={selectedLeague.logo}
                alt={`${selectedLeague.name} logo`}
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {selectedLeague.name}
                </h1>
                <p className="text-lg text-gray-600">{selectedSeason.year}</p>
              </div>
            </div>
          )}

          <h2 className="text-xl text-gray-600 mb-6">Select a Team</h2>

          {/* Search Input */}
          <div className="max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for a team..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-pitch focus:border-pitch text-gray-900"
                aria-label="Search teams"
              />
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        {filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <TeamCard key={team.id} team={team} onClick={handleTeamClick} />
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-gray-100 border-2 border-gray-300 rounded-lg p-6 text-center">
            <div className="text-gray-600 text-lg">
              No teams found matching &quot;{searchQuery}&quot;
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
