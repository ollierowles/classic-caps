# API Error Handling and Rate Limiting

This document describes the error handling and rate limiting implementation for the Football API Service.

## Overview

The `FootballAPIService` class now includes comprehensive error handling and rate limiting features to ensure robust API interactions.

## Features Implemented

### 1. Custom APIError Class

A custom error class that extends the native `Error` class with additional properties:

- `statusCode`: HTTP status code (0 for network errors)
- `message`: User-friendly error message
- `retryable`: Boolean flag indicating if the operation can be retried

```typescript
throw new APIError(429, 'Rate limit exceeded', true);
```

### 2. Rate Limiting (429 Responses)

The `handleRateLimit()` method implements intelligent retry logic:

- Checks for `Retry-After` header from the API
- Falls back to exponential backoff: 1s, 2s, 4s, 8s
- Maximum of 3 retry attempts
- Automatically retries after the calculated delay

### 3. Error Code Handling

The `handleAPIError()` method provides user-friendly messages for various HTTP status codes:

- **400**: Invalid request (not retryable)
- **401**: Authentication failed (not retryable)
- **403**: Access forbidden (not retryable)
- **404**: Data not found (not retryable)
- **429**: Rate limit exceeded (retryable)
- **500-504**: Server errors (retryable)

### 4. Offline Detection

The `isOffline()` method checks `navigator.onLine` to detect offline state before making requests:

```typescript
if (this.isOffline()) {
  throw new APIError(0, 'You appear to be offline...', true);
}
```

### 5. Exponential Backoff Retry Logic

For server errors (5xx) and rate limiting (429):

- Initial delay: 1 second
- Exponential backoff: delay × 2^retryCount
- Maximum 3 retry attempts
- Automatic retry for retryable errors

### 6. Network Error Handling

Catches and handles network-level errors:

- Fetch failures (network disconnection)
- Timeout errors
- DNS resolution failures

All network errors are marked as retryable.

## Usage Example

```typescript
import { footballAPIService, APIError } from '@/lib/api';

try {
  const leagues = await footballAPIService.getLeagues();
  // Process leagues...
} catch (error) {
  if (error instanceof APIError) {
    // Display user-friendly error message
    console.error(error.message);
    
    // Check if retry is possible
    if (error.retryable) {
      // Show retry button to user
    }
  }
}
```

## Error Flow

1. **Request Initiated**: Check if offline
2. **Fetch Executed**: Make API request
3. **Response Received**: Check status code
4. **Rate Limited (429)**: Calculate delay and retry
5. **Server Error (5xx)**: Apply exponential backoff and retry
6. **Client Error (4xx)**: Throw non-retryable error
7. **Network Error**: Throw retryable error
8. **Max Retries Exceeded**: Throw final error

## Requirements Satisfied

- **4.2**: Handle rate limits and API errors gracefully
- **4.4**: Provide retry options for failed requests
- **12.1**: Display user-friendly error messages
- **12.4**: Handle network errors with clear feedback

## Testing

A test file is available at `lib/api.test.ts` to verify the error handling implementation.

## Future Enhancements

- Add request queuing for rate limit management
- Implement circuit breaker pattern for repeated failures
- Add telemetry for error tracking
- Support for request cancellation
