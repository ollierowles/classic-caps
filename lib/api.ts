// Football API Service for Classic Caps
// Handles all API-Football API requests with caching
// Requirements: 4.1, 4.3

import {
  APIResponse,
  LeagueResponse,
  League,
  Season,
  TeamResponse,
  Team,
  FixtureResponse,
  Fixture,
  LineupResponse,
  Lineup,
  Player,
} from '@/types';
import { storageService } from './storage';

/**
 * Custom error class for API-related errors
 * Requirements: 4.2, 12.1
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Service for interacting with the API-Football API
 * Implements caching to minimize API requests and respect rate limits
 * Requirements: 4.1, 4.2, 4.3, 4.4, 12.1, 12.4
 */
export class FootballAPIService {
  private baseURL: string;
  private apiKey: string;

  // Cache TTL constants (in milliseconds)
  private readonly CACHE_TTL_30_DAYS = 30 * 24 * 60 * 60 * 1000;
  private readonly CACHE_TTL_INDEFINITE = 365 * 24 * 60 * 60 * 1000; // 1 year for "indefinite"

  // Retry configuration
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY = 1000; // 1 second

  // Request deduplication - prevent duplicate concurrent requests
  private pendingRequests: Map<string, Promise<any>> = new Map();

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_FOOTBALL_API_URL || 'https://v3.football.api-sports.io';
    this.apiKey = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY || '';

    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      console.warn('API key not configured. Please set NEXT_PUBLIC_FOOTBALL_API_KEY in .env.local');
    }
  }

  /**
   * Get all available leagues
   * Endpoint: GET /leagues
   * Caching: 30 days
   * 
   * @returns Array of League objects
   * Requirements: 4.1, 4.3
   */
  async getLeagues(): Promise<League[]> {
    const cacheKey = 'leagues';
    
    // Check cache first
    const cached = storageService.getCacheEntry<League[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if request is already pending (deduplication)
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Create and store the pending request
    const requestPromise = (async () => {
      try {
        // Fetch from API
        const response = await this.fetchAPI<LeagueResponse>('/leagues');
        
        // Transform to internal League model
        const leagues: League[] = response.map(item => ({
          id: item.league.id,
          name: item.league.name,
          type: item.league.type,
          logo: item.league.logo,
          country: item.country.name,
          countryFlag: item.country.flag,
        }));

        // Cache the result
        storageService.saveCacheEntry(cacheKey, leagues, this.CACHE_TTL_30_DAYS);

        return leagues;
      } finally {
        // Clean up pending request
        this.pendingRequests.delete(cacheKey);
      }
    })();

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Get seasons for a specific league
   * Endpoint: GET /leagues?id={leagueId}
   * Caching: 30 days
   * 
   * @param leagueId - The league ID
   * @returns Array of Season objects with lineup coverage
   * Requirements: 4.1, 4.3
   */
  async getLeagueSeasons(leagueId: number): Promise<Season[]> {
    const cacheKey = `seasons-${leagueId}`;
    
    // Check cache first
    const cached = storageService.getCacheEntry<Season[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const response = await this.fetchAPI<LeagueResponse>(`/leagues?id=${leagueId}`);
    
    if (response.length === 0) {
      return [];
    }

    const leagueData = response[0];
    
    // Transform to internal Season model and filter for lineup coverage
    const seasons: Season[] = leagueData.seasons
      .filter(season => season.coverage.fixtures.lineups)
      .map(season => ({
        year: season.year,
        leagueId: leagueData.league.id,
        leagueName: leagueData.league.name,
        start: season.start,
        end: season.end,
        hasLineups: season.coverage.fixtures.lineups,
      }))
      .sort((a, b) => b.year - a.year); // Sort by year descending (most recent first)

    // Cache the result
    storageService.saveCacheEntry(cacheKey, seasons, this.CACHE_TTL_30_DAYS);

    return seasons;
  }

  /**
   * Get teams for a specific league and season
   * Endpoint: GET /teams?league={leagueId}&season={season}
   * Caching: 30 days
   * 
   * @param leagueId - The league ID
   * @param season - The season year (e.g., 2023)
   * @returns Array of Team objects
   * Requirements: 4.1, 4.3
   */
  async getTeamsByLeagueSeason(leagueId: number, season: number): Promise<Team[]> {
    const cacheKey = `teams-${leagueId}-${season}`;
    
    // Check cache first
    const cached = storageService.getCacheEntry<Team[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const response = await this.fetchAPI<TeamResponse>(`/teams?league=${leagueId}&season=${season}`);
    
    // Transform to internal Team model
    const teams: Team[] = response.map(item => ({
      id: item.team.id,
      name: item.team.name,
      logo: item.team.logo,
      code: item.team.code,
      venue: item.venue?.name,
    }));

    // Cache the result
    storageService.saveCacheEntry(cacheKey, teams, this.CACHE_TTL_30_DAYS);

    return teams;
  }

  /**
   * Get fixtures for a specific team and season
   * Endpoint: GET /fixtures?team={teamId}&season={season}
   * Caching: 30 days
   * 
   * @param teamId - The team ID
   * @param season - The season year (e.g., 2023)
   * @returns Array of Fixture objects (only finished matches)
   * Requirements: 4.1, 4.3
   */
  async getFixtures(teamId: number, season: number): Promise<Fixture[]> {
    const cacheKey = `fixtures-${teamId}-${season}`;
    
    // Check cache first
    const cached = storageService.getCacheEntry<Fixture[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const response = await this.fetchAPI<FixtureResponse>(`/fixtures?team=${teamId}&season=${season}`);
    
    // Transform to internal Fixture model and filter for finished matches
    const fixtures: Fixture[] = response
      .filter(item => item.fixture.status.short === 'FT') // Only finished matches
      .map(item => ({
        id: item.fixture.id,
        date: item.fixture.date,
        homeTeam: {
          id: item.teams.home.id,
          name: item.teams.home.name,
          logo: item.teams.home.logo,
        },
        awayTeam: {
          id: item.teams.away.id,
          name: item.teams.away.name,
          logo: item.teams.away.logo,
        },
        score: `${item.goals.home}-${item.goals.away}`,
        competition: item.league.name,
        venue: item.fixture.venue.name,
        status: item.fixture.status.short,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort chronologically

    // Cache the result
    storageService.saveCacheEntry(cacheKey, fixtures, this.CACHE_TTL_30_DAYS);

    return fixtures;
  }

  /**
   * Get lineup for a specific fixture and team
   * Endpoint: GET /fixtures/lineups?fixture={fixtureId}
   * Caching: Indefinite (historical data never changes)
   * 
   * @param fixtureId - The fixture ID
   * @param teamId - The team ID to get lineup for
   * @returns Lineup object with starting XI
   * Requirements: 4.1, 4.3
   */
  async getLineup(fixtureId: number, teamId: number): Promise<Lineup> {
    const cacheKey = `lineup-${fixtureId}-${teamId}`;
    
    // Check cache first
    const cached = storageService.getCacheEntry<Lineup>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const response = await this.fetchAPI<LineupResponse>(`/fixtures/lineups?fixture=${fixtureId}`);
    
    // Find the lineup for the specified team (response contains both teams)
    const teamLineup = response.find(item => item.team.id === teamId);
    
    if (!teamLineup) {
      throw new Error(`Lineup not found for team ${teamId} in fixture ${fixtureId}`);
    }

    // Transform to internal Lineup model
    const lineup: Lineup = {
      fixtureId,
      teamId: teamLineup.team.id,
      teamName: teamLineup.team.name,
      formation: teamLineup.formation,
      startXI: teamLineup.startXI.map(item => {
        const player = item.player;
        return {
          id: player.id,
          name: player.name,
          number: player.number,
          position: player.pos,
          gridPosition: this.convertGridToPosition(player.grid, teamLineup.formation),
        };
      }),
    };

    // Validate lineup has 11 players
    if (lineup.startXI.length !== 11) {
      throw new Error(`Invalid lineup: expected 11 players, got ${lineup.startXI.length}`);
    }

    // Cache the result indefinitely (historical data)
    storageService.saveCacheEntry(cacheKey, lineup, this.CACHE_TTL_INDEFINITE);

    return lineup;
  }

  /**
   * Convert API grid string to position index
   * Grid format: "row:column" where row 1 is goalkeeper, higher rows are further forward
   * 
   * This creates a sequential index based on the grid position, allowing any formation
   * to be displayed correctly.
   * 
   * @param grid - Grid string from API (e.g., "2:3")
   * @param formation - Formation string (e.g., "4-4-2", "4-3-3", etc.)
   * @returns Position index (0-10)
   */
  private convertGridToPosition(grid: string, formation: string): number {
    const [row, col] = grid.split(':').map(Number);
    
    // Goalkeeper is always position 0
    if (row === 1) return 0;
    
    // Parse formation to get player counts per line
    const formationParts = formation.split('-').map(Number);
    
    // Calculate position based on cumulative count from previous rows
    let position = 1; // Start at 1 (after goalkeeper)
    
    // Add players from all rows before current row
    for (let i = 0; i < row - 2 && i < formationParts.length; i++) {
      position += formationParts[i];
    }
    
    // Add column position within current row (col is 1-indexed)
    position += col - 1;
    
    return position;
  }

  /**
   * Check if the user is offline
   * Requirements: 4.4, 12.4
   * 
   * @returns True if offline, false otherwise
   */
  private isOffline(): boolean {
    return typeof navigator !== 'undefined' && !navigator.onLine;
  }

  /**
   * Handle rate limit responses (429)
   * Implements exponential backoff retry logic
   * Requirements: 4.2, 4.4
   * 
   * @param response - The fetch response object
   * @param retryCount - Current retry attempt number
   * @returns Delay in milliseconds before retry
   */
  private handleRateLimit(response: Response, retryCount: number): number {
    // Check for Retry-After header
    const retryAfter = response.headers.get('Retry-After');
    
    if (retryAfter) {
      // Retry-After can be in seconds or a date
      const retryAfterSeconds = parseInt(retryAfter, 10);
      if (!isNaN(retryAfterSeconds)) {
        return retryAfterSeconds * 1000; // Convert to milliseconds
      }
    }
    
    // Use exponential backoff: 1s, 2s, 4s, 8s
    return this.INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
  }

  /**
   * Handle API errors and determine if they are retryable
   * Requirements: 4.2, 12.1, 12.4
   * 
   * @param statusCode - HTTP status code
   * @param statusText - HTTP status text
   * @throws APIError with appropriate message and retryable flag
   */
  private handleAPIError(statusCode: number, statusText: string): never {
    let message: string;
    let retryable: boolean;

    switch (statusCode) {
      case 400:
        message = 'Invalid request. Please check your selection and try again.';
        retryable = false;
        break;
      case 401:
        message = 'API authentication failed. Please check your API key configuration.';
        retryable = false;
        break;
      case 403:
        message = 'Access forbidden. Your API key may not have permission for this resource.';
        retryable = false;
        break;
      case 404:
        message = 'The requested data was not found. This fixture may not have lineup data available.';
        retryable = false;
        break;
      case 429:
        message = 'Rate limit exceeded. Please wait a moment and try again.';
        retryable = true;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        message = 'The football API is temporarily unavailable. Please try again in a moment.';
        retryable = true;
        break;
      default:
        message = `API request failed: ${statusCode} ${statusText}`;
        retryable = statusCode >= 500; // Server errors are retryable
        break;
    }

    throw new APIError(statusCode, message, retryable);
  }

  /**
   * Sleep for a specified duration
   * Used for retry delays
   * 
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generic fetch method for API-Football endpoints
   * Handles authentication headers and error responses
   * Implements retry logic with exponential backoff
   * Requirements: 4.1, 4.2, 4.4, 12.1, 12.4
   * 
   * @param endpoint - API endpoint path (e.g., '/leagues')
   * @param retryCount - Current retry attempt (used internally)
   * @returns Parsed response data array
   */
  private async fetchAPI<T>(endpoint: string, retryCount: number = 0): Promise<T[]> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Check if offline before making request
    if (this.isOffline()) {
      throw new APIError(
        0,
        'You appear to be offline. Please check your internet connection and try again.',
        true
      );
    }
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'v3.football.api-sports.io',
          'x-rapidapi-key': this.apiKey,
        },
      });

      // Handle rate limiting (429)
      if (response.status === 429) {
        if (retryCount < this.MAX_RETRIES) {
          const delay = this.handleRateLimit(response, retryCount);
          console.warn(`Rate limited. Retrying in ${delay}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
          await this.sleep(delay);
          return this.fetchAPI<T>(endpoint, retryCount + 1);
        } else {
          this.handleAPIError(response.status, response.statusText);
        }
      }

      // Handle other error status codes
      if (!response.ok) {
        // For server errors, retry if we haven't exceeded max retries
        if (response.status >= 500 && retryCount < this.MAX_RETRIES) {
          const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
          console.warn(`Server error ${response.status}. Retrying in ${delay}ms (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
          await this.sleep(delay);
          return this.fetchAPI<T>(endpoint, retryCount + 1);
        }
        
        this.handleAPIError(response.status, response.statusText);
      }

      const data: APIResponse<T> = await response.json();
      
      // Check for API errors in response body
      if (data.errors && data.errors.length > 0) {
        const errorMessage = `API error: ${JSON.stringify(data.errors)}`;
        console.error(errorMessage);
        throw new APIError(400, 'The API returned an error. Please try again.', false);
      }

      return data.response;
    } catch (error) {
      // If it's already an APIError, rethrow it
      if (error instanceof APIError) {
        throw error;
      }
      
      // Handle network errors (fetch failures)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new APIError(
          0,
          'Network error. Please check your internet connection and try again.',
          true
        );
      }
      
      // Handle other unexpected errors
      console.error('Unexpected API fetch error:', error);
      throw new APIError(
        0,
        'An unexpected error occurred. Please try again.',
        true
      );
    }
  }
}

// Export a singleton instance
export const footballAPIService = new FootballAPIService();
