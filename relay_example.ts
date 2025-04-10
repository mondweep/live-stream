/**
 * Relay Controller Example
 * 
 * This file demonstrates how to use the relay controller to manage streaming
 * to multiple platforms.
 */

import {
  configureRelay,
  addDestination,
  startStream,
  stopStream,
  getRelayStatus,
  StreamDestination,
  RelayConfig,
  StreamSettings
} from "./relay_controller.ts";

async function main() {
  // 1. Configure the relay
  const relayConfig: RelayConfig = {
    bitrate: 2500,
    resolution: "720p",
    frameRate: 30,
    audioQuality: 128,
    encoder: "x264",
    preset: "veryfast"
  };
  await configureRelay(relayConfig);

  // 2. Add streaming destinations
  const youtubeDestination: StreamDestination = {
    platform: "youtube",
    accountId: "YOUR_YOUTUBE_ACCOUNT_ID",
    enabled: true,
    streamKey: "YOUR_YOUTUBE_STREAM_KEY",
    rtmpUrl: "YOUR_YOUTUBE_RTMP_URL"
  };
  await addDestination(youtubeDestination);

  const linkedinDestination: StreamDestination = {
    platform: "linkedin",
    accountId: "YOUR_LINKEDIN_ACCOUNT_ID",
    enabled: true
  };
  await addDestination(linkedinDestination);

  // 3. Start streaming
  const streamSettings: StreamSettings = {
    title: "My Awesome Stream",
    description: "A test stream using the self-hosted relay service",
    visibility: "public"
  };
  await startStream(streamSettings);

  // 4. Get relay status
  const relayStatus = getRelayStatus();
  console.log("Relay Status:", relayStatus);

  // 5. Stop streaming after 30 seconds
  setTimeout(async () => {
    await stopStream();
    const updatedRelayStatus = getRelayStatus();
    console.log("Relay Status:", updatedRelayStatus);
  }, 30000);
}

main().catch(console.error);