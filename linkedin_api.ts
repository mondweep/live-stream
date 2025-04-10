/**
 * LinkedIn API Module
 * 
 * This module provides functions for interacting with the LinkedIn Live API.
 * It encapsulates the API calls and provides TypeScript interfaces for the data models.
 */

/**
 * Base LinkedIn API URL
 */
const LINKEDIN_API_BASE_URL = 'https://api.linkedin.com/v2';

/**
 * Interface for LinkedIn URN (Uniform Resource Name)
 * LinkedIn uses URNs to uniquely identify resources
 */
export interface LinkedInUrn {
  toString(): string;
}

/**
 * Person URN class
 */
export class PersonUrn implements LinkedInUrn {
  private id: string;

  constructor(id: string) {
    // If the ID is already a URN, extract just the ID part
    if (id.startsWith('urn:li:person:')) {
      this.id = id.replace('urn:li:person:', '');
    } else {
      this.id = id;
    }
  }

  toString(): string {
    return `urn:li:person:${this.id}`;
  }
}

/**
 * Organization URN class
 */
export class OrganizationUrn implements LinkedInUrn {
  private id: string;

  constructor(id: string) {
    // If the ID is already a URN, extract just the ID part
    if (id.startsWith('urn:li:organization:')) {
      this.id = id.replace('urn:li:organization:', '');
    } else {
      this.id = id;
    }
  }

  toString(): string {
    return `urn:li:organization:${this.id}`;
  }
}

/**
 * Live Video URN class
 */
export class LiveVideoUrn implements LinkedInUrn {
  private id: string;

  constructor(id: string) {
    // If the ID is already a URN, extract just the ID part
    if (id.startsWith('urn:li:liveVideo:')) {
      this.id = id.replace('urn:li:liveVideo:', '');
    } else {
      this.id = id;
    }
  }

  toString(): string {
    return `urn:li:liveVideo:${this.id}`;
  }
}

/**
 * Scheduled Live Event URN class
 */
export class ScheduledLiveEventUrn implements LinkedInUrn {
  private id: string;

  constructor(id: string) {
    // If the ID is already a URN, extract just the ID part
    if (id.startsWith('urn:li:scheduledLiveEvent:')) {
      this.id = id.replace('urn:li:scheduledLiveEvent:', '');
    } else {
      this.id = id;
    }
  }

  toString(): string {
    return `urn:li:scheduledLiveEvent:${this.id}`;
  }
}

/**
 * Interface for LinkedIn Live Video
 */
export interface LinkedInLiveVideo {
  owner: string; // URN of the owner (person or organization)
  broadcastStartTime?: number; // Unix timestamp in milliseconds
  broadcastEndTime?: number; // Unix timestamp in milliseconds
  title?: string;
  description?: string;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
  originalMediaSize?: {
    width: number;
    height: number;
  };
  targetAudiences?: Array<{
    targetAudience: string; // URN of the target audience
  }>;
}

/**
 * Interface for LinkedIn Live Video Response
 */
export interface LinkedInLiveVideoResponse {
  id: string; // URN of the live video
  status: 'DRAFT' | 'READY' | 'BROADCASTING' | 'PUBLISHED' | 'ENDED';
  owner: string; // URN of the owner
  broadcastStartTime?: number;
  broadcastEndTime?: number;
  title?: string;
  description?: string;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
  originalMediaSize?: {
    width: number;
    height: number;
  };
  streamingDetails?: {
    ingestUrl: string;
    streamKey: string;
  };
}

/**
 * Interface for LinkedIn Scheduled Live Event
 */
export interface LinkedInScheduledLiveEvent {
  owner: string; // URN of the owner (person or organization)
  startTime: number; // Unix timestamp in milliseconds
  endTime: number; // Unix timestamp in milliseconds
  title: string;
  description?: string;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
  originalMediaSize?: {
    width: number;
    height: number;
  };
  targetAudiences?: Array<{
    targetAudience: string; // URN of the target audience
  }>;
}

/**
 * Interface for LinkedIn Scheduled Live Event Response
 */
export interface LinkedInScheduledLiveEventResponse {
  id: string; // URN of the scheduled live event
  status: 'DRAFT' | 'SCHEDULED' | 'BROADCASTING' | 'ENDED';
  owner: string; // URN of the owner
  startTime: number;
  endTime: number;
  title: string;
  description?: string;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
  originalMediaSize?: {
    width: number;
    height: number;
  };
  liveVideoUrn?: string; // Available when the event is ready to broadcast
}

/**
 * Interface for LinkedIn UGC Post
 */
export interface LinkedInUgcPost {
  author: string; // URN of the author (person or organization)
  lifecycleState?: 'PUBLISHED' | 'DRAFT';
  specificContent: {
    com_linkedin_ugc_ShareContent: {
      shareCommentary?: {
        text: string;
      };
      shareMediaCategory: 'NONE' | 'ARTICLE' | 'IMAGE' | 'RICH' | 'VIDEO' | 'LIVE_VIDEO';
      media?: Array<{
        status?: 'READY';
        originalUrl?: string;
        media?: string; // URN of the media (e.g., live video)
        title?: {
          text: string;
        };
        description?: {
          text: string;
        };
      }>;
    };
  };
  visibility: {
    com_linkedin_ugc_MemberNetworkVisibility: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN';
  };
}

/**
 * Interface for LinkedIn UGC Post Response
 */
export interface LinkedInUgcPostResponse {
  id: string; // URN of the UGC post
  author: string;
  lifecycleState: 'PUBLISHED' | 'DRAFT';
  specificContent: {
    com_linkedin_ugc_ShareContent: {
      shareCommentary?: {
        text: string;
      };
      shareMediaCategory: 'NONE' | 'ARTICLE' | 'IMAGE' | 'RICH' | 'VIDEO' | 'LIVE_VIDEO';
      media?: Array<{
        status: 'READY';
        originalUrl?: string;
        media: string; // URN of the media
        title?: {
          text: string;
        };
        description?: {
          text: string;
        };
      }>;
    };
  };
  visibility: {
    com_linkedin_ugc_MemberNetworkVisibility: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN';
  };
  created: {
    time: number; // Unix timestamp in milliseconds
  };
}

/**
 * Interface for LinkedIn Content Access Response
 */
export interface LinkedInContentAccessResponse {
  canBroadcast: boolean;
  eligibleBroadcasters?: Array<{
    broadcaster: string; // URN of the broadcaster (person or organization)
    broadcastEligibilityStatus: 'ELIGIBLE' | 'INELIGIBLE';
    ineligibilityReason?: string;
  }>;
}

/**
 * Interface for LinkedIn API Error
 */
export interface LinkedInApiError {
  status?: number;
  code?: string;
  message?: string;
  serviceErrorCode?: number;
  serviceErrorMessage?: string;
}

/**
 * Class for handling LinkedIn API errors
 */
export class LinkedInApiException extends Error {
  status?: number;
  code?: string;
  serviceErrorCode?: number;
  serviceErrorMessage?: string;

  constructor(error: LinkedInApiError) {
    super(error.message || error.serviceErrorMessage || 'LinkedIn API Error');
    this.name = 'LinkedInApiException';
    this.status = error.status;
    this.code = error.code;
    this.serviceErrorCode = error.serviceErrorCode;
    this.serviceErrorMessage = error.serviceErrorMessage;
  }
}

/**
 * Checks if a user or organization has access to LinkedIn Live
 * 
 * @param accessToken OAuth 2.0 access token
 * @param ownerUrn URN of the owner (person or organization)
 * @returns Content access response
 * @throws LinkedInApiException if the API call fails
 */
export async function checkContentAccess(
  accessToken: string,
  ownerUrn: LinkedInUrn
): Promise<LinkedInContentAccessResponse> {
  try {
    const response = await fetch(
      `${LINKEDIN_API_BASE_URL}/contentAccess?q=owner&owner=${ownerUrn.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json() as LinkedInApiError;
      throw new LinkedInApiException(error);
    }

    return await response.json() as LinkedInContentAccessResponse;
  } catch (error) {
    if (error instanceof LinkedInApiException) {
      throw error;
    }
    throw new Error(`Failed to check LinkedIn content access: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Registers a new live event on LinkedIn
 * 
 * @param accessToken OAuth 2.0 access token
 * @param liveVideo LinkedIn live video details
 * @returns Live video response
 * @throws LinkedInApiException if the API call fails
 */
export async function registerLiveEvent(
  accessToken: string,
  liveVideo: LinkedInLiveVideo
): Promise<LinkedInLiveVideoResponse> {
  try {
    const response = await fetch(
      `${LINKEDIN_API_BASE_URL}/liveVideos`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(liveVideo),
      }
    );

    if (!response.ok) {
      const error = await response.json() as LinkedInApiError;
      throw new LinkedInApiException(error);
    }

    return await response.json() as LinkedInLiveVideoResponse;
  } catch (error) {
    if (error instanceof LinkedInApiException) {
      throw error;
    }
    throw new Error(`Failed to register LinkedIn live event: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Transitions a live event to a new state
 * 
 * @param accessToken OAuth 2.0 access token
 * @param liveVideoUrn URN of the live video
 * @param transition Transition state ('READY', 'PUBLISHED', or 'ENDED')
 * @returns Live video response
 * @throws LinkedInApiException if the API call fails
 */
export async function transitionLiveEvent(
  accessToken: string,
  liveVideoUrn: LiveVideoUrn,
  transition: 'READY' | 'PUBLISHED' | 'ENDED'
): Promise<LinkedInLiveVideoResponse> {
  try {
    const response = await fetch(
      `${LINKEDIN_API_BASE_URL}/liveVideos/${liveVideoUrn.toString()}?action=transition`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({ transition }),
      }
    );

    if (!response.ok) {
      const error = await response.json() as LinkedInApiError;
      throw new LinkedInApiException(error);
    }

    return await response.json() as LinkedInLiveVideoResponse;
  } catch (error) {
    if (error instanceof LinkedInApiException) {
      throw error;
    }
    throw new Error(`Failed to transition LinkedIn live event: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates a UGC post to share a live event
 * 
 * @param accessToken OAuth 2.0 access token
 * @param post LinkedIn UGC post details
 * @returns UGC post response
 * @throws LinkedInApiException if the API call fails
 */
export async function createUgcPost(
  accessToken: string,
  post: LinkedInUgcPost
): Promise<LinkedInUgcPostResponse> {
  try {
    const response = await fetch(
      `${LINKEDIN_API_BASE_URL}/ugcPosts`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(post),
      }
    );

    if (!response.ok) {
      const error = await response.json() as LinkedInApiError;
      throw new LinkedInApiException(error);
    }

    return await response.json() as LinkedInUgcPostResponse;
  } catch (error) {
    if (error instanceof LinkedInApiException) {
      throw error;
    }
    throw new Error(`Failed to create LinkedIn UGC post: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates a scheduled live event on LinkedIn
 * 
 * @param accessToken OAuth 2.0 access token
 * @param scheduledEvent LinkedIn scheduled live event details
 * @returns Scheduled live event response
 * @throws LinkedInApiException if the API call fails
 */
export async function createScheduledLiveEvent(
  accessToken: string,
  scheduledEvent: LinkedInScheduledLiveEvent
): Promise<LinkedInScheduledLiveEventResponse> {
  try {
    const response = await fetch(
      `${LINKEDIN_API_BASE_URL}/scheduledLiveEvents`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(scheduledEvent),
      }
    );

    if (!response.ok) {
      const error = await response.json() as LinkedInApiError;
      throw new LinkedInApiException(error);
    }

    return await response.json() as LinkedInScheduledLiveEventResponse;
  } catch (error) {
    if (error instanceof LinkedInApiException) {
      throw error;
    }
    throw new Error(`Failed to create LinkedIn scheduled live event: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Retrieves a scheduled live event by URN
 * 
 * @param accessToken OAuth 2.0 access token
 * @param scheduledEventUrn URN of the scheduled live event
 * @returns Scheduled live event response
 * @throws LinkedInApiException if the API call fails
 */
export async function getScheduledLiveEvent(
  accessToken: string,
  scheduledEventUrn: ScheduledLiveEventUrn
): Promise<LinkedInScheduledLiveEventResponse> {
  try {
    const response = await fetch(
      `${LINKEDIN_API_BASE_URL}/scheduledLiveEvents/${scheduledEventUrn.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json() as LinkedInApiError;
      throw new LinkedInApiException(error);
    }

    return await response.json() as LinkedInScheduledLiveEventResponse;
  } catch (error) {
    if (error instanceof LinkedInApiException) {
      throw error;
    }
    throw new Error(`Failed to retrieve LinkedIn scheduled live event: ${error instanceof Error ? error.message : String(error)}`);
  }
}