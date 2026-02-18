// Core TypeScript types and interfaces for Classic Caps
// Requirements: 11.1

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Generic wrapper for all API-Football responses
 */
export interface APIResponse<T> {
  get: string;
  parameters: Record<string, any>;
  errors: any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T[];
}

// ============================================================================
// League Types
// ============================================================================

/**
 * League response structure from API-Football
 */
export interface LeagueResponse {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string;
  };
  country: {
    name: string;
    code: string;
    flag: string;
  };
  seasons: Array<{
    year: number;
    start: string;
    end: string;
    current: boolean;
    coverage: {
      fixtures: {
        events: boolean;
        lineups: boolean;
        statistics_fixtures: boolean;
        statistics_players: boolean;
      };
      standings: boolean;
      players: boolean;
      top_scorers: boolean;
      top_assists: boolean;
      top_cards: boolean;
      injuries: boolean;
      predictions: boolean;
      odds: boolean;
    };
  }>;
}

/**
 * Internal League model
 */
export interface League {
  id: number;
  name: string;
  type: string;
  logo: string;
  country: string;
  countryFlag: string;
}

// ============================================================================
// Season Types
// ============================================================================

/**
 * Internal Season model
 */
export interface Season {
  year: number;
  leagueId: number;
  leagueName: string;
  start: string;
  end: string;
  hasLineups: boolean;
}

// ============================================================================
// Team Types
// ============================================================================

/**
 * Team response structure from API-Football
 */
export interface TeamResponse {
  team: {
    id: number;
    name: string;
    code: string;
    country: string;
    founded: number;
    national: boolean;
    logo: string;
  };
  venue: {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    surface: string;
    image: string;
  };
}

/**
 * Internal Team model
 */
export interface Team {
  id: number;
  name: string;
  logo: string;
  code: string;
  venue?: string;
}

// ============================================================================
// Fixture Types
// ============================================================================

/**
 * Fixture response structure from API-Football
 */
export interface FixtureResponse {
  fixture: {
    id: number;
    referee: string;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number;
      second: number;
    };
    venue: {
      id: number;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean;
    };
  };
  goals: {
    home: number;
    away: number;
  };
  score: {
    halftime: {
      home: number;
      away: number;
    };
    fulltime: {
      home: number;
      away: number;
    };
    extratime: {
      home: number;
      away: number;
    };
    penalty: {
      home: number;
      away: number;
    };
  };
}

/**
 * Internal Fixture model
 */
export interface Fixture {
  id: number;
  date: string;
  homeTeam: {
    id: number;
    name: string;
    logo: string;
  };
  awayTeam: {
    id: number;
    name: string;
    logo: string;
  };
  score: string;
  competition: string;
  venue: string;
  status: string;
}

// ============================================================================
// Lineup and Player Types
// ============================================================================

/**
 * Lineup response structure from API-Football
 */
export interface LineupResponse {
  team: {
    id: number;
    name: string;
    logo: string;
    colors: {
      player: {
        primary: string;
        number: string;
        border: string;
      };
      goalkeeper: {
        primary: string;
        number: string;
        border: string;
      };
    };
  };
  formation: string;
  startXI: Array<{
    player: {
      id: number;
      name: string;
      number: number;
      pos: string;
      grid: string;
    };
  }>;
  substitutes: Array<{
    player: {
      id: number;
      name: string;
      number: number;
      pos: string;
      grid: string | null;
    };
  }>;
  coach: {
    id: number;
    name: string;
    photo: string;
  };
}

/**
 * Internal Lineup model
 */
export interface Lineup {
  fixtureId: number;
  teamId: number;
  teamName: string;
  formation: string;
  startXI: Player[];
}

/**
 * Internal Player model
 */
export interface Player {
  id: number;
  name: string;
  number: number;
  position: string;
  gridPosition: number;
}

// ============================================================================
// Game State Types
// ============================================================================

/**
 * Player guess information
 */
export interface PlayerGuess {
  playerName: string;
  isCorrect: boolean;
  attemptCount: number;
}

/**
 * Current game state
 */
export interface GameState {
  fixtureId: number;
  teamId: number;
  startTime: number;
  guessedPlayers: Map<number, PlayerGuess>;
  attempts: number;
  completed: boolean;
}

/**
 * Serialized game state for localStorage
 */
export interface SerializedGameState {
  version: number;
  fixtureId: number;
  teamId: number;
  startTime: number;
  guessedPlayers: {
    [positionIndex: string]: {
      playerName: string;
      isCorrect: boolean;
      attemptCount: number;
    };
  };
  attempts: number;
  completed: boolean;
  lastUpdated: number;
}

// ============================================================================
// Application State Types
// ============================================================================

/**
 * Global application state
 */
export interface AppState {
  // Selection flow state
  selectedLeague: League | null;
  selectedSeason: Season | null;
  selectedTeam: Team | null;
  selectedFixture: Fixture | null;

  // Game state
  currentGame: GameState | null;

  // API cache
  leaguesCache: League[];
  seasonsCache: Map<number, Season[]>;
  teamsCache: Map<string, Team[]>;
  fixturesCache: Map<string, Fixture[]>;
  lineupCache: Map<number, Lineup>;

  // UI state
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Cache Types
// ============================================================================

/**
 * Cache entry structure for localStorage
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for League
 */
export function isLeague(value: any): value is League {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.type === 'string' &&
    typeof value.logo === 'string' &&
    typeof value.country === 'string' &&
    typeof value.countryFlag === 'string'
  );
}

/**
 * Type guard for Season
 */
export function isSeason(value: any): value is Season {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.year === 'number' &&
    typeof value.leagueId === 'number' &&
    typeof value.leagueName === 'string' &&
    typeof value.start === 'string' &&
    typeof value.end === 'string' &&
    typeof value.hasLineups === 'boolean'
  );
}

/**
 * Type guard for Team
 */
export function isTeam(value: any): value is Team {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.logo === 'string' &&
    typeof value.code === 'string'
  );
}

/**
 * Type guard for Fixture
 */
export function isFixture(value: any): value is Fixture {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'number' &&
    typeof value.date === 'string' &&
    value.homeTeam &&
    typeof value.homeTeam.id === 'number' &&
    value.awayTeam &&
    typeof value.awayTeam.id === 'number' &&
    typeof value.score === 'string' &&
    typeof value.competition === 'string' &&
    typeof value.venue === 'string' &&
    typeof value.status === 'string'
  );
}

/**
 * Type guard for Player
 */
export function isPlayer(value: any): value is Player {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.number === 'number' &&
    typeof value.position === 'string' &&
    typeof value.gridPosition === 'number'
  );
}

/**
 * Type guard for Lineup
 */
export function isLineup(value: any): value is Lineup {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.fixtureId === 'number' &&
    typeof value.teamId === 'number' &&
    typeof value.teamName === 'string' &&
    typeof value.formation === 'string' &&
    Array.isArray(value.startXI) &&
    value.startXI.length === 11 &&
    value.startXI.every((player: any) => isPlayer(player))
  );
}

/**
 * Type guard for GameState
 */
export function isGameState(value: any): value is GameState {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.fixtureId === 'number' &&
    typeof value.teamId === 'number' &&
    typeof value.startTime === 'number' &&
    value.guessedPlayers instanceof Map &&
    typeof value.attempts === 'number' &&
    typeof value.completed === 'boolean'
  );
}

/**
 * Type guard for SerializedGameState
 */
export function isSerializedGameState(value: any): value is SerializedGameState {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.version === 'number' &&
    typeof value.fixtureId === 'number' &&
    typeof value.teamId === 'number' &&
    typeof value.startTime === 'number' &&
    typeof value.guessedPlayers === 'object' &&
    typeof value.attempts === 'number' &&
    typeof value.completed === 'boolean' &&
    typeof value.lastUpdated === 'number'
  );
}
