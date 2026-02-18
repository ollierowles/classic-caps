'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { footballAPIService, APIError } from '@/lib/api';
import { useLeagueSelection } from '@/lib/context';
import { League } from '@/types';
import LeagueCard from '@/components/LeagueCard';
import SkeletonCard from '@/components/SkeletonCard';

export default function LeagueSelectionPage() {
  const router = useRouter();
  const { leaguesCache, setLeaguesCache, setLeague } = useLeagueSelection();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allLeagues, setAllLeagues] = useState<League[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  // Get unique countries sorted alphabetically
  const countries = useMemo(() => {
    const uniqueCountries = Array.from(new Set(allLeagues.map(l => l.country)))
      .filter(Boolean)
      .sort();
    return uniqueCountries;
  }, [allLeagues]);

  // Filter leagues based on search and country selection
  const filteredLeagues = useMemo(() => {
    let filtered = allLeagues;

    // Filter by country
    if (selectedCountry !== 'all') {
      filtered = filtered.filter(league => league.country === selectedCountry);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(league => 
        league.name.toLowerCase().includes(query) ||
        league.country.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allLeagues, selectedCountry, searchQuery]);

  useEffect(() => {
    async function fetchLeagues() {
      // Check if we have cached leagues
      if (leaguesCache.length > 0) {
        setAllLeagues(leaguesCache);
        return;
      }

      // Fetch from API
      setIsLoading(true);
      setError(null);

      try {
        const leagues = await footballAPIService.getLeagues();
        
        // Update cache and state
        setLeaguesCache(leagues);
        setAllLeagues(leagues);
      } catch (err) {
        if (err instanceof APIError) {
          setError(err.message);
        } else {
          setError('Failed to load leagues. Please try again.');
        }
        console.error('Error fetching leagues:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeagues();
  }, [leaguesCache.length, setLeaguesCache]);

  const handleLeagueClick = (league: League) => {
    setLeague(league);
    router.push('/seasons');
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setLeaguesCache([]);
    setAllLeagues([]);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCountry('all');
  };

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gradient-to-b from-gray-50 to-gray-100 page-enter">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-6 text-pitch-dark">
            Select a League
          </h2>

          {/* Search and Filter Controls */}
          {!isLoading && !error && allLeagues.length > 0 && (
            <div className="max-w-4xl mx-auto space-y-4 mb-8">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search leagues by name or country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-4 rounded-lg border-2 border-gray-200 focus:border-pitch-green focus:outline-none transition-colors"
                />
                <svg 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Country Filter and Stats */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 w-full sm:w-auto">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-pitch-green focus:outline-none transition-colors bg-white"
                  >
                    <option value="all">All Countries ({allLeagues.length} leagues)</option>
                    {countries.map(country => {
                      const count = allLeagues.filter(l => l.country === country).length;
                      return (
                        <option key={country} value={country}>
                          {country} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Results count and clear button */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    {filteredLeagues.length} {filteredLeagues.length === 1 ? 'league' : 'leagues'}
                  </span>
                  {(searchQuery || selectedCountry !== 'all') && (
                    <button
                      onClick={handleClearFilters}
                      className="text-sm text-pitch-green hover:text-pitch-dark font-medium transition-colors whitespace-nowrap"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} variant="league" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="max-w-md mx-auto bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center shadow-lg">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-semibold text-lg">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Leagues Grid */}
        {!isLoading && !error && filteredLeagues.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredLeagues.map((league) => (
              <LeagueCard
                key={league.id}
                league={league}
                onClick={handleLeagueClick}
              />
            ))}
          </div>
        )}

        {/* Empty State - No Results */}
        {!isLoading && !error && allLeagues.length > 0 && filteredLeagues.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg mb-2">No leagues found</p>
            <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters</p>
            <button
              onClick={handleClearFilters}
              className="text-pitch-green hover:text-pitch-dark font-medium transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Empty State - No Data */}
        {!isLoading && !error && allLeagues.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              No leagues available at the moment.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
