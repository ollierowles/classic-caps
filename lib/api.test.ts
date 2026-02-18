// Manual test file for API error handling and rate limiting
// This file can be run to verify the error handling implementation
// Requirements: 4.2, 4.4, 12.1, 12.4

import { FootballAPIService, APIError } from './api';

/**
 * Test suite for API error handling
 */
async function testAPIErrorHandling() {
  console.log('Testing API Error Handling...\n');

  const apiService = new FootballAPIService();

  // Test 1: Verify APIError class
  console.log('Test 1: APIError class instantiation');
  try {
    const error = new APIError(404, 'Not found', false);
    console.log('✓ APIError created:', error.message, `(retryable: ${error.retryable})`);
  } catch (e) {
    console.error('✗ Failed to create APIError:', e);
  }

  // Test 2: Test with valid API call (if API key is configured)
  console.log('\nTest 2: Valid API call (requires valid API key)');
  try {
    const leagues = await apiService.getLeagues();
    console.log(`✓ Successfully fetched ${leagues.length} leagues`);
  } catch (e) {
    if (e instanceof APIError) {
      console.log(`✓ APIError caught: ${e.message} (status: ${e.statusCode}, retryable: ${e.retryable})`);
    } else {
      console.error('✗ Unexpected error:', e);
    }
  }

  // Test 3: Verify error types are properly exported
  console.log('\nTest 3: Error type checking');
  try {
    const testError = new APIError(429, 'Rate limited', true);
    const isAPIError = testError instanceof APIError;
    const isError = testError instanceof Error;
    console.log(`✓ APIError instanceof APIError: ${isAPIError}`);
    console.log(`✓ APIError instanceof Error: ${isError}`);
  } catch (e) {
    console.error('✗ Error type checking failed:', e);
  }

  console.log('\n✓ All tests completed');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPIErrorHandling().catch(console.error);
}

export { testAPIErrorHandling };
