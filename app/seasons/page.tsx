'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSeasonSelection } from '@/lib/context';
import { footballAPIService, APIError } from '@/lib/api';
import { Season } from '@/types';
import SeasonCard from '@/components/SeasonCard';

/**
 * SeasonSelectionPage component
 * Displays available seasons for the selected league
 * Requirements: 2.1, 2.2, 2.3, 10.2
 */
export default function SeasonSelectionPage() {
  const router = useRouter();
  const { selectedLeague, setSeason, setSeasonsCache, getSeasonsForLeague } = useSeasonSelection();
  
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to league selection if no league is selected
    if (!selectedLeague) {
      router.push('/');
      return;
    }

    // Load seasons
    loadSeasons();
  }, [selectedLeague]);

  const loadSeasons = async () => {
    if (!selectedLeague) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cachedSeasons = getSeasonsForLeague(selectedLeague.id);
      if (cachedSeasons.length > 0) {
        setSeasons(cachedSeasons);
        setIsLoading(false);
        return;
      }

      // Fetch from API
      const fetchedSeasons = await footballAPIService.getLeagueSeasons(selectedLeague.id);
      
      // Filter to only show seasons with lineup coverage (already done in API service)
      // Sort in reverse chronological order (already done in API service)
      setSeasons(fetchedSeasons);
      setSeasonsCache(selectedLeague.id, fetchedSeasons);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('Failed to load seasons. Please try again.');
      }
      console.error('Error loading seasons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeasonClick = (season: Season) => {
    setSeason(season);
    router.push('/teams');
  };

  const handleBackClick = () => {
    router.push('/');
  };

  const handleRetry = () => {
    loadSeasons();
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
              aria-label="Back to leagues"
            >
              <span className="text-xl">←</span>
              <span className="font-medium">Back to Leagues</span>
            </button>
            
            {selectedLeague && (
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedLeague.logo}
                  alt={`${selectedLeague.name} logo`}
                  className="w-16 h-16 object-contain"
                />
                <h1 className="text-3xl font-bold text-gray-900">{selectedLeague.name}</h1>
              </div>
            )}
            
            <h2 className="text-xl text-gray-600">Select a Season</h2>
          </div>

          {/* Loading skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-6 shadow-md animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
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
              aria-label="Back to leagues"
            >
              <span className="text-xl">←</span>
              <span className="font-medium">Back to Leagues</span>
            </button>
            
            {selectedLeague && (
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedLeague.logo}
                  alt={`${selectedLeague.name} logo`}
                  className="w-16 h-16 object-contain"
                />
                <h1 className="text-3xl font-bold text-gray-900">{selectedLeague.name}</h1>
              </div>
            )}
            
            <h2 className="text-xl text-gray-600">Select a Season</h2>
          </div>

          {/* Error message */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
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
  if (seasons.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-pitch hover:text-pitch-dark transition-colors mb-6"
              aria-label="Back to leagues"
            >
              <span className="text-xl">←</span>
              <span className="font-medium">Back to Leagues</span>
            </button>
            
            {selectedLeague && (
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedLeague.logo}
                  alt={`${selectedLeague.name} logo`}
                  className="w-16 h-16 object-contain"
                />
                <h1 className="text-3xl font-bold text-gray-900">{selectedLeague.name}</h1>
              </div>
            )}
            
            <h2 className="text-xl text-gray-600">Select a Season</h2>
          </div>

          {/* Empty message */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-yellow-800 text-lg">
              No seasons with lineup data available for this league.
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
            aria-label="Back to leagues"
          >
            <span className="text-xl">←</span>
            <span className="font-medium">Back to Leagues</span>
          </button>
          
          {selectedLeague && (
            <div className="flex items-center gap-4 mb-4">
              <img
                src={selectedLeague.logo}
                alt={`${selectedLeague.name} logo`}
                className="w-16 h-16 object-contain"
              />
              <h1 className="text-3xl font-bold text-gray-900">{selectedLeague.name}</h1>
            </div>
          )}
          
          <h2 className="text-xl text-gray-600">Select a Season</h2>
        </div>

        {/* Seasons list */}
        <div className="space-y-4">
          {seasons.map((season) => (
            <SeasonCard
              key={season.year}
              season={season}
              onClick={handleSeasonClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
