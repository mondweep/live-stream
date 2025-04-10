/**
 * YouTube API Module
 * 
 * This module provides functions for interacting with the YouTube Live API.
 * It encapsulates the API calls and provides TypeScript interfaces for the data models.
 */

/**
 * Interface for YouTube Live Broadcast
 */
export interface YouTubeLiveBroadcast {
  // Basic broadcast information
  id?: string;
  snippet: {
    title: string;
    description: string;
    scheduledStartTime?: string; // ISO 8601 format
    scheduledEndTime?: string; // ISO 8601 format
  };
  status: {
    privacyStatus: 'public' | 'private' | 'unlisted';
    selfDeclaredMadeForKids?: boolean;
  };
  contentDetails?: {
    enableAutoStart?: boolean;
    enableAutoStop?: boolean;
    enableDvr?: boolean;
    enableContentEncryption?: boolean;
    enableEmbed?: boolean;
    recordFromStart?: boolean;
    startWithSlate?: boolean;
  };
}

/**
 * Interface for YouTube Live Stream
 */
export interface YouTubeLiveStream {
  // Basic stream information
  id?: string;
  snippet: {
    title: string;
    description: string;
  };
  cdn: {
    format?: string; // e.g., "1080p"
    ingestionType: 'rtmp' | 'dash' | 'webrtc';
    ingestionInfo?: {
      streamName?: string;
      ingestionAddress?: string;
      backupIngestionAddress?: string;
      rtmpsIngestionAddress?: string;
      backupRtmpsIngestionAddress?: string;
    };
    resolution?: string;
    frameRate?: string;
  };
}

/**
 * Interface for YouTube Live Broadcast Transition
 */
export interface YouTubeLiveBroadcastTransition {
  id: string;
  broadcastStatus: 'testing' | 'live' | 'complete';
}

/**
 * Interface for YouTube Live Stream Bind
 */
export interface YouTubeLiveStreamBind {
  broadcastId: string;
  streamId: string;
}

/**
 * Interface for YouTube API Error
 */
export interface YouTubeApiError {
  code: number;
  message: string;
  errors?: Array<{
    message: string;
    domain: string;
    reason: string;
  }>;
}

/**
 * Class for handling YouTube API errors
 */
export class YouTubeApiException extends Error {
  code: number;
  errors?: Array<{
    message: string;
    domain: string;
    reason: string;
  }>;

  constructor(error: YouTubeApiError) {
    super(error.message);
    this.name = 'YouTubeApiException';
    this.code = error.code;
    this.errors = error.errors;
  }
}

/**
 * Creates a new live broadcast on YouTube
 * 
 * @param accessToken OAuth 2.0 access token
 * @param broadcast YouTube live broadcast details
 * @returns The created broadcast object
 * @throws YouTubeApiException if the API call fails
 */
export async function insertLiveBroadcast(
  accessToken: string,
  broadcast: YouTubeLiveBroadcast
): Promise<YouTubeLiveBroadcast> {
  try {
    const response = await fetch(
      'https://youtube.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,contentDetails,status',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(broadcast),
      }
    );

    if (!response.ok) {
      const error = await response.json() as YouTubeApiError;
      throw new YouTubeApiException(error);
    }

    return await response.json() as YouTubeLiveBroadcast;
  } catch (error) {
    if (error instanceof YouTubeApiException) {
      throw error;
    }
    throw new Error(`Failed to create YouTube live broadcast: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Updates an existing live broadcast on YouTube
 * 
 * @param accessToken OAuth 2.0 access token
 * @param broadcast YouTube live broadcast details (must include id)
 * @returns The updated broadcast object
 * @throws YouTubeApiException if the API call fails
 */
export async function updateLiveBroadcast(
  accessToken: string,
  broadcast: YouTubeLiveBroadcast
): Promise<YouTubeLiveBroadcast> {
  if (!broadcast.id) {
    throw new Error('Broadcast ID is required for update operation');
  }

  try {
    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,contentDetails,status`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(broadcast),
      }
    );

    if (!response.ok) {
      const error = await response.json() as YouTubeApiError;
      throw new YouTubeApiException(error);
    }

    return await response.json() as YouTubeLiveBroadcast;
  } catch (error) {
    if (error instanceof YouTubeApiException) {
      throw error;
    }
    throw new Error(`Failed to update YouTube live broadcast: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Transitions the state of a live broadcast on YouTube
 * 
 * @param accessToken OAuth 2.0 access token
 * @param transition Transition details
 * @returns The updated broadcast object
 * @throws YouTubeApiException if the API call fails
 */
export async function transitionLiveBroadcast(
  accessToken: string,
  transition: YouTubeLiveBroadcastTransition
): Promise<YouTubeLiveBroadcast> {
  try {
    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/liveBroadcasts/transition?id=${transition.id}&broadcastStatus=${transition.broadcastStatus}&part=snippet,status,contentDetails`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json() as YouTubeApiError;
      throw new YouTubeApiException(error);
    }

    return await response.json() as YouTubeLiveBroadcast;
  } catch (error) {
    if (error instanceof YouTubeApiException) {
      throw error;
    }
    throw new Error(`Failed to transition YouTube live broadcast: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates a new live stream on YouTube
 * 
 * @param accessToken OAuth 2.0 access token
 * @param stream YouTube live stream details
 * @returns The created stream object
 * @throws YouTubeApiException if the API call fails
 */
export async function insertLiveStream(
  accessToken: string,
  stream: YouTubeLiveStream
): Promise<YouTubeLiveStream> {
  try {
    const response = await fetch(
      'https://youtube.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stream),
      }
    );

    if (!response.ok) {
      const error = await response.json() as YouTubeApiError;
      throw new YouTubeApiException(error);
    }

    return await response.json() as YouTubeLiveStream;
  } catch (error) {
    if (error instanceof YouTubeApiException) {
      throw error;
    }
    throw new Error(`Failed to create YouTube live stream: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Binds a live stream to a live broadcast on YouTube
 * 
 * @param accessToken OAuth 2.0 access token
 * @param bind Binding details
 * @returns The updated broadcast object
 * @throws YouTubeApiException if the API call fails
 */
export async function bindLiveStream(
  accessToken: string,
  bind: YouTubeLiveStreamBind
): Promise<YouTubeLiveBroadcast> {
  try {
    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/liveBroadcasts/bind?id=${bind.broadcastId}&streamId=${bind.streamId}&part=snippet,contentDetails,status`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json() as YouTubeApiError;
      throw new YouTubeApiException(error);
    }

    return await response.json() as YouTubeLiveBroadcast;
  } catch (error) {
    if (error instanceof YouTubeApiException) {
      throw error;
    }
    throw new Error(`Failed to bind YouTube live stream: ${error instanceof Error ? error.message : String(error)}`);
  }
}