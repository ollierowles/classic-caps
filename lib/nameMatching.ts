// Name Matching Service for Classic Caps
// Handles player name normalization, matching, and hint generation
// Requirements: 5.1, 5.2, 5.3, 6.4, 6.5

/**
 * Service for matching player names and generating letter hints
 */
export class NameMatchingService {
  // Memoization caches for expensive operations
  private normalizeCache: Map<string, string> = new Map();
  private hintCache: Map<string, string> = new Map();

  /**
   * Normalizes player names for comparison
   * - Removes accents/diacritics
   * - Converts to lowercase
   * - Trims whitespace
   * 
   * @param name - The player name to normalize
   * @returns Normalized name string
   * 
   * Requirements: 6.4, 6.5
   */
  normalize(name: string): string {
    // Check cache first
    if (this.normalizeCache.has(name)) {
      return this.normalizeCache.get(name)!;
    }

    const normalized = name
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .toLowerCase()
      .trim();

    // Cache the result
    this.normalizeCache.set(name, normalized);
    
    // Limit cache size to prevent memory issues
    if (this.normalizeCache.size > 1000) {
      const firstKey = this.normalizeCache.keys().next().value;
      if (firstKey) {
        this.normalizeCache.delete(firstKey);
      }
    }

    return normalized;
  }

  /**
   * Extracts the last name from a full player name
   * Handles compound last names (e.g., "de Ligt", "van Persie")
   * 
   * @param name - The full player name
   * @returns The last name (including prefixes like "de", "van", etc.)
   */
  getLastName(name: string): string {
    const nameParts = name.trim().split(/\s+/);
    
    // If only one part, return it
    if (nameParts.length === 1) {
      return nameParts[0];
    }
    
    // Common prefixes in compound last names
    const prefixes = ['de', 'van', 'von', 'del', 'della', 'di', 'da', 'le', 'la', 'el', 'al', 'dos', 'das', 'mac', 'mc'];
    
    // Check if second-to-last part is a prefix
    if (nameParts.length >= 2) {
      const secondToLast = nameParts[nameParts.length - 2].toLowerCase();
      if (prefixes.includes(secondToLast)) {
        // Return both prefix and last name (e.g., "de Ligt")
        return nameParts.slice(-2).join(' ');
      }
    }
    
    // Check if third-to-last part is also a prefix (e.g., "van der Berg")
    if (nameParts.length >= 3) {
      const thirdToLast = nameParts[nameParts.length - 3].toLowerCase();
      const secondToLast = nameParts[nameParts.length - 2].toLowerCase();
      if (prefixes.includes(thirdToLast) && (prefixes.includes(secondToLast) || secondToLast === 'der' || secondToLast === 'den')) {
        // Return all three parts (e.g., "van der Berg")
        return nameParts.slice(-3).join(' ');
      }
    }
    
    // Default: return last part only
    return nameParts[nameParts.length - 1];
  }

  /**
   * Checks if a guess matches the player's last name
   * Handles:
   * - Full last name matching (e.g., "de Ligt" for "Matthijs de Ligt")
   * - Partial last name matching (e.g., "Ligt" for "Matthijs de Ligt")
   * - Case-insensitive matching
   * - Accent-insensitive matching
   * 
   * @param guess - The user's guess
   * @param actualName - The actual player name
   * @returns True if the guess matches the last name, false otherwise
   * 
   * Requirements: 6.1, 6.2, 6.4, 6.5
   */
  isMatch(guess: string, actualName: string): boolean {
    const normalizedGuess = this.normalize(guess);
    const lastName = this.getLastName(actualName);
    const normalizedLastName = this.normalize(lastName);

    // Full last name match (e.g., "de ligt" matches "de Ligt")
    if (normalizedGuess === normalizedLastName) {
      return true;
    }
    
    // Partial last name match for compound names
    // Allow just the final part (e.g., "ligt" matches "de Ligt")
    const lastNameParts = lastName.split(/\s+/);
    if (lastNameParts.length > 1) {
      const finalPart = lastNameParts[lastNameParts.length - 1];
      if (normalizedGuess === this.normalize(finalPart)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generates a letter hint with underscores for each letter in the last name
   * Preserves:
   * - Hyphens in names (e.g., "Jean-Pierre")
   * - Apostrophes in names (e.g., "O'Brien")
   * - Other special characters
   * 
   * @param name - The full player name
   * @returns Letter hint string with underscores and preserved special characters for last name only
   * 
   * Requirements: 5.1, 5.2, 5.3
   */
  generateLetterHint(name: string): string {
    // Check cache first
    if (this.hintCache.has(name)) {
      return this.hintCache.get(name)!;
    }

    // Extract last name only
    const lastName = this.getLastName(name);

    const hint = lastName
      .split('')
      .map(char => {
        // Preserve hyphens
        if (char === '-') {
          return '-';
        }
        // Preserve apostrophes
        if (char === "'") {
          return "'";
        }
        // Preserve periods (for abbreviated names)
        if (char === '.') {
          return '.';
        }
        // Replace all other characters with underscores
        return '_';
      })
      .join('');

    // Cache the result
    this.hintCache.set(name, hint);
    
    // Limit cache size to prevent memory issues
    if (this.hintCache.size > 1000) {
      const firstKey = this.hintCache.keys().next().value;
      if (firstKey) {
        this.hintCache.delete(firstKey);
      }
    }

    return hint;
  }
}

// Export a singleton instance for convenience
export const nameMatchingService = new NameMatchingService();
