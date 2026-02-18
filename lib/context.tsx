'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  AppState,
  League,
  Season,
  Team,
  Fixture,
  Lineup,
  GameState,
} from '@/types';
import { StorageService } from './storage';

// ============================================================================
// Action Types
// ============================================================================

type AppAction =
  // Selection actions
  | { type: 'SET_LEAGUE'; payload: League | null }
  | { type: 'SET_SEASON'; payload: Season | null }
  | { type: 'SET_TEAM'; payload: Team | null }
  | { type: 'SET_FIXTURE'; payload: Fixture | null }
  // Game actions
  | { type: 'SET_GAME'; payload: GameState | null }
  | { type: 'UPDATE_GAME'; payload: Partial<GameState> }
  // Cache actions
  | { type: 'SET_LEAGUES_CACHE'; payload: League[] }
  | { type: 'SET_SEASONS_CACHE'; payload: { leagueId: number; seasons: Season[] } }
  | { type: 'SET_TEAMS_CACHE'; payload: { key: string; teams: Team[] } }
  | { type: 'SET_FIXTURES_CACHE'; payload: { key: string; fixtures: Fixture[] } }
  | { type: 'SET_LINEUP_CACHE'; payload: { fixtureId: number; lineup: Lineup } }
  // UI actions
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  // Reset actions
  | { type: 'RESET_SELECTION' }
  | { type: 'RESET_GAME' };

// ============================================================================
// Initial State
// ============================================================================

const initialState: AppState = {
  // Selection flow state
  selectedLeague: null,
  selectedSeason: null,
  selectedTeam: null,
  selectedFixture: null,

  // Game state
  currentGame: null,

  // API cache
  leaguesCache: [],
  seasonsCache: new Map(),
  teamsCache: new Map(),
  fixturesCache: new Map(),
  lineupCache: new Map(),

  // UI state
  isLoading: false,
  error: null,
};

// ============================================================================
// Reducer
// ============================================================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Selection actions
    case 'SET_LEAGUE':
      return {
        ...state,
        selectedLeague: action.payload,
        // Reset downstream selections
        selectedSeason: null,
        selectedTeam: null,
        selectedFixture: null,
      };

    case 'SET_SEASON':
      return {
        ...state,
        selectedSeason: action.payload,
        // Reset downstream selections
        selectedTeam: null,
        selectedFixture: null,
      };

    case 'SET_TEAM':
      return {
        ...state,
        selectedTeam: action.payload,
        // Reset downstream selections
        selectedFixture: null,
      };

    case 'SET_FIXTURE':
      return {
        ...state,
        selectedFixture: action.payload,
      };

    // Game actions
    case 'SET_GAME':
      return {
        ...state,
        currentGame: action.payload,
      };

    case 'UPDATE_GAME':
      if (!state.currentGame) return state;
      return {
        ...state,
        currentGame: {
          ...state.currentGame,
          ...action.payload,
        },
      };

    // Cache actions
    case 'SET_LEAGUES_CACHE':
      return {
        ...state,
        leaguesCache: action.payload,
      };

    case 'SET_SEASONS_CACHE': {
      const newSeasonsCache = new Map(state.seasonsCache);
      newSeasonsCache.set(action.payload.leagueId, action.payload.seasons);
      return {
        ...state,
        seasonsCache: newSeasonsCache,
      };
    }

    case 'SET_TEAMS_CACHE': {
      const newTeamsCache = new Map(state.teamsCache);
      newTeamsCache.set(action.payload.key, action.payload.teams);
      return {
        ...state,
        teamsCache: newTeamsCache,
      };
    }

    case 'SET_FIXTURES_CACHE': {
      const newFixturesCache = new Map(state.fixturesCache);
      newFixturesCache.set(action.payload.key, action.payload.fixtures);
      return {
        ...state,
        fixturesCache: newFixturesCache,
      };
    }

    case 'SET_LINEUP_CACHE': {
      const newLineupCache = new Map(state.lineupCache);
      newLineupCache.set(action.payload.fixtureId, action.payload.lineup);
      return {
        ...state,
        lineupCache: newLineupCache,
      };
    }

    // UI actions
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    // Reset actions
    case 'RESET_SELECTION':
      return {
        ...state,
        selectedLeague: null,
        selectedSeason: null,
        selectedTeam: null,
        selectedFixture: null,
      };

    case 'RESET_GAME':
      return {
        ...state,
        currentGame: null,
        selectedFixture: null,
      };

    default:
      return state;
  }
}

// ============================================================================
// Context
// ============================================================================

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const storageService = new StorageService();

  // Initialize state from localStorage on mount
  useEffect(() => {
    if (storageService.isAvailable()) {
      // Load saved game state
      const savedGameState = storageService.loadGameState();
      if (savedGameState) {
        dispatch({ type: 'SET_GAME', payload: savedGameState });
      }
    }
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (state.currentGame && storageService.isAvailable()) {
      storageService.saveGameState(state.currentGame);
    }
  }, [state.currentGame]);

  const value = { state, dispatch };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Hook to access the full app state and dispatch
 */
export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}

/**
 * Hook for league selection functionality
 */
export function useLeagueSelection() {
  const { state, dispatch } = useAppState();

  const setLeague = (league: League | null) => {
    dispatch({ type: 'SET_LEAGUE', payload: league });
  };

  const setLeaguesCache = (leagues: League[]) => {
    dispatch({ type: 'SET_LEAGUES_CACHE', payload: leagues });
  };

  return {
    selectedLeague: state.selectedLeague,
    leaguesCache: state.leaguesCache,
    setLeague,
    setLeaguesCache,
  };
}

/**
 * Hook for season selection functionality
 */
export function useSeasonSelection() {
  const { state, dispatch } = useAppState();

  const setSeason = (season: Season | null) => {
    dispatch({ type: 'SET_SEASON', payload: season });
  };

  const setSeasonsCache = (leagueId: number, seasons: Season[]) => {
    dispatch({ type: 'SET_SEASONS_CACHE', payload: { leagueId, seasons } });
  };

  const getSeasonsForLeague = (leagueId: number): Season[] => {
    return state.seasonsCache.get(leagueId) || [];
  };

  return {
    selectedSeason: state.selectedSeason,
    selectedLeague: state.selectedLeague,
    seasonsCache: state.seasonsCache,
    setSeason,
    setSeasonsCache,
    getSeasonsForLeague,
  };
}

/**
 * Hook for team selection functionality
 */
export function useTeamSelection() {
  const { state, dispatch } = useAppState();

  const setTeam = (team: Team | null) => {
    dispatch({ type: 'SET_TEAM', payload: team });
  };

  const setFixture = (fixture: Fixture | null) => {
    dispatch({ type: 'SET_FIXTURE', payload: fixture });
  };

  const setTeamsCache = (leagueId: number, season: number, teams: Team[]) => {
    const key = `${leagueId}-${season}`;
    dispatch({ type: 'SET_TEAMS_CACHE', payload: { key, teams } });
  };

  const getTeamsForLeagueSeason = (leagueId: number, season: number): Team[] => {
    const key = `${leagueId}-${season}`;
    return state.teamsCache.get(key) || [];
  };

  const setFixturesCache = (teamId: number, season: number, fixtures: Fixture[]) => {
    const key = `${teamId}-${season}`;
    dispatch({ type: 'SET_FIXTURES_CACHE', payload: { key, fixtures } });
  };

  const getFixturesForTeamSeason = (teamId: number, season: number): Fixture[] => {
    const key = `${teamId}-${season}`;
    return state.fixturesCache.get(key) || [];
  };

  return {
    selectedTeam: state.selectedTeam,
    selectedSeason: state.selectedSeason,
    selectedLeague: state.selectedLeague,
    selectedFixture: state.selectedFixture,
    teamsCache: state.teamsCache,
    fixturesCache: state.fixturesCache,
    setTeam,
    setFixture,
    setTeamsCache,
    getTeamsForLeagueSeason,
    setFixturesCache,
    getFixturesForTeamSeason,
  };
}

/**
 * Hook for game state functionality
 */
export function useGameState() {
  const { state, dispatch } = useAppState();
  const storageService = new StorageService();

  const setGame = (game: GameState | null) => {
    dispatch({ type: 'SET_GAME', payload: game });
  };

  const updateGame = (updates: Partial<GameState>) => {
    dispatch({ type: 'UPDATE_GAME', payload: updates });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
    if (storageService.isAvailable()) {
      storageService.clearGameState();
    }
  };

  const setLineupCache = (fixtureId: number, lineup: Lineup) => {
    dispatch({ type: 'SET_LINEUP_CACHE', payload: { fixtureId, lineup } });
  };

  const getLineupForFixture = (fixtureId: number): Lineup | undefined => {
    return state.lineupCache.get(fixtureId);
  };

  return {
    currentGame: state.currentGame,
    selectedFixture: state.selectedFixture,
    selectedTeam: state.selectedTeam,
    lineupCache: state.lineupCache,
    setGame,
    updateGame,
    resetGame,
    setLineupCache,
    getLineupForFixture,
  };
}
