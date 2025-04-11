/**
 * Configuration module for the application
 * 
 * This loads configuration from .env file or environment variables
 * with sensible defaults for development
 */

// Default values
const DEFAULT_CONFIG = {
  // YouTube API Configuration
  YOUTUBE_CLIENT_ID: "your_youtube_client_id",
  YOUTUBE_CLIENT_SECRET: "your_youtube_client_secret",
  YOUTUBE_REDIRECT_URI: "http://localhost:8000/oauth2/youtube/callback",
  // YOUTUBE_API_KEY: "your_youtube_api_key", // Likely unused

  // LinkedIn API Configuration
  LINKEDIN_CLIENT_ID: "your_linkedin_client_id",
  LINKEDIN_CLIENT_SECRET: "your_linkedin_client_secret",
  LINKEDIN_REDIRECT_URI: "http://localhost:8000/oauth2/linkedin/callback",
  // LINKEDIN_API_KEY: "your_linkedin_api_key", // Likely unused

  // Application Settings
  APP_PORT: "8000",
  APP_HOST: "localhost",
  DEBUG_MODE: "true",

  // Storage Configuration
  STORAGE_DIR: "./data",
  CACHE_EXPIRY: "3600",

  // Relay Service Configuration
  DEFAULT_BITRATE: "5000",
  DEFAULT_RESOLUTION: "1080p",
  DEFAULT_FRAME_RATE: "30",
  DEFAULT_AUDIO_QUALITY: "192",
  DEFAULT_ENCODER: "x264",
  DEFAULT_PRESET: "veryfast"
};

// Environment variables should be loaded automatically using the --env flag
// when running the Deno application, or set directly in the environment.
// Removed manual .env parsing logic.
/**
 * Get configuration value with fallback to default
 * @param key The configuration key
 * @returns The configuration value
 */
function getConfig(key: keyof typeof DEFAULT_CONFIG): string {
  return Deno.env.get(key) || DEFAULT_CONFIG[key];
}

/**
 * Configuration object for the application
 */
export const config = {
  youtube: {
    clientId: getConfig("YOUTUBE_CLIENT_ID"),
    clientSecret: getConfig("YOUTUBE_CLIENT_SECRET"),
    redirectUri: getConfig("YOUTUBE_REDIRECT_URI"),
    // apiKey: getConfig("YOUTUBE_API_KEY") // Likely unused
  },
  
  linkedin: {
    clientId: getConfig("LINKEDIN_CLIENT_ID"),
    clientSecret: getConfig("LINKEDIN_CLIENT_SECRET"),
    redirectUri: getConfig("LINKEDIN_REDIRECT_URI"),
    // apiKey: getConfig("LINKEDIN_API_KEY") // Likely unused
  },
  
  app: {
    port: parseInt(getConfig("APP_PORT")),
    host: getConfig("APP_HOST"),
    debugMode: getConfig("DEBUG_MODE") === "true"
  },
  
  storage: {
    dir: getConfig("STORAGE_DIR"),
    cacheExpiry: parseInt(getConfig("CACHE_EXPIRY"))
  },
  
  relay: {
    bitrate: parseInt(getConfig("DEFAULT_BITRATE")),
    resolution: getConfig("DEFAULT_RESOLUTION"),
    frameRate: parseInt(getConfig("DEFAULT_FRAME_RATE")),
    audioQuality: parseInt(getConfig("DEFAULT_AUDIO_QUALITY")),
    encoder: getConfig("DEFAULT_ENCODER"),
    preset: getConfig("DEFAULT_PRESET")
  }
};

export default config;