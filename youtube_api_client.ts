/**
 * YouTube API Client Module
 * 
 * This module provides a client wrapper for the YouTube API functions.
 */

import * as youtubeApi from "./youtube_api.ts";
import stateManager from "./state_manager_extension.ts";

/**
 * Interface for YouTube API Client
 */
export interface YouTubeClient {
  createBroadcast(options: {
    title: string;
    description: string;
    scheduledStartTime?: Date;
    scheduledEndTime?: Date;
    privacyStatus: string;
  }): Promise<{ id: string }>;
  
  createStream(options: {
    title: string;
    resolution: string;
    frameRate: number;
  }): Promise<{ id: string }>;
  
  bindStreamToBroadcast(broadcastId: string, streamId: string): Promise<void>;
  
  startBroadcast(broadcastId: string): Promise<void>;
  
  endBroadcast(broadcastId: string): Promise<void>;
}

/**
 * Create a YouTube API client for a specific account
 * @param accountId The account ID to use
 * @returns A YouTube API client
 */
export function createClient(accountId: string): YouTubeClient {
  return {
    async createBroadcast(options): Promise<{ id: string }> {
      try {
        // Get account from state manager
        const account = await stateManager.getAccount("youtube", accountId);
        if (!account) {
          throw new Error(`YouTube account ${accountId} not found`);
        }
        
        // Create broadcast
        const broadcast = await youtubeApi.insertLiveBroadcast(
          account.accessToken,
          {
            snippet: {
              title: options.title,
              description: options.description,
              scheduledStartTime: options.scheduledStartTime?.toISOString(),
              scheduledEndTime: options.scheduledEndTime?.toISOString(),
            },
            status: {
              privacyStatus: options.privacyStatus as "public" | "private" | "unlisted",
              selfDeclaredMadeForKids: false,
            },
            contentDetails: {
              enableAutoStart: false,
              enableAutoStop: false,
              enableDvr: true,
              enableContentEncryption: false,
              enableEmbed: true,
              recordFromStart: true,
              startWithSlate: false,
            },
          }
        );
        
        return { id: broadcast.id || "" };
      } catch (error) {
        console.error("Error creating YouTube broadcast:", error);
        throw error;
      }
    },
    
    async createStream(options): Promise<{ id: string }> {
      try {
        // Get account from state manager
        const account = await stateManager.getAccount("youtube", accountId);
        if (!account) {
          throw new Error(`YouTube account ${accountId} not found`);
        }
        
        // Create stream
        const stream = await youtubeApi.insertLiveStream(
          account.accessToken,
          {
            snippet: {
              title: options.title,
              description: options.title,
            },
            cdn: {
              format: options.resolution,
              ingestionType: "rtmp",
              frameRate: options.frameRate.toString(),
              resolution: options.resolution,
            },
          }
        );
        
        return { id: stream.id || "" };
      } catch (error) {
        console.error("Error creating YouTube stream:", error);
        throw error;
      }
    },
    
    async bindStreamToBroadcast(broadcastId, streamId): Promise<void> {
      try {
        // Get account from state manager
        const account = await stateManager.getAccount("youtube", accountId);
        if (!account) {
          throw new Error(`YouTube account ${accountId} not found`);
        }
        
        // Bind stream to broadcast
        await youtubeApi.bindLiveStream(
          account.accessToken,
          {
            broadcastId,
            streamId,
          }
        );
      } catch (error) {
        console.error("Error binding YouTube stream to broadcast:", error);
        throw error;
      }
    },
    
    async startBroadcast(broadcastId): Promise<void> {
      try {
        // Get account from state manager
        const account = await stateManager.getAccount("youtube", accountId);
        if (!account) {
          throw new Error(`YouTube account ${accountId} not found`);
        }
        
        // Start broadcast
        await youtubeApi.transitionLiveBroadcast(
          account.accessToken,
          {
            id: broadcastId,
            broadcastStatus: "live",
          }
        );
      } catch (error) {
        console.error("Error starting YouTube broadcast:", error);
        throw error;
      }
    },
    
    async endBroadcast(broadcastId): Promise<void> {
      try {
        // Get account from state manager
        const account = await stateManager.getAccount("youtube", accountId);
        if (!account) {
          throw new Error(`YouTube account ${accountId} not found`);
        }
        
        // End broadcast
        await youtubeApi.transitionLiveBroadcast(
          account.accessToken,
          {
            id: broadcastId,
            broadcastStatus: "complete",
          }
        );
      } catch (error) {
        console.error("Error ending YouTube broadcast:", error);
        throw error;
      }
    },
  };
}