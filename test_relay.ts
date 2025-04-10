/**
 * Test script for the relay controller
 * 
 * This script demonstrates how to use the relay controller to manage streaming
 * to different platforms.
 */

import {
  configureRelay,
  addDestination,
  removeDestination,
  startStream,
  stopStream,
  getRelayStatus,
  RelayConfig,
  StreamDestination
} from "./relay_controller.ts";
import stateManager from "./state_manager_extension.ts";
import config from "./config.ts";

// Check if .env file exists, if not, copy .env.example to .env
async function ensureEnvFile() {
  try {
    await Deno.stat(".env");
    console.log(".env file exists, using existing configuration");
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.log(".env file not found, copying from .env.example");
      try {
        await Deno.copyFile(".env.example", ".env");
        console.log("Created .env file from .env.example");
      } catch (copyError) {
        console.warn("Could not copy .env.example to .env:", copyError);
      }
    } else {
      console.warn("Error checking for .env file:", error);
    }
  }
}

// Simple test function to demonstrate relay controller usage
async function testRelayController() {
  console.log("=== Testing Relay Controller ===");
  
  // Ensure .env file exists
  await ensureEnvFile();
  
  try {
    // 1. Configure the relay with custom settings
    console.log("\n1. Configuring relay...");
    const relayConfig: RelayConfig = {
      bitrate: config.relay.bitrate,
      resolution: config.relay.resolution,
      frameRate: config.relay.frameRate,
      audioQuality: config.relay.audioQuality,
      encoder: config.relay.encoder,
      preset: config.relay.preset
    };
    
    await configureRelay(relayConfig);
    console.log("Relay configured successfully");
    
    // 2. Add YouTube as a streaming destination
    console.log("\n2. Adding YouTube destination...");
    const youtubeDestination: StreamDestination = {
      platform: "youtube",
      accountId: "default", // Replace with actual account ID
      enabled: true
    };
    
    await addDestination(youtubeDestination);
    console.log("YouTube destination added");
    
    // 3. Add LinkedIn as a streaming destination
    console.log("\n3. Adding LinkedIn destination...");
    const linkedinDestination: StreamDestination = {
      platform: "linkedin",
      accountId: "default", // Replace with actual account ID
      enabled: true
    };
    
    await addDestination(linkedinDestination);
    console.log("LinkedIn destination added");
    
    // 4. Create stream settings
    console.log("\n4. Creating stream settings...");
    const streamSettings = {
      title: "Test Live Stream",
      description: "This is a test of our multi-platform streaming capability",
      visibility: "public" as "public" | "private" | "unlisted",
      tags: ["test", "live", "tech"]
    };
    
    // Save the settings to state manager
    await stateManager.saveStreamSettings("default", streamSettings);
    console.log("Stream settings saved");
    
    // 5. Start the stream
    console.log("\n5. Starting stream...");
    await startStream(streamSettings);
    console.log("Stream started successfully");
    
    // 6. Display current status
    console.log("\n6. Current relay status:");
    const status = getRelayStatus();
    console.log(JSON.stringify(status, null, 2));
    
    // 7. Wait for 5 seconds to simulate streaming
    console.log("\n7. Streaming for 5 seconds...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 8. Remove LinkedIn destination while streaming
    console.log("\n8. Removing LinkedIn destination...");
    await removeDestination("linkedin", "default");
    console.log("LinkedIn destination removed");
    
    // 9. Display updated status
    console.log("\n9. Updated relay status:");
    const updatedStatus = getRelayStatus();
    console.log(JSON.stringify(updatedStatus, null, 2));
    
    // 10. Wait for another 5 seconds
    console.log("\n10. Streaming for 5 more seconds...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 11. Stop the stream
    console.log("\n11. Stopping stream...");
    await stopStream();
    console.log("Stream stopped successfully");
    
    // 12. Display final status
    console.log("\n12. Final relay status:");
    const finalStatus = getRelayStatus();
    console.log(JSON.stringify(finalStatus, null, 2));
    
    console.log("\n=== Test completed successfully ===");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
if (import.meta.main) {
  testRelayController().catch(console.error);
}