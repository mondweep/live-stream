# YouTube and LinkedIn API Modules for Deno

This project provides Deno modules for interacting with the YouTube and LinkedIn APIs, specifically focused on live streaming functionality. These modules encapsulate the API calls and data models, making it easier to integrate with these platforms.

## Modules

### YouTube API (`youtube_api.ts`)

This module provides functions for interacting with the YouTube Live API:

- `insertLiveBroadcast`: Create a new live broadcast
- `updateLiveBroadcast`: Update an existing live broadcast
- `transitionLiveBroadcast`: Transition the state of a live broadcast (testing, live, complete)
- `insertLiveStream`: Create a new live stream
- `bindLiveStream`: Bind a live stream to a live broadcast

### LinkedIn API (`linkedin_api.ts`)

This module provides functions for interacting with the LinkedIn Live API:

- `checkContentAccess`: Check if a user/page has access to LinkedIn Live
- `registerLiveEvent`: Create a new live event
- `transitionLiveEvent`: Transition a live event to a new state (READY, PUBLISHED, ENDED)
- `createUgcPost`: Create a UGC post to share a live event
- `createScheduledLiveEvent`: Create a scheduled live event
- `getScheduledLiveEvent`: Retrieve a scheduled live event by URN

## Usage

### Authentication

Both APIs require OAuth 2.0 authentication. The project includes an OAuth 2.0 implementation in `oauth2.ts` that handles the authentication flow for both platforms.

### Example Usage

The `api_examples.ts` file contains example functions demonstrating how to use the API modules:

#### YouTube Examples

```typescript
// Create a YouTube live broadcast and stream
const result = await createYouTubeLiveStream(request);

// Start a YouTube live broadcast
const result = await startYouTubeLiveStream(request, broadcastId);

// End a YouTube live broadcast
const result = await endYouTubeLiveStream(request, broadcastId);
```

#### LinkedIn Examples

```typescript
// Check if a LinkedIn user has access to LinkedIn Live
const result = await checkLinkedInLiveAccess(request, personId);

// Create a LinkedIn live event
const result = await createLinkedInLiveEvent(request, personId);

// Create a LinkedIn scheduled live event
const result = await createLinkedInScheduledEvent(request, personId);

// Share a LinkedIn live event as a post
const result = await shareLinkedInLiveEvent(request, personId, liveVideoId);

// End a LinkedIn live event
const result = await endLinkedInLiveEvent(request, liveVideoId);
```

## Data Models

### YouTube Data Models

- `YouTubeLiveBroadcast`: Represents a YouTube live broadcast
- `YouTubeLiveStream`: Represents a YouTube live stream
- `YouTubeLiveBroadcastTransition`: Represents a transition of a YouTube live broadcast
- `YouTubeLiveStreamBind`: Represents a binding between a YouTube live broadcast and a live stream

### LinkedIn Data Models

- `LinkedInUrn`: Base interface for LinkedIn URNs
- `PersonUrn`: Represents a LinkedIn person URN
- `OrganizationUrn`: Represents a LinkedIn organization URN
- `LiveVideoUrn`: Represents a LinkedIn live video URN
- `ScheduledLiveEventUrn`: Represents a LinkedIn scheduled live event URN
- `LinkedInLiveVideo`: Represents a LinkedIn live video
- `LinkedInScheduledLiveEvent`: Represents a LinkedIn scheduled live event
- `LinkedInUgcPost`: Represents a LinkedIn UGC post

## Error Handling

Both modules include custom error classes (`YouTubeApiException` and `LinkedInApiException`) that provide detailed information about API errors.

## Requirements

- Deno 1.x or higher
- OAuth 2.0 credentials for YouTube and LinkedIn
- Appropriate API access and permissions for both platforms

## Setup

1. Clone the repository
2. Set up environment variables for OAuth credentials:
   - `YOUTUBE_CLIENT_ID`
   - `YOUTUBE_CLIENT_SECRET`
   - `LINKEDIN_CLIENT_ID`
   - `LINKEDIN_CLIENT_SECRET`
   - `ENCRYPTION_KEY` (for secure token storage)
3. Run the application using Deno:
   ```
   deno run --allow-net --allow-env main.ts
   ```

## License

MIT# live-stream
