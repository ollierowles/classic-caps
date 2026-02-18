'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTeamSelection } from '@/lib/context';
import { footballAPIService, APIError } from '@/lib/api';
import { Fixture } from '@/types';
import FixtureCard from '@/components/FixtureCard';

/**
 * FixtureSelectionPage component
 * Displays fixtures for the selected team and season
 * Requirements: 4.1, 4.3, 10.2, 12.2
 */
export default function FixtureSelectionPage() {
  const router = useRouter();
  const {
    selectedLeague,
    selectedSeason,
    selectedTeam,
    setFixture,
    setFixturesCache,
    getFixturesForTeamSeason,
  } = useTeamSelection();

  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fixturesWithLineups, setFixturesWithLineups] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Redirect if no league, season, or team is selected
    if (!selectedLeague) {
      router.push('/');
      return;
    }
    if (!selectedSeason) {
      router.push('/seasons');
      return;
    }
    if (!selectedTeam) {
      router.push('/teams');
      return;
    }

    loadFixtures();
  }, [selectedLeague, selectedSeason, selectedTeam]);

  const loadFixtures = async () => {
    if (!selectedTeam || !selectedSeason) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cachedFixtures = getFixturesForTeamSeason(
        selectedTeam.id,
        selectedSeason.year
      );
      
      if (cachedFixtures.length > 0) {
        setFixtures(cachedFixtures);
        setIsLoading(false);
        return;
      }

      // Fetch from API
      const fetchedFixtures = await footballAPIService.getFixtures(
        selectedTeam.id,
        selectedSeason.year
      );

      setFixtures(fetchedFixtures);
      setFixturesCache(selectedTeam.id, selectedSeason.year, fetchedFixtures);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('Failed to load fixtures. Please try again.');
      }
      console.error('Error loading fixtures:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixtureClick = async (fixture: Fixture) => {
    // Set fixture in context before navigating
    setFixture(fixture);
    // Navigate to game page - lineup validation will happen there
    router.push(`/game?fixtureId=${fixture.id}&teamId=${selectedTeam?.id}`);
  };

  const handleBackClick = () => {
    router.push('/teams');
  };

  const handleRetry = () => {
    loadFixtures();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-pitch hover:text-pitch-dark transition-colors mb-6"
              aria-label="Back to teams"
            >
              <span className="text-xl">←</span>
              <span className="font-medium">Back to Teams</span>
            </button>

            {selectedTeam && selectedSeason && (
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedTeam.logo}
                  alt={`${selectedTeam.name} logo`}
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {selectedTeam.name}
                  </h1>
                  <p className="text-lg text-gray-600">{selectedSeason.year}</p>
                </div>
              </div>
            )}

            <h2 className="text-xl text-gray-600">Select a Match</h2>
          </div>

          {/* Loading skeleton */}
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-pitch-light border-t-pitch-dark mb-4"></div>
              <p className="text-gray-600 text-lg">Loading fixtures...</p>
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-pitch hover:text-pitch-dark transition-colors mb-6"
              aria-label="Back to teams"
            >
              <span className="text-xl">←</span>
              <span className="font-medium">Back to Teams</span>
            </button>

            {selectedTeam && selectedSeason && (
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedTeam.logo}
                  alt={`${selectedTeam.name} logo`}
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {selectedTeam.name}
                  </h1>
                  <p className="text-lg text-gray-600">{selectedSeason.year}</p>
                </div>
              </div>
            )}

            <h2 className="text-xl text-gray-600">Select a Match</h2>
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
  if (fixtures.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-pitch hover:text-pitch-dark transition-colors mb-6"
              aria-label="Back to teams"
            >
              <span className="text-xl">←</span>
              <span className="font-medium">Back to Teams</span>
            </button>

            {selectedTeam && selectedSeason && (
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedTeam.logo}
                  alt={`${selectedTeam.name} logo`}
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {selectedTeam.name}
                  </h1>
                  <p className="text-lg text-gray-600">{selectedSeason.year}</p>
                </div>
              </div>
            )}

            <h2 className="text-xl text-gray-600">Select a Match</h2>
          </div>

          {/* Empty message */}
          <div className="max-w-md mx-auto bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-yellow-800 text-lg">
              No fixtures available for this team and season.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-pitch hover:text-pitch-dark transition-colors mb-6"
            aria-label="Back to teams"
          >
            <span className="text-xl">←</span>
            <span className="font-medium">Back to Teams</span>
          </button>

          {selectedTeam && selectedSeason && (
            <div className="flex items-center gap-4 mb-4">
              <img
                src={selectedTeam.logo}
                alt={`${selectedTeam.name} logo`}
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {selectedTeam.name}
                </h1>
                <p className="text-lg text-gray-600">{selectedSeason.year}</p>
              </div>
            </div>
          )}

          <h2 className="text-xl text-gray-600">Select a Match</h2>
        </div>

        {/* Fixtures List */}
        <div className="space-y-4">
          {fixtures.map((fixture) => (
            <FixtureCard
              key={fixture.id}
              fixture={fixture}
              selectedTeamId={selectedTeam?.id || 0}
              onClick={handleFixtureClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
