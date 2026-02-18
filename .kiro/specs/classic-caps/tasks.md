# Implementation Plan: Classic Caps

## Overview

This implementation plan breaks down the Classic Caps football lineup guessing game into discrete, incremental coding tasks. The application will be built using Next.js 14+ with TypeScript, Tailwind CSS for styling, and client-side state management. Each task builds on previous work, with checkpoints to ensure functionality before proceeding.

## Tasks

- [x] 1. Initialize Next.js project and configure dependencies
  - Create Next.js 14+ project with TypeScript and App Router
  - Install and configure Tailwind CSS
  - Set up project structure: `/app`, `/components`, `/lib`, `/types`
  - Create environment variables file for API configuration
  - _Requirements: 11.1, 11.2_

- [x] 2. Define core TypeScript types and interfaces
  - Create `/types/index.ts` with League, Season, Team, Fixture, Lineup, Player, GameState interfaces
  - Define AppState interface for global state management
  - Create type guards for runtime validation
  - _Requirements: 11.1_

- [ ] 3. Implement Storage Service
  - [x] 3.1 Create StorageService class in `/lib/storage.ts`
    - Implement `saveGameState()`, `loadGameState()`, `clearGameState()` methods
    - Implement `saveCacheEntry()`, `getCacheEntry()` for API caching
    - Add `isAvailable()` check for localStorage support
    - Handle QuotaExceededError gracefully
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 12.3_

- [ ] 4. Implement Name Matching Service
  - [x] 4.1 Create NameMatchingService class in `/lib/nameMatching.ts`
    - Implement `normalize()` method to remove accents and convert to lowercase
    - Implement `isMatch()` method to compare guess with actual name
    - Implement `generateLetterHint()` to create underscore hints with preserved spaces and special characters
    - Handle full name, last name only, and common variations
    - _Requirements: 5.1, 5.2, 5.3, 6.4, 6.5_

- [ ] 5. Implement Football API Service
  - [x] 5.1 Create FootballAPIService class in `/lib/api.ts`
    - Set up base URL and API key from environment variables
    - Implement `getLeagues()` method with caching
    - Implement `getLeagueSeasons()` method with caching
    - Implement `getTeamsByLeagueSeason()` method with caching
    - Implement `getFixtures()` method with caching
    - Implement `getLineup()` method with indefinite caching
    - _Requirements: 4.1, 4.3_
  
  - [x] 5.2 Add error handling and rate limiting
    - Implement `handleRateLimit()` for 429 responses
    - Implement `handleAPIError()` for various error codes
    - Add exponential backoff retry logic
    - Detect offline state and provide appropriate feedback
    - _Requirements: 4.2, 4.4, 12.1, 12.4_

- [ ] 6. Set up global state management with React Context
  - [x] 6.1 Create AppContext in `/lib/context.tsx`
    - Define AppState and AppActions
    - Implement context provider with useReducer
    - Create custom hooks: `useAppState()`, `useLeagueSelection()`, `useSeasonSelection()`, `useTeamSelection()`, `useGameState()`
    - Initialize state from localStorage on mount
    - _Requirements: 9.2, 10.3_

- [x] 7. Checkpoint - Verify core services
  - Ensure all services are implemented and can be imported
  - Verify localStorage operations work correctly
  - Verify API service can make requests (test with console logs)
  - Ask the user if questions arise

- [ ] 8. Build League Selection Page
  - [x] 8.1 Create LeagueSelectionPage component in `/app/page.tsx`
    - Fetch and display major leagues using API service
    - Filter to show only major leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1)
    - Handle loading and error states
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 8.2 Create LeagueCard component in `/components/LeagueCard.tsx`
    - Display league logo, name, country, country flag
    - Add hover effects and click handlers
    - Make responsive for mobile/tablet/desktop
    - _Requirements: 1.1_
  
  - [x] 8.3 Style with Tailwind CSS
    - Implement grid layout (3 columns desktop, 2 tablet, 1 mobile)
    - Add football-themed color scheme
    - Style league cards with proper spacing
    - _Requirements: 1.1_

- [ ] 9. Build Season Selection Page
  - [x] 9.1 Create SeasonSelectionPage component in `/app/seasons/page.tsx`
    - Fetch seasons for selected league
    - Filter seasons to only show those with lineup coverage
    - Display seasons in reverse chronological order
    - Implement back button to return to league selection
    - Handle loading and error states
    - _Requirements: 2.1, 2.2, 2.3, 10.2_
  
  - [x] 9.2 Create SeasonCard component in `/components/SeasonCard.tsx`
    - Display season year and date range
    - Add click handler to navigate to teams
    - Style as list items with hover effects
    - _Requirements: 2.1_

- [ ] 10. Build Team Selection Page
  - [x] 10.1 Create TeamSelectionPage component in `/app/teams/page.tsx`
    - Fetch teams for selected league and season
    - Implement team search/filter functionality
    - Display teams in grid layout
    - Implement back button to return to season selection
    - Handle loading and error states
    - _Requirements: 3.1, 3.2, 3.4, 10.2_
  
  - [x] 10.2 Create TeamCard component in `/components/TeamCard.tsx`
    - Display team logo, name, and code
    - Add hover effects and click handlers
    - Make responsive for mobile/tablet/desktop
    - _Requirements: 3.2_
  
  - [x] 10.3 Add team search input
    - Implement search input with debouncing
    - Filter teams based on search query
    - Style search input
    - _Requirements: 3.4_

- [ ] 11. Build Fixture Selection Page
  - [x] 11.1 Create FixtureSelectionPage component in `/app/fixtures/page.tsx`
    - Fetch fixtures for selected team and season
    - Filter out fixtures without lineup data
    - Display fixtures in chronological order
    - Implement back button to return to team selection
    - Handle loading and error states
    - _Requirements: 4.1, 4.3, 10.2, 12.2_
  
  - [x] 11.2 Create FixtureCard component in `/components/FixtureCard.tsx`
    - Display date, competition, teams, score, venue
    - Add "Play" button to start game
    - Disable/gray out fixtures without lineup data
    - Style with proper spacing and hover effects
    - _Requirements: 4.2, 12.2_

- [x] 12. Checkpoint - Verify selection flow
  - Test navigation: League → Season → Team → Fixture
  - Verify back buttons work correctly
  - Verify state preservation when navigating back and forward
  - Ensure API caching is working
  - Ask the user if questions arise

- [ ] 12. Build Game Page - Formation Display
  - [x] 12.1 Create GamePage component in `/app/game/page.tsx`
    - Fetch lineup data for selected fixture and team
    - Initialize game state (11 empty positions)
    - Display match header with team badges, score, date
    - Display progress counter (X/11 guessed)
    - Implement back button to return to fixtures
    - _Requirements: 4.3, 8.2, 10.2_
  
  - [x] 12.2 Create FormationDisplay component in `/components/FormationDisplay.tsx`
    - Implement CSS Grid layout for 4-4-2 formation
    - Map 11 players to correct grid positions (0-10)
    - Convert API grid strings to position indices
    - Apply football pitch background styling
    - Make responsive for mobile (vertical) and desktop
    - _Requirements: 7.1, 7.2_
  
  - [x] 12.3 Create PositionSlot component in `/components/PositionSlot.tsx`
    - Display letter hint using NameMatchingService
    - Render input field for player guess
    - Show position label (GK, DEF, MID, FWD)
    - Handle three states: empty, incorrect, correct
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 13. Implement game logic and player guessing
  - [x] 13.1 Add guess validation to PositionSlot
    - Call NameMatchingService.isMatch() on input submission
    - Update game state on correct guess
    - Show visual feedback for incorrect guess (red flash)
    - Reveal full player name on correct guess
    - Disable input after correct guess
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 13.2 Implement game state persistence
    - Save game state to localStorage after each correct guess
    - Include fixture ID, team ID, guessed players, attempts, timestamp
    - Update progress counter in real-time
    - _Requirements: 9.1, 9.3_
  
  - [x] 13.3 Add game completion detection
    - Check if all 11 positions are correctly guessed
    - Track total attempts and time taken
    - Trigger congratulations modal when complete
    - _Requirements: 8.1, 8.2_

- [ ] 14. Build Congratulations Modal
  - [x] 14.1 Create CongratsModal component in `/components/CongratsModal.tsx`
    - Display celebration message and emoji
    - Show completion stats (time, attempts)
    - Add "Play Another Game" button to clear state and return to fixtures
    - Add "Back to Fixtures" button
    - Style as centered modal with overlay
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 14.2 Implement new game functionality
    - Clear game state from localStorage
    - Reset all position slots
    - Navigate back to fixture selection
    - _Requirements: 9.4_

- [x] 15. Checkpoint - Verify complete game flow
  - Test full flow: League → Season → Team → Fixture → Game → Completion
  - Verify all 11 positions can be guessed
  - Verify state persistence (refresh during game)
  - Verify congratulations modal appears on completion
  - Verify new game clears previous state
  - Ask the user if questions arise

- [ ] 16. Implement error handling UI
  - [x] 16.1 Create ErrorBoundary component in `/components/ErrorBoundary.tsx`
    - Catch React errors and display friendly message
    - Provide retry/reload options
    - _Requirements: 12.4_
  
  - [x] 16.2 Add error states to all pages
    - Display error messages for API failures
    - Show offline banner when network is unavailable
    - Add retry buttons for failed requests
    - Handle storage quota exceeded errors
    - _Requirements: 4.4, 12.1, 12.3, 12.4_

- [ ] 17. Polish UI and add responsive design
  - [x] 17.1 Refine mobile experience
    - Test all pages on mobile viewport
    - Adjust formation display for vertical layout
    - Ensure touch targets are large enough
    - Optimize font sizes for readability
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 7.1_
  
  - [x] 17.2 Add loading states and animations
    - Create LoadingSpinner component
    - Add skeleton loaders for cards
    - Implement smooth transitions between pages
    - Add correct/incorrect guess animations
    - _Requirements: 1.1, 2.1, 3.1, 4.1_
  
  - [x] 17.3 Implement accessibility features
    - Add ARIA labels to all interactive elements
    - Ensure keyboard navigation works (Tab through positions)
    - Add focus indicators
    - Test with screen reader
    - _Requirements: 6.1_

- [ ] 18. Add performance optimizations
  - [x] 18.1 Implement code splitting
    - Lazy load GamePage component
    - Add loading fallback
    - _Requirements: 11.1_
  
  - [x] 18.2 Optimize API requests
    - Verify caching is working correctly
    - Add request cancellation on navigation
    - Implement prefetching for likely next selections
    - _Requirements: 4.3_
  
  - [x] 18.3 Memoize expensive computations
    - Memoize letter hint generation
    - Memoize name normalization
    - Use React.memo for pure components
    - _Requirements: 5.1, 6.4_

- [ ] 19. Final integration and polish
  - [x] 19.1 Add app header and footer
    - Create persistent header with app title
    - Add settings icon for cache management
    - Create footer with credits/links
    - _Requirements: 1.1_
  
  - [x] 19.2 Implement cache management
    - Add settings page/modal
    - Provide manual cache clear button
    - Show cache size and API usage stats
    - _Requirements: 4.3_
  
  - [x] 19.3 Add helpful tips and instructions
    - Add tip text on game page ("Try first and last names")
    - Add instructions on first visit
    - Consider adding a help/info modal
    - _Requirements: 6.1_

- [x] 20. Final checkpoint - Complete application testing
  - Test all user flows end-to-end
  - Verify error handling works correctly
  - Test on multiple browsers (Chrome, Firefox, Safari)
  - Test on multiple devices (mobile, tablet, desktop)
  - Verify localStorage persistence works
  - Verify API caching reduces redundant requests
  - Ensure all requirements are met
  - Ask the user if questions arise

## Notes

- Each task builds incrementally on previous work
- Checkpoints ensure functionality before proceeding
- All tasks reference specific requirements for traceability
- Focus on core functionality first, then polish and optimization
- No testing tasks included per user request
- API key should be added to `.env.local` file: `NEXT_PUBLIC_FOOTBALL_API_KEY=your_key_here`
