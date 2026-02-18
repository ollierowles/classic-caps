# Design Document: Classic Caps

## Overview

Classic Caps is a Next.js-based web application that challenges users to identify football starting lineups from historical matches. The application follows a client-side architecture with no backend database, using external football APIs for data retrieval and browser local storage for state persistence.

### Key Design Principles

1. **Client-Side First**: All logic runs in the browser with no server-side state management
2. **Progressive Enhancement**: Core functionality works with graceful degradation for API failures
3. **Responsive Design**: Mobile-first approach with desktop enhancements
4. **Performance**: Aggressive caching and optimistic UI updates
5. **Visual Polish**: Clean, football-themed UI inspired by successful lineup games but with enhanced features

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for rapid, responsive UI development
- **State Management**: React Context + hooks for global state
- **Data Fetching**: Native fetch with SWR for caching and revalidation
- **Storage**: Browser localStorage with fallback handling
- **Football API**: API-Football (api-football.com) - comprehensive coverage, free tier available

### API Selection Rationale

After evaluating options:
- **API-Football**: Best choice - extensive historical data, 100 requests/day free tier, well-documented
- **TheSportsDB**: Limited historical lineup data
- **Football-Data.org**: Good but focuses on current seasons

### API-Football Endpoints Used

The application uses the following API-Football v3 endpoints:

1. **All Leagues**: `GET /leagues`
   - Used for: League selection page
   - Returns: All available leagues with country info and seasons array
   - Caching: 30 days
   - Note: Filter to show only major leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1, etc.)

2. **League Seasons**: `GET /leagues?id={leagueId}`
   - Used for: Season selection page
   - Returns: League information with full seasons array and coverage details
   - Caching: 30 days
   - Note: Filter seasons where `coverage.fixtures.lineups === true`

3. **Teams by League & Season**: `GET /teams?league={leagueId}&season={year}`
   - Used for: Team selection page
   - Returns: All teams that participated in that league season
   - Caching: 30 days

4. **Fixtures by Team & Season**: `GET /fixtures?team={teamId}&season={year}`
   - Used for: Fixture selection page
   - Returns: All fixtures for a team in a specific season
   - Caching: 30 days
   - Note: Only show fixtures with status "FT" (finished) that have lineup data

5. **Lineups by Fixture**: `GET /fixtures/lineups?fixture={fixtureId}`
   - Used for: Game page - getting starting XI
   - Returns: Both teams' lineups with formation, startXI, substitutes, coach
   - Caching: Indefinite (historical data never changes)
   - Note: Returns array with 2 items (one per team), need to match by teamId

### API Response Structure

All API-Football responses follow this wrapper structure:
```typescript
{
  "get": "teams",
  "parameters": { "search": "manchester" },
  "errors": [],
  "results": 10,
  "paging": { "current": 1, "total": 1 },
  "response": [ /* actual data here */ ]
}
```

The `response` array contains the actual data. Always check `results` count and handle empty responses.

## Architecture

### Component Hierarchy

```
App
├── Layout (persistent header/footer)
├── LeagueSelectionPage
│   ├── LeagueList
│   └── LeagueCard
├── SeasonSelectionPage
│   ├── SeasonList
│   └── SeasonCard
├── TeamSelectionPage
│   ├── TeamSearchInput
│   ├── TeamList
│   └── TeamCard
├── FixtureSelectionPage
│   ├── FixtureList
│   ├── FixtureCard
│   └── FixtureFilters
├── GamePage
│   ├── FormationDisplay
│   │   ├── PositionSlot (x11)
│   │   │   ├── LetterHint
│   │   │   └── PlayerInput
│   │   └── FormationGrid
│   ├── GameHeader (team badges, score, date)
│   ├── GameProgress (X/11 guessed)
│   └── CongratsModal
└── ErrorBoundary
```

### Data Flow

```
User Action → Component Event → Context Update → Local Storage Sync → UI Re-render
                                      ↓
                                 API Call (if needed)
                                      ↓
                                 Cache in Memory + localStorage
```

### State Management Structure

```typescript
interface AppState {
  // Selection flow state
  selectedLeague: League | null;
  selectedSeason: Season | null;
  selectedTeam: Team | null;
  selectedFixture: Fixture | null;
  
  // Game state
  currentGame: GameState | null;
  
  // API cache
  leaguesCache: League[];
  seasonsCache: Map<number, Season[]>; // leagueId -> seasons
  teamsCache: Map<string, Team[]>; // "leagueId-season" -> teams
  fixturesCache: Map<string, Fixture[]>; // "teamId-season" -> fixtures
  lineupCache: Map<number, Lineup>; // fixtureId -> lineup
  
  // UI state
  isLoading: boolean;
  error: string | null;
}

interface GameState {
  fixtureId: number;
  startTime: number;
  guessedPlayers: Map<number, PlayerGuess>; // position index -> guess
  attempts: number;
  completed: boolean;
}

interface PlayerGuess {
  playerName: string;
  isCorrect: boolean;
  attemptCount: number;
}
```

## Components and Interfaces

### Core Data Models

```typescript
// API Response wrapper (all API-Football responses follow this structure)
interface APIResponse<T> {
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

// Leagues endpoint response structure
interface LeagueResponse {
  league: {
    id: number;
    name: string;
    type: string; // "League", "Cup"
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

// Our internal League model
interface League {
  id: number;
  name: string;
  type: string;
  logo: string;
  country: string;
  countryFlag: string;
}

// Our internal Season model
interface Season {
  year: number; // e.g., 2023
  leagueId: number;
  leagueName: string;
  start: string;
  end: string;
  hasLineups: boolean; // from coverage.fixtures.lineups
}

// Teams endpoint response structure
interface TeamResponse {
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

// Our internal Team model (simplified from API response)
interface Team {
  id: number;
  name: string;
  logo: string;
  code: string;
  venue?: string;
}

// Fixtures endpoint response structure
interface FixtureResponse {
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

// Our internal Fixture model
interface Fixture {
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
  score: string; // e.g., "2-1"
  competition: string;
  venue: string;
  status: string; // "FT", "NS", "LIVE", etc.
}

// Lineups endpoint response structure
interface LineupResponse {
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
  formation: string; // e.g., "4-4-2"
  startXI: Array<{
    player: {
      id: number;
      name: string;
      number: number;
      pos: string; // "G", "D", "M", "F"
      grid: string; // e.g., "1:1" for position on grid
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

// Our internal Lineup model
interface Lineup {
  fixtureId: number;
  teamId: number;
  teamName: string;
  formation: string; // e.g., "4-4-2"
  startXI: Player[];
}

// Our internal Player model
interface Player {
  id: number;
  name: string;
  number: number;
  position: string; // "G", "D", "M", "F"
  gridPosition: number; // 0-10 for our formation layout (converted from API grid string)
}
```

### API Service Layer

```typescript
class FootballAPIService {
  private baseURL = 'https://v3.football.api-sports.io';
  private apiKey: string;
  
  // Endpoint: GET /leagues
  async getLeagues(): Promise<League[]>
  
  // Endpoint: GET /leagues?id={leagueId}
  async getLeagueSeasons(leagueId: number): Promise<Season[]>
  
  // Endpoint: GET /teams?league={leagueId}&season={season}
  async getTeamsByLeagueSeason(leagueId: number, season: number): Promise<Team[]>
  
  // Endpoint: GET /fixtures?team={teamId}&season={season}
  async getFixtures(teamId: number, season: number): Promise<Fixture[]>
  
  // Endpoint: GET /fixtures/lineups?fixture={fixtureId}
  async getLineup(fixtureId: number, teamId: number): Promise<Lineup>
  
  // Internal helpers
  private async fetchWithCache<T>(endpoint: string, cacheKey: string): Promise<T>
  private handleRateLimit(response: Response): void
  private handleAPIError(error: any): never
}
```

### Storage Service

```typescript
class StorageService {
  // Game state persistence
  saveGameState(state: GameState): void
  loadGameState(): GameState | null
  clearGameState(): void
  
  // API cache persistence
  saveCacheEntry(key: string, data: any, ttl: number): void
  getCacheEntry<T>(key: string): T | null
  clearExpiredCache(): void
  
  // Utility
  isAvailable(): boolean
  getStorageSize(): number
}
```

### Name Matching Service

```typescript
class NameMatchingService {
  /**
   * Normalizes player names for comparison
   * - Removes accents/diacritics
   * - Converts to lowercase
   * - Handles common variations
   */
  normalize(name: string): string
  
  /**
   * Checks if guess matches player name
   * Handles: full name, last name only, common nicknames
   */
  isMatch(guess: string, actualName: string): boolean
  
  /**
   * Generates letter hint with underscores
   * Preserves spaces and special characters
   */
  generateLetterHint(name: string): string
}
```

## Data Models

### Formation Layout Mapping

The 4-4-2 formation maps to grid positions:

```
Position Index → Grid Layout:

        [9]  [10]          (Forwards)
        
   [5]  [6]  [7]  [8]     (Midfielders)
   
   [1]  [2]  [3]  [4]     (Defenders)
   
          [0]              (Goalkeeper)
```

### API Grid String to Position Index Mapping

API-Football returns player positions as grid strings (e.g., "1:1", "2:2", "3:3"). These need to be converted to our 0-10 position indices:

```typescript
// API grid format: "row:column" where row 1 is goalkeeper, row 4 is forwards
// Example API grid strings for 4-4-2:
// Goalkeeper: "1:1" → index 0
// Defenders: "2:1", "2:2", "2:3", "2:4" → indices 1, 2, 3, 4
// Midfielders: "3:1", "3:2", "3:3", "3:4" → indices 5, 6, 7, 8
// Forwards: "4:1", "4:2" → indices 9, 10

function convertGridToPosition(grid: string, formation: string): number {
  const [row, col] = grid.split(':').map(Number);
  
  // For 4-4-2 formation
  if (formation === '4-4-2') {
    if (row === 1) return 0; // Goalkeeper
    if (row === 2) return col; // Defenders (1-4)
    if (row === 3) return 4 + col; // Midfielders (5-8)
    if (row === 4) return 8 + col; // Forwards (9-10)
  }
  
  return 0; // fallback
}
```

Note: If the selected fixture doesn't use 4-4-2 formation, we'll need to either:
1. Filter out non-4-4-2 fixtures in the fixture selection page, OR
2. Implement dynamic formation support (Phase 2 feature)

### Local Storage Schema

```typescript
// Key: 'classic-caps-game-state'
{
  version: 1,
  fixtureId: number,
  startTime: number,
  guessedPlayers: {
    [positionIndex: string]: {
      playerName: string,
      isCorrect: boolean,
      attemptCount: number
    }
  },
  attempts: number,
  completed: boolean,
  lastUpdated: number
}

// Key: 'classic-caps-api-cache-{endpoint}'
{
  data: any,
  timestamp: number,
  ttl: number
}
```

### API Response Caching Strategy

- **Leagues**: Cache for 30 days (rarely changes)
- **Seasons**: Cache for 30 days (historical data)
- **Teams**: Cache for 30 days (historical data for past seasons)
- **Fixtures**: Cache for 30 days (historical data)
- **Lineups**: Cache indefinitely (historical data never changes)
- **Cache invalidation**: Manual clear option in UI



## Error Handling

### API Error Handling Strategy

**Rate Limiting**:
- Monitor API response headers for rate limit information
- Display warning when approaching limit (e.g., 80% of daily quota)
- Queue requests and implement exponential backoff for 429 responses
- Fallback to cached data when rate limited

**Network Errors**:
- Detect offline state using `navigator.onLine`
- Display offline banner with auto-dismiss when connection restored
- Retry failed requests with exponential backoff (1s, 2s, 4s, 8s)
- Maximum 3 retry attempts before showing error to user

**API Response Errors**:
```typescript
class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public retryable: boolean
  ) {
    super(message);
  }
}

// Error handling flow
try {
  const data = await apiService.getLineup(fixtureId);
} catch (error) {
  if (error instanceof APIError) {
    if (error.retryable) {
      // Show retry button
      setError({ message: error.message, canRetry: true });
    } else {
      // Show error without retry
      setError({ message: error.message, canRetry: false });
    }
  }
}
```

### Storage Error Handling

**Quota Exceeded**:
- Catch `QuotaExceededError` when writing to localStorage
- Clear expired cache entries and retry
- If still failing, notify user and continue without persistence
- Provide manual cache clear option in settings

**Storage Unavailable**:
- Detect if localStorage is available on app initialization
- Set flag `storageAvailable` in app state
- Disable persistence features gracefully
- Show one-time notification to user about limited functionality

### Data Validation

**Lineup Data Validation**:
```typescript
function validateLineup(lineup: any): lineup is Lineup {
  return (
    lineup &&
    typeof lineup.fixtureId === 'number' &&
    Array.isArray(lineup.startXI) &&
    lineup.startXI.length === 11 &&
    lineup.startXI.every(player => 
      player.name && 
      player.position &&
      typeof player.gridPosition === 'number'
    )
  );
}
```

**Graceful Degradation**:
- If lineup has < 11 players, mark fixture as incomplete
- If player names are missing, use "Unknown Player" placeholder
- If formation data is invalid, default to 4-4-2
- Log validation errors for debugging but don't crash

## UI/UX Design Details

### Page-by-Page Visual Flow

#### 1. League Selection Page

```
┌─────────────────────────────────────────────────────────┐
│  CLASSIC CAPS                                    [⚙️]   │
│  Guess the Starting XI                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Select a League                                        │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   [LOGO]     │  │   [LOGO]     │  │   [LOGO]     │ │
│  │Premier League│  │   La Liga    │  │  Serie A     │ │
│  │  🇬🇧 England  │  │   🇪🇸 Spain   │  │  🇮🇹 Italy   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   [LOGO]     │  │   [LOGO]     │  │   [LOGO]     │ │
│  │ Bundesliga   │  │  Ligue 1     │  │Championship  │ │
│  │ 🇩🇪 Germany   │  │  🇫🇷 France   │  │ 🇬🇧 England   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  [Load More Leagues...]                                 │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- Large, clickable league cards with logos
- Country flags for visual identification
- Grid layout (3 columns on desktop, 2 on tablet, 1 on mobile)
- Hover effects on cards
- Focus on major leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1)

#### 2. Season Selection Page

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Leagues        CLASSIC CAPS                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Premier League Logo]                                  │
│  Premier League                                         │
│  Select a Season                                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  2023-2024  Aug 2023 - May 2024         [→]    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  2022-2023  Aug 2022 - May 2023         [→]    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  2021-2022  Aug 2021 - May 2022         [→]    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  2020-2021  Sep 2020 - May 2021         [→]    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- List of seasons in reverse chronological order
- Shows season date range
- Back button to return to league selection
- Only shows seasons with lineup data coverage
- Clean list items with hover states

#### 3. Team Selection Page

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Seasons        CLASSIC CAPS                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Premier League Logo]  Premier League  2023-2024       │
│  Select a Team                                          │
│                                                         │
│  🔍 [Search for a team...                          ]   │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   [LOGO]     │  │   [LOGO]     │  │   [LOGO]     │ │
│  │  Man United  │  │   Arsenal    │  │   Liverpool  │ │
│  │     MUN      │  │     ARS      │  │     LIV      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   [LOGO]     │  │   [LOGO]     │  │   [LOGO]     │ │
│  │   Chelsea    │  │  Man City    │  │  Tottenham   │ │
│  │     CHE      │  │     MCI      │  │     TOT      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  [Load More Teams...]                                   │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- Large, clickable team cards with logos
- Real-time search filtering
- Shows team code (e.g., MUN, ARS)
- Grid layout (3 columns on desktop, 2 on tablet, 1 on mobile)
- Hover effects on cards
- Breadcrumb showing league and season context

#### 4. Fixture Selection Page

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Seasons        CLASSIC CAPS                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Man United Logo]  Manchester United  2023-2024        │
│  Select a Match                                         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Aug 14, 2023  •  Premier League                │   │
│  │  Man United  [2-1]  Wolves                      │   │
│  │  Old Trafford                            [Play] │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Aug 19, 2023  •  Premier League                │   │
│  │  Tottenham  [2-0]  Man United                   │   │
│  │  Tottenham Hotspur Stadium               [Play] │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Aug 26, 2023  •  Premier League                │   │
│  │  Man United  [3-2]  Nottingham Forest           │   │
│  │  Old Trafford                            [Play] │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Load More Fixtures...]                                │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- Chronological list of fixtures
- Shows date, competition, score, venue
- Play button to start the game
- Fixtures without lineup data are grayed out/disabled
- Scrollable list with lazy loading

#### 4. Game Page (Main Gameplay)

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Fixtures       CLASSIC CAPS                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Man Utd Logo]  Man United 2-1 Wolves  [Wolves Logo]  │
│  Aug 14, 2023  •  Premier League  •  Old Trafford      │
│                                                         │
│  Progress: 3/11 Players Guessed                         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                 FOOTBALL PITCH                   │   │
│  │              (Green gradient background)         │   │
│  │                                                  │   │
│  │         ┌──────────┐    ┌──────────┐            │   │
│  │    FWD  │ _ _ _ _ _│    │ _ _ _ _ _│       FWD │   │
│  │         │ _ _ _ _ _│    │ _ _ _ _ _│            │   │
│  │         │[Type...] │    │[Type...] │            │   │
│  │         └──────────┘    └──────────┘            │   │
│  │                                                  │   │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐        │   │
│  │  │Bruno │  │_ _ _ │  │_ _ _ │  │_ _ _ │   MID  │   │
│  │  │Fernandes│ _ _ _│  │_ _ _ │  │_ _ _ │        │   │
│  │  │  ✓   │  │[Type]│  │[Type]│  │[Type]│        │   │
│  │  └──────┘  └──────┘  └──────┘  └──────┘        │   │
│  │                                                  │   │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐        │   │
│  │  │Lisandro│  │Harry │  │_ _ _ │  │_ _ _ │  DEF  │   │
│  │  │Martinez│  │Maguire│ │_ _ _ │  │_ _ _ │       │   │
│  │  │  ✓   │  │  ✓   │  │[Type]│  │[Type]│        │   │
│  │  └──────┘  └──────┘  └──────┘  └──────┘        │   │
│  │                                                  │   │
│  │              ┌──────────────┐                   │   │
│  │         GK   │  _ _ _ _ _   │                   │   │
│  │              │  _ _ _ _ _   │                   │   │
│  │              │  [Type...]   │                   │   │
│  │              └──────────────┘                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  💡 Tip: Try first and last names, or just last names  │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- Football pitch visual (green gradient background)
- 4-4-2 formation layout clearly visible
- Each position shows:
  - Letter hints with underscores (e.g., "_ _ _ _ _" for 5-letter name)
  - Spaces preserved (e.g., "_ _ _ _ _  _ _ _ _ _" for first + last)
  - Input field for typing guesses
  - Green checkmark (✓) when correct
  - Full name revealed when guessed
- Progress counter at top
- Match info header with team badges
- Responsive: stacks vertically on mobile

#### 5. Congratulations Modal (Game Complete)

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Fixtures       CLASSIC CAPS                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │                                               │     │
│  │         🎉 CONGRATULATIONS! 🎉                │     │
│  │                                               │     │
│  │     You've guessed the entire lineup!         │     │
│  │                                               │     │
│  │     Man United 2-1 Wolves                     │     │
│  │     Aug 14, 2023                              │     │
│  │                                               │     │
│  │     ⏱️  Time: 4:32                            │     │
│  │     🎯 Attempts: 15                           │     │
│  │                                               │     │
│  │     ┌─────────────────────────────┐           │     │
│  │     │    🔄 Play Another Game     │           │     │
│  │     └─────────────────────────────┘           │     │
│  │                                               │     │
│  │     ┌─────────────────────────────┐           │     │
│  │     │    ← Back to Fixtures       │           │     │
│  │     └─────────────────────────────┘           │     │
│  │                                               │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  [Completed lineup still visible in background]        │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- Centered modal overlay
- Shows completion stats (time, attempts)
- Two action buttons: play another game or return to fixtures
- Celebration emoji/icons
- Semi-transparent background showing completed lineup

### Color Scheme

**Primary Colors**:
- Football pitch green: `#2d5016` to `#3d6b1f` (gradient)
- White: `#ffffff` (text, cards, lines)
- Dark green: `#1a3a0f` (headers, accents)

**Feedback Colors**:
- Correct guess: `#22c55e` (green)
- Incorrect guess: `#ef4444` (red flash)
- Neutral: `#64748b` (gray for hints)

**Background**:
- Light gray: `#f8fafc` (page background)
- White: `#ffffff` (cards, modals)

### Typography

- **Headers**: Bold, sans-serif (e.g., Inter, Roboto)
- **Body**: Regular, sans-serif
- **Letter hints**: Monospace font for consistent spacing
- **Sizes**: Large and readable, mobile-friendly

### Responsive Design

**Mobile (< 640px)**:
- Single column layout
- Vertical formation display
- Larger touch targets
- Simplified header

**Tablet (640px - 1024px)**:
- 2-column grid for teams
- Compact formation
- Side-by-side team badges

**Desktop (> 1024px)**:
- 3-column grid for teams
- Full formation with optimal spacing
- Additional match details visible

### Visual Design Principles

**Inspired by successful lineup games but enhanced**:
- Clean, football pitch-inspired color scheme (green tones, white lines)
- Card-based layouts for teams, seasons, fixtures
- Smooth transitions between selection stages
- Responsive grid system for formation display
- Clear visual feedback for correct/incorrect guesses

### Formation Display Layout

```
CSS Grid Layout (4-4-2):

.formation-grid {
  display: grid;
  grid-template-rows: repeat(4, 1fr);
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(to bottom, #2d5016, #3d6b1f);
}

.forward-line { grid-row: 1; } // 2 players
.midfield-line { grid-row: 2; } // 4 players
.defense-line { grid-row: 3; } // 4 players
.goalkeeper-line { grid-row: 4; } // 1 player
```

### Position Slot Component

**States**:
1. **Empty**: Shows letter hint, input field active
2. **Incorrect**: Red flash animation, input clears
3. **Correct**: Green background, full name revealed, input disabled

**Visual Elements**:
- Player number badge (if available)
- Letter hint with monospace font
- Input field with autocomplete off
- Position label (GK, DEF, MID, FWD)

### Responsive Breakpoints

- **Mobile** (< 640px): Vertical formation, simplified layout
- **Tablet** (640px - 1024px): Compact formation grid
- **Desktop** (> 1024px): Full formation with side panels for info

### Accessibility

- Keyboard navigation support (Tab through positions)
- ARIA labels for screen readers
- High contrast mode support
- Focus indicators on all interactive elements
- Semantic HTML structure

## Performance Optimizations

### Code Splitting

```typescript
// Lazy load game page (largest component)
const GamePage = dynamic(() => import('@/components/GamePage'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

### Memoization

- Memoize expensive computations (letter hint generation, name normalization)
- Use React.memo for pure components (PositionSlot, TeamCard)
- useMemo for filtered/sorted lists

### API Request Optimization

- Debounce team search input (300ms)
- Prefetch next likely selection (e.g., load seasons when team is hovered)
- Batch multiple API requests when possible
- Cancel in-flight requests on navigation

### Bundle Size

- Tree-shake unused API-Football SDK methods
- Use Tailwind CSS purge for minimal CSS bundle
- Compress images (team logos) with next/image
- Target < 200KB initial JS bundle

## Deployment Considerations

### Environment Variables

```env
NEXT_PUBLIC_FOOTBALL_API_KEY=your_api_key_here
NEXT_PUBLIC_FOOTBALL_API_URL=https://v3.football.api-sports.io
NEXT_PUBLIC_CACHE_TTL_DAYS=30
```

### Static Export

Since this is a client-side only app:
```javascript
// next.config.js
module.exports = {
  output: 'export',
  images: {
    unoptimized: true // for static export
  }
}
```

### Hosting Options

- **Vercel**: Zero-config deployment, automatic HTTPS
- **Netlify**: Similar to Vercel, good CDN
- **GitHub Pages**: Free hosting for static sites
- **Cloudflare Pages**: Fast global CDN

### API Key Security

- API key is public (client-side calls required)
- Use API-Football's free tier with rate limiting
- Monitor usage through API dashboard
- Consider implementing request signing for production

## Future Enhancements

### Phase 2 Features

1. **Multiple Formation Support**: Allow games with 4-3-3, 3-5-2, etc.
2. **Difficulty Modes**: 
   - Easy: Show first letter of each name
   - Hard: No letter hints, just positions
3. **Leaderboard**: Track fastest completion times (local only)
4. **Hint System**: Reveal letters for coins/points
5. **Daily Challenge**: Pre-selected fixture of the day
6. **Share Results**: Generate shareable completion cards
7. **Historical Stats**: Track personal best times, completion rate

### Technical Debt to Address

- Implement proper TypeScript strict mode
- Add E2E tests with Playwright
- Set up error monitoring (Sentry)
- Implement analytics (privacy-focused)
- Add PWA support for offline play
- Optimize for Core Web Vitals
