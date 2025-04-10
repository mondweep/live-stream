/**
 * API Examples
 * 
 * This file contains examples of how to use the YouTube and LinkedIn API modules.
 */
import { getCookies } from "https://deno.land/std@0.208.0/http/cookie.ts";

/**
 * Utility function to get the access token from a cookie
 *
 * Note: In a real application, you would use the decrypt function from oauth2.ts,
 * but for this example, we'll simulate decryption.
 *
 * @param encryptedToken The encryptedToken from the cookie
 * @returns The decrypted access token
 */
function getAccessTokenFromCookie(encryptedToken: string): string {
  // In a real application, you would use the decrypt function from oauth2.ts
  // For this example, we'll just return the token as is
  // In production, you would implement proper decryption or use the exported function
  console.log("Simulating decryption of token:", encryptedToken);
  return encryptedToken;
}


// YouTube API imports
import {
  insertLiveBroadcast,
  updateLiveBroadcast,
  transitionLiveBroadcast,
  insertLiveStream,
  bindLiveStream,
  YouTubeLiveBroadcast,
  YouTubeLiveStream,
  YouTubeLiveBroadcastTransition,
  YouTubeLiveStreamBind
} from "./youtube_api.ts";

// LinkedIn API imports
import {
  checkContentAccess,
  registerLiveEvent,
  transitionLiveEvent,
  createUgcPost,
  createScheduledLiveEvent,
  getScheduledLiveEvent,
  PersonUrn,
  OrganizationUrn,
  LiveVideoUrn,
  ScheduledLiveEventUrn,
  LinkedInLiveVideo,
  LinkedInUgcPost,
  LinkedInScheduledLiveEvent
} from "./linkedin_api.ts";

/**
 * Example: Create a YouTube live broadcast and stream
 */
async function createYouTubeLiveStream(request: Request): Promise<Response> {
  try {
    // Get the access token from the cookie
    const cookies = getCookies(request.headers);
    const encryptedToken = cookies.youtube_session;
    
    if (!encryptedToken) {
      return new Response("YouTube session not found. Please authenticate first.", { status: 401 });
    }
    
    // Get the access token
    const accessToken = getAccessTokenFromCookie(encryptedToken);
    
    // 1. Create a live broadcast
    const broadcast: YouTubeLiveBroadcast = {
      snippet: {
        title: "My Live Stream",
        description: "This is a test live stream",
        scheduledStartTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      },
      status: {
        privacyStatus: "public",
        selfDeclaredMadeForKids: false,
      },
      contentDetails: {
        enableDvr: true,
        enableEmbed: true,
        recordFromStart: true,
      },
    };
    
    const createdBroadcast = await insertLiveBroadcast(accessToken, broadcast);
    console.log("Created broadcast:", createdBroadcast);
    
    // 2. Create a live stream
    const stream: YouTubeLiveStream = {
      snippet: {
        title: "My Live Stream",
        description: "This is a test live stream",
      },
      cdn: {
        frameRate: "30fps",
        ingestionType: "rtmp",
        resolution: "720p",
      },
    };
    
    const createdStream = await insertLiveStream(accessToken, stream);
    console.log("Created stream:", createdStream);
    
    // 3. Bind the broadcast to the stream
    const bind: YouTubeLiveStreamBind = {
      streamId: createdStream.id ?? "",
      broadcastId: createdBroadcast.id ?? "",
    };
    
    const boundBroadcast = await bindLiveStream(accessToken, bind);
    console.log("Bound broadcast:", boundBroadcast);
    
    // 4. Transition the broadcast to testing
    const transitionToTesting: YouTubeLiveBroadcastTransition = {
      broadcastStatus: "testing",
      id: createdBroadcast.id ?? "",
    };
    
    const testingBroadcast = await transitionLiveBroadcast(accessToken, transitionToTesting);
    console.log("Transitioned to testing:", testingBroadcast);
    
    // 5. Transition the broadcast to live
    const transitionToLive: YouTubeLiveBroadcastTransition = {
      broadcastStatus: "live",
      id: createdBroadcast.id ?? "",
    };
    
    const liveBroadcast = await transitionLiveBroadcast(accessToken, transitionToLive);
    console.log("Transitioned to live:", liveBroadcast);
    
    return new Response(JSON.stringify({ broadcast: liveBroadcast, stream: createdStream }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating YouTube live stream:", error);
    return new Response("Error creating YouTube live stream", { status: 500 });
  }
}

export {
  insertLiveBroadcast,
  transitionLiveBroadcast,
  insertLiveStream,
  bindLiveStream,
  getAccessTokenFromCookie
};