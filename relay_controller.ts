/**
 * Relay Controller Module
 * 
 * This module provides functionality to control the self-hosted relay service,
 * including starting/stopping streams and configuring settings.
 */

// Import API clients and state manager
import stateManager from "./state_manager_extension.ts";
import { ExtendedStateManager } from "./state_manager_extension.ts";
import { MockStateManager } from "./state_manager_mock.ts";
import { createClient as createYouTubeClient } from "./youtube_api_client.ts";
import { createClient as createLinkedInClient } from "./linkedin_api_client.ts";

// Type for data storage - can be either ExtendedStateManager or MockStateManager
type DataStorage = ExtendedStateManager | MockStateManager;

// Types
export type StreamPlatform = "youtube" | "linkedin";

export interface StreamDestination {
  platform: StreamPlatform;
  accountId: string;
  enabled: boolean;
  streamKey?: string;
  rtmpUrl?: string;
}

export interface RelayConfig {
  bitrate: number;        // in kbps
  resolution: string;     // e.g., "720p", "1080p"
  frameRate: number;      // e.g., 30, 60
  audioQuality: number;   // in kbps
  encoder: string;        // e.g., "x264", "nvenc"
  preset: string;         // e.g., "veryfast", "medium", "slow"
  customParams?: Record<string, string>;
}

export interface StreamSettings {
  title: string;
  description: string;
  visibility: "public" | "private" | "unlisted";
  tags?: string[];
  scheduledStartTime?: Date;
  scheduledEndTime?: Date;
}

export interface PlatformStatus {
  isStreaming: boolean;
  streamId?: string;
  viewerCount?: number;
  startedAt?: Date;
  error?: string;
}

export interface RelayStatus {
  isActive: boolean;
  startedAt?: Date;
  duration?: number;
  bitrate?: number;
  platforms: {
    youtube?: PlatformStatus;
    linkedin?: PlatformStatus;
  };
  error?: string;
}

// Internal state
let currentConfig: RelayConfig | null = null;
let destinations: StreamDestination[] = [];
let currentStatus: RelayStatus = {
  isActive: false,
  platforms: {}
};
let _streamProcessId: number | null = null;

/**
 * Configure the relay service with specific settings
 * @param config The relay configuration
 * @returns Promise that resolves when configuration is complete
 */
export async function configureRelay(config: RelayConfig): Promise<void> {
  try {
    // Store configuration in state manager
    // Add relay config to state manager
    await (stateManager as DataStorage).saveData("relay_config", config);
    
    // Update local state
    currentConfig = config;
    
    console.log("Relay configured:", config);
    return Promise.resolve();
  } catch (error) {
    console.error("Error configuring relay:", error);
    return Promise.reject(error);
  }
}

/**
 * Add a streaming destination
 * @param destination The destination to add
 * @returns Promise that resolves when destination is added
 */
export async function addDestination(destination: StreamDestination): Promise<void> {
  try {
    // Check if destination already exists
    const existingIndex = destinations.findIndex(
      d => d.platform === destination.platform && d.accountId === destination.accountId
    );
    
    if (existingIndex >= 0) {
      // Update existing destination
      destinations[existingIndex] = {
        ...destinations[existingIndex],
        ...destination
      };
    } else {
      // Add new destination
      destinations.push(destination);
    }
    
    // Store destinations in state manager
    await (stateManager as DataStorage).saveData("stream_destinations", destinations);
    
    console.log(`Added ${destination.platform} destination for account ${destination.accountId}`);
    return Promise.resolve();
  } catch (error) {
    console.error("Error adding destination:", error);
    return Promise.reject(error);
  }
}

/**
 * Remove a streaming destination
 * @param platform The platform to remove
 * @param accountId The account ID to remove
 * @returns Promise that resolves when destination is removed
 */
export async function removeDestination(platform: StreamPlatform, accountId: string): Promise<void> {
  try {
    // Filter out the destination to remove
    const initialCount = destinations.length;
    destinations = destinations.filter(
      d => !(d.platform === platform && d.accountId === accountId)
    );
    
    if (destinations.length === initialCount) {
      console.warn(`Destination not found: ${platform} account ${accountId}`);
    }
    
    // Update destinations in state manager
    await (stateManager as DataStorage).saveData("stream_destinations", destinations);
    
    // If the stream is active, update the status
    if (currentStatus.isActive && currentStatus.platforms[platform]) {
      if (platform === "youtube" && currentStatus.platforms.youtube?.streamId) {
        // Stop streaming to YouTube but keep the overall stream active
        await stopPlatformStream("youtube", accountId);
      } else if (platform === "linkedin" && currentStatus.platforms.linkedin?.streamId) {
        // Stop streaming to LinkedIn but keep the overall stream active
        await stopPlatformStream("linkedin", accountId);
      }
    }
    
    console.log(`Removed ${platform} destination for account ${accountId}`);
    return Promise.resolve();
  } catch (error) {
    console.error("Error removing destination:", error);
    return Promise.reject(error);
  }
}

/**
 * Start streaming to all enabled destinations
 * @param settings The stream settings
 * @returns Promise that resolves when streaming starts
 */
export async function startStream(settings: StreamSettings): Promise<void> {
  try {
    if (currentStatus.isActive) {
      console.warn("Stream is already active");
      return Promise.resolve();
    }
    
    if (!currentConfig) {
      throw new Error("Relay not configured. Call configureRelay first.");
    }
    
    if (destinations.length === 0) {
      throw new Error("No destinations configured. Add at least one destination.");
    }
    
    // Initialize stream status
    currentStatus = {
      isActive: true,
      startedAt: new Date(),
      platforms: {}
    };
    
    // Start streaming to each enabled destination
    const enabledDestinations = destinations.filter(d => d.enabled);
    
    for (const destination of enabledDestinations) {
      try {
        if (destination.platform === "youtube") {
          await startYouTubeStream(destination, settings);
        } else if (destination.platform === "linkedin") {
          await startLinkedInStream(destination, settings);
        }
      } catch (error) {
        console.error(`Error starting stream to ${destination.platform}:`, error);
        currentStatus.platforms[destination.platform] = {
          isStreaming: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    
    // Simulate starting the actual relay process
    _streamProcessId = Math.floor(Math.random() * 10000);
    
    // Save status to state manager
    await (stateManager as DataStorage).saveData("stream_status", currentStatus);
    
    console.log("Stream started successfully");
    return Promise.resolve();
  } catch (error) {
    console.error("Error starting stream:", error);
    currentStatus.isActive = false;
    currentStatus.error = error instanceof Error ? error.message : String(error);
    return Promise.reject(error);
  }
}

/**
 * Stop streaming to all destinations
 * @returns Promise that resolves when streaming stops
 */
export async function stopStream(): Promise<void> {
  try {
    if (!currentStatus.isActive) {
      console.warn("Stream is not active");
      return Promise.resolve();
    }
    
    // Stop streaming to each platform
    if (currentStatus.platforms.youtube?.isStreaming) {
      await stopPlatformStream("youtube");
    }
    
    if (currentStatus.platforms.linkedin?.isStreaming) {
      await stopPlatformStream("linkedin");
    }
    
    // Update status
    currentStatus.isActive = false;
    _streamProcessId = null;
    
    // Calculate duration
    if (currentStatus.startedAt) {
      const endTime = new Date();
      currentStatus.duration = Math.floor((endTime.getTime() - currentStatus.startedAt.getTime()) / 1000);
    }
    
    // Save status to state manager
    await (stateManager as DataStorage).saveData("stream_status", currentStatus);
    
    console.log("Stream stopped successfully");
    return Promise.resolve();
  } catch (error) {
    console.error("Error stopping stream:", error);
    return Promise.reject(error);
  }
}

/**
 * Get the current relay status
 * @returns The current relay status
 */
export function getRelayStatus(): RelayStatus {
  return { ...currentStatus };
}

/**
 * Start streaming to YouTube
 * @param destination The YouTube destination
 * @param settings The stream settings
 * @returns Promise that resolves when YouTube streaming starts
 */
async function startYouTubeStream(destination: StreamDestination, settings: StreamSettings): Promise<void> {
  try {
    // Get YouTube API client
    const ytApi = createYouTubeClient(destination.accountId);
    
    // Create broadcast
    const broadcast = await ytApi.createBroadcast({
      title: settings.title,
      description: settings.description,
      scheduledStartTime: settings.scheduledStartTime,
      scheduledEndTime: settings.scheduledEndTime,
      privacyStatus: settings.visibility
    });
    
    // Create stream
    const stream = await ytApi.createStream({
      title: settings.title,
      resolution: currentConfig?.resolution || "720p",
      frameRate: currentConfig?.frameRate || 30
    });
    
    // Bind stream to broadcast
    await ytApi.bindStreamToBroadcast(broadcast.id, stream.id);
    
    // Start broadcast
    await ytApi.startBroadcast(broadcast.id);
    
    // Update status
    currentStatus.platforms.youtube = {
      isStreaming: true,
      streamId: broadcast.id,
      startedAt: new Date()
    };
    
    console.log(`YouTube stream started: ${broadcast.id}`);
    return Promise.resolve();
  } catch (error) {
    console.error("Error starting YouTube stream:", error);
    currentStatus.platforms.youtube = {
      isStreaming: false,
      error: error instanceof Error ? error.message : String(error)
    };
    return Promise.reject(error);
  }
}

/**
 * Start streaming to LinkedIn
 * @param destination The LinkedIn destination
 * @param settings The stream settings
 * @returns Promise that resolves when LinkedIn streaming starts
 */
async function startLinkedInStream(destination: StreamDestination, settings: StreamSettings): Promise<void> {
  try {
    // Get LinkedIn API client
    const liApi = createLinkedInClient(destination.accountId);
    
    // Create live event
    const liveEvent = await liApi.createLiveEvent({
      title: settings.title,
      description: settings.description,
      visibility: settings.visibility
    });
    
    // Start live event
    await liApi.startLiveEvent(liveEvent.id);
    
    // Update status
    currentStatus.platforms.linkedin = {
      isStreaming: true,
      streamId: liveEvent.id,
      startedAt: new Date()
    };
    
    console.log(`LinkedIn stream started: ${liveEvent.id}`);
    return Promise.resolve();
  } catch (error) {
    console.error("Error starting LinkedIn stream:", error);
    currentStatus.platforms.linkedin = {
      isStreaming: false,
      error: error instanceof Error ? error.message : String(error)
    };
    return Promise.reject(error);
  }
}

/**
 * Stop streaming to a specific platform
 * @param platform The platform to stop streaming to
 * @param accountId Optional account ID (if not provided, stops all accounts for the platform)
 * @returns Promise that resolves when platform streaming stops
 */
async function stopPlatformStream(platform: StreamPlatform, accountId?: string): Promise<void> {
  try {
    if (platform === "youtube" && currentStatus.platforms.youtube?.isStreaming) {
      // Get YouTube API instance
      const youtubeDestination = destinations.find(
        d => d.platform === "youtube" && (accountId ? d.accountId === accountId : true)
      );
      
      if (!youtubeDestination) {
        throw new Error(`YouTube destination not found for account ${accountId || "any"}`);
      }
      const ytApi = createYouTubeClient(youtubeDestination.accountId);
      
      // End broadcast
      if (currentStatus.platforms.youtube?.streamId) {
        await ytApi.endBroadcast(currentStatus.platforms.youtube.streamId);
      }
      
      // Update status
      currentStatus.platforms.youtube = {
        isStreaming: false
      };
      
      console.log("YouTube stream stopped");
    } else if (platform === "linkedin" && currentStatus.platforms.linkedin?.isStreaming) {
      // Get LinkedIn API instance
      const linkedinDestination = destinations.find(
        d => d.platform === "linkedin" && (accountId ? d.accountId === accountId : true)
      );
      
      if (!linkedinDestination) {
        throw new Error(`LinkedIn destination not found for account ${accountId || "any"}`);
      }
      const liApi = createLinkedInClient(linkedinDestination.accountId);
      
      // End live event
      if (currentStatus.platforms.linkedin?.streamId) {
        await liApi.endLiveEvent(currentStatus.platforms.linkedin.streamId);
      }
      
      // Update status
      currentStatus.platforms.linkedin = {
        isStreaming: false
      };
      
      console.log("LinkedIn stream stopped");
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error(`Error stopping ${platform} stream:`, error);
    return Promise.reject(error);
  }
}

// Initialize module
async function initialize(): Promise<void> {
  try {
    try {
      // Load configuration from state manager
      const savedConfig = await (stateManager as DataStorage).getData<RelayConfig>("relay_config");
      if (savedConfig) {
        currentConfig = savedConfig;
      }
      
      // Load destinations from state manager
      const savedDestinations = await (stateManager as DataStorage).getData<StreamDestination[]>("stream_destinations");
      if (savedDestinations) {
        destinations = savedDestinations;
      }
      
      // Load status from state manager
      const savedStatus = await (stateManager as DataStorage).getData<RelayStatus>("stream_status");
      if (savedStatus) {
        // If there was an active stream but the app was restarted, mark it as inactive
        if (savedStatus.isActive) {
          savedStatus.isActive = false;
          savedStatus.error = "Stream was interrupted due to application restart";
          await (stateManager as DataStorage).saveData("stream_status", savedStatus);
        }
        currentStatus = savedStatus;
      }
    } catch (error) {
      console.error("Error loading saved state:", error);
    }
    
    console.log("Relay controller initialized");
  } catch (error) {
    console.error("Error initializing relay controller:", error);
  }
}

// Initialize the module
initialize().catch(console.error);