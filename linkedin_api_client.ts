/**
 * LinkedIn API Client Module
 * 
 * This module provides a client wrapper for the LinkedIn API functions.
 */

import * as linkedinApi from "./linkedin_api.ts";
import stateManager from "./state_manager_extension.ts";

/**
 * Interface for LinkedIn API Client
 */
export interface LinkedInClient {
  createLiveEvent(options: {
    title: string;
    description: string;
    visibility: string;
  }): Promise<{ id: string }>;
  
  startLiveEvent(eventId: string): Promise<void>;
  
  endLiveEvent(eventId: string): Promise<void>;
}

/**
 * Create a LinkedIn API client for a specific account
 * @param accountId The account ID to use
 * @returns A LinkedIn API client
 */
export function createClient(accountId: string): LinkedInClient {
  return {
    async createLiveEvent(options): Promise<{ id: string }> {
      try {
        // Get account from state manager
        const account = await stateManager.getAccount("linkedin", accountId);
        if (!account) {
          throw new Error(`LinkedIn account ${accountId} not found`);
        }
        
        // Create owner URN
        const ownerUrn = new linkedinApi.PersonUrn(account.id);
        
        // Create live event
        const liveEvent = await linkedinApi.registerLiveEvent(
          account.accessToken,
          {
            owner: ownerUrn.toString(),
            title: options.title,
            description: options.description,
            visibility: options.visibility === "public" ? "PUBLIC" : "CONNECTIONS",
          }
        );
        
        return { id: liveEvent.id };
      } catch (error) {
        console.error("Error creating LinkedIn live event:", error);
        throw error;
      }
    },
    
    async startLiveEvent(eventId): Promise<void> {
      try {
        // Get account from state manager
        const account = await stateManager.getAccount("linkedin", accountId);
        if (!account) {
          throw new Error(`LinkedIn account ${accountId} not found`);
        }
        
        // Create live video URN
        const liveVideoUrn = new linkedinApi.LiveVideoUrn(eventId);
        
        // Transition to READY state
        await linkedinApi.transitionLiveEvent(
          account.accessToken,
          liveVideoUrn,
          "READY"
        );
        
        // Transition to PUBLISHED state
        await linkedinApi.transitionLiveEvent(
          account.accessToken,
          liveVideoUrn,
          "PUBLISHED"
        );
      } catch (error) {
        console.error("Error starting LinkedIn live event:", error);
        throw error;
      }
    },
    
    async endLiveEvent(eventId): Promise<void> {
      try {
        // Get account from state manager
        const account = await stateManager.getAccount("linkedin", accountId);
        if (!account) {
          throw new Error(`LinkedIn account ${accountId} not found`);
        }
        
        // Create live video URN
        const liveVideoUrn = new linkedinApi.LiveVideoUrn(eventId);
        
        // Transition to ENDED state
        await linkedinApi.transitionLiveEvent(
          account.accessToken,
          liveVideoUrn,
          "ENDED"
        );
      } catch (error) {
        console.error("Error ending LinkedIn live event:", error);
        throw error;
      }
    },
  };
}