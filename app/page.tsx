'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { footballAPIService, APIError } from '@/lib/api';
import { useLeagueSelection } from '@/lib/context';
import { League } from '@/types';
import LeagueCard from '@/components/LeagueCard';
import SkeletonCard from '@/components/SkeletonCard';

// Major league IDs to filter and display
const MAJOR_LEAGUE_IDS = [
  39,  // Premier League
  40,  // Championship (England)
  140, // La Liga
  135, // Serie A
  78,  // Bundesliga
  61,  // Ligue 1
];

export default function LeagueSelectionPage() {
  const router = useRouter();
  const { leaguesCache, setLeaguesCache, setLeague } = useLeagueSelection();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);

  useEffect(() => {
    async function fetchLeagues() {
      console.log('fetchLeagues called, leaguesCache length:', leaguesCache.length);
      
      // Check if we have cached leagues
      if (leaguesCache.length > 0) {
        const majorLeagues = leaguesCache.filter(league => 
          MAJOR_LEAGUE_IDS.includes(league.id)
        );
        console.log('Using cached leagues, found', majorLeagues.length, 'major leagues');
        setLeagues(majorLeagues);
        return;
      }

      // Fetch from API
      console.log('Fetching leagues from API...');
      setIsLoading(true);
      setError(null);

      try {
        const allLeagues = await footballAPIService.getLeagues();
        console.log('Fetched', allLeagues.length, 'leagues from API');
        
        // Filter to show only major leagues
        const majorLeagues = allLeagues.filter(league => 
          MAJOR_LEAGUE_IDS.includes(league.id)
        );
        console.log('Filtered to', majorLeagues.length, 'major leagues');

        // Update cache and state
        setLeaguesCache(allLeagues);
        setLeagues(majorLeagues);
      } catch (err) {
        console.error('Error in fetchLeagues:', err);
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
  }, [leaguesCache.length]);

  const handleLeagueClick = (league: League) => {
    console.log('League clicked:', league.name);
    setLeague(league);
    console.log('Navigating to /seasons');
    router.push('/seasons');
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    
    // Clear cache and retry
    setLeaguesCache([]);
    setLeagues([]);
    
    // The useEffect will trigger and fetch again
  };

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gradient-to-b from-gray-50 to-gray-100 page-enter">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-6 text-pitch-dark">
            Select a League
          </h2>
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
        {!isLoading && !error && leagues.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {leagues.map((league) => (
              <LeagueCard
                key={league.id}
                league={league}
                onClick={handleLeagueClick}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && leagues.length === 0 && (
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
