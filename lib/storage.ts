// Storage Service for Classic Caps
// Handles localStorage operations for game state and API caching
// Requirements: 9.1, 9.2, 9.3, 9.4, 12.3

import {
  GameState,
  SerializedGameState,
  CacheEntry,
  isSerializedGameState,
} from '@/types';

/**
 * StorageService class handles all localStorage operations
 * Provides methods for game state persistence and API response caching
 */
export class StorageService {
  private static readonly GAME_STATE_KEY = 'classic-caps-game-state';
  private static readonly CACHE_PREFIX = 'classic-caps-api-cache-';
  private static readonly STORAGE_VERSION = 1;

  /**
   * Check if localStorage is available
   * @returns true if localStorage is available and working
   */
  isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Save game state to localStorage
   * Requirements: 9.1, 9.3
   * @param state - Current game state to save
   */
  saveGameState(state: GameState): void {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available, game state will not be persisted');
      return;
    }

    try {
      // Convert Map to plain object for serialization
      const guessedPlayersObj: SerializedGameState['guessedPlayers'] = {};
      state.guessedPlayers.forEach((guess, position) => {
        guessedPlayersObj[position.toString()] = {
          playerName: guess.playerName,
          isCorrect: guess.isCorrect,
          attemptCount: guess.attemptCount,
        };
      });

      const serialized: SerializedGameState = {
        version: StorageService.STORAGE_VERSION,
        fixtureId: state.fixtureId,
        teamId: state.teamId,
        startTime: state.startTime,
        guessedPlayers: guessedPlayersObj,
        attempts: state.attempts,
        completed: state.completed,
        lastUpdated: Date.now(),
      };

      localStorage.setItem(
        StorageService.GAME_STATE_KEY,
        JSON.stringify(serialized)
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded, attempting to clear expired cache');
        this.clearExpiredCache();
        // Retry once after clearing cache
        try {
          const guessedPlayersObj: SerializedGameState['guessedPlayers'] = {};
          state.guessedPlayers.forEach((guess, position) => {
            guessedPlayersObj[position.toString()] = {
              playerName: guess.playerName,
              isCorrect: guess.isCorrect,
              attemptCount: guess.attemptCount,
            };
          });

          const serialized: SerializedGameState = {
            version: StorageService.STORAGE_VERSION,
            fixtureId: state.fixtureId,
            teamId: state.teamId,
            startTime: state.startTime,
            guessedPlayers: guessedPlayersObj,
            attempts: state.attempts,
            completed: state.completed,
            lastUpdated: Date.now(),
          };

          localStorage.setItem(
            StorageService.GAME_STATE_KEY,
            JSON.stringify(serialized)
          );
        } catch (retryError) {
          console.error('Failed to save game state after clearing cache:', retryError);
        }
      } else {
        console.error('Error saving game state:', error);
      }
    }
  }

  /**
   * Load game state from localStorage
   * Requirements: 9.2
   * @returns GameState if found and valid, null otherwise
   */
  loadGameState(): GameState | null {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const stored = localStorage.getItem(StorageService.GAME_STATE_KEY);
      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored);
      
      // Validate the structure
      if (!isSerializedGameState(parsed)) {
        console.warn('Invalid game state structure, clearing');
        this.clearGameState();
        return null;
      }

      // Check version compatibility
      if (parsed.version !== StorageService.STORAGE_VERSION) {
        console.warn('Game state version mismatch, clearing');
        this.clearGameState();
        return null;
      }

      // Convert plain object back to Map
      const guessedPlayers = new Map();
      Object.entries(parsed.guessedPlayers).forEach(([position, guess]) => {
        guessedPlayers.set(parseInt(position, 10), guess);
      });

      return {
        fixtureId: parsed.fixtureId,
        teamId: parsed.teamId,
        startTime: parsed.startTime,
        guessedPlayers,
        attempts: parsed.attempts,
        completed: parsed.completed,
      };
    } catch (error) {
      console.error('Error loading game state:', error);
      return null;
    }
  }

  /**
   * Clear game state from localStorage
   * Requirements: 9.4
   */
  clearGameState(): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(StorageService.GAME_STATE_KEY);
    } catch (error) {
      console.error('Error clearing game state:', error);
    }
  }

  /**
   * Save a cache entry to localStorage
   * Requirements: 4.3
   * @param key - Cache key identifier
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds
   */
  saveCacheEntry(key: string, data: any, ttl: number): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const cacheEntry: CacheEntry<any> = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      localStorage.setItem(
        `${StorageService.CACHE_PREFIX}${key}`,
        JSON.stringify(cacheEntry)
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded, clearing expired cache');
        this.clearExpiredCache();
        // Retry once after clearing cache
        try {
          const cacheEntry: CacheEntry<any> = {
            data,
            timestamp: Date.now(),
            ttl,
          };

          localStorage.setItem(
            `${StorageService.CACHE_PREFIX}${key}`,
            JSON.stringify(cacheEntry)
          );
        } catch (retryError) {
          console.error('Failed to save cache entry after clearing:', retryError);
        }
      } else {
        console.error('Error saving cache entry:', error);
      }
    }
  }

  /**
   * Get a cache entry from localStorage
   * Requirements: 4.3
   * @param key - Cache key identifier
   * @returns Cached data if found and not expired, null otherwise
   */
  getCacheEntry<T>(key: string): T | null {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const stored = localStorage.getItem(`${StorageService.CACHE_PREFIX}${key}`);
      if (!stored) {
        return null;
      }

      const parsed: CacheEntry<T> = JSON.parse(stored);
      
      // Check if cache entry is expired
      const now = Date.now();
      const age = now - parsed.timestamp;
      
      if (age >= parsed.ttl) {
        // Cache expired, remove it
        localStorage.removeItem(`${StorageService.CACHE_PREFIX}${key}`);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Error getting cache entry:', error);
      return null;
    }
  }

  /**
   * Clear all expired cache entries from localStorage
   * Requirements: 12.3
   */
  clearExpiredCache(): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      // Find all cache keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(StorageService.CACHE_PREFIX)) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const parsed: CacheEntry<any> = JSON.parse(stored);
              const age = now - parsed.timestamp;
              
              if (age >= parsed.ttl) {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            // If we can't parse it, mark it for removal
            keysToRemove.push(key);
          }
        }
      }

      // Remove expired entries
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      if (keysToRemove.length > 0) {
        console.log(`Cleared ${keysToRemove.length} expired cache entries`);
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  /**
   * Get approximate storage size in bytes
   * @returns Approximate size of localStorage usage in bytes
   */
  getStorageSize(): number {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            // Approximate size: key length + value length in bytes (UTF-16)
            total += (key.length + value.length) * 2;
          }
        }
      }
      return total;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }

  /**
   * Clear all cache entries (but preserve game state)
   */
  clearAllCache(): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(StorageService.CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log(`Cleared ${keysToRemove.length} cache entries`);
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }
}

// Export a singleton instance
export const storageService = new StorageService();
