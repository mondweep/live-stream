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
  YOUTUBE_API_KEY: "your_youtube_api_key",

  // LinkedIn API Configuration
  LINKEDIN_CLIENT_ID: "your_linkedin_client_id",
  LINKEDIN_CLIENT_SECRET: "your_linkedin_client_secret",
  LINKEDIN_REDIRECT_URI: "http://localhost:8000/oauth2/linkedin/callback",
  LINKEDIN_API_KEY: "your_linkedin_api_key",

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

/**
 * Load environment variables from .env file
 * This is wrapped in a try-catch because it will fail if the .env file doesn't exist
 */
try {
  const env = await Deno.readTextFile(".env");
  
  // Parse each line in the .env file
  const lines = env.split("\n");
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }
    
    const [key, ...valueParts] = trimmedLine.split("=");
    const value = valueParts.join("="); // Handle values with = in them
    
    if (key && value) {
      Deno.env.set(key.trim(), value.trim());
    }
  }
  
  console.log("Loaded configuration from .env file");
} catch (error) {
  console.warn("Failed to load .env file. Using default or environment variables.", error);
}

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
    apiKey: getConfig("YOUTUBE_API_KEY")
  },
  
  linkedin: {
    clientId: getConfig("LINKEDIN_CLIENT_ID"),
    clientSecret: getConfig("LINKEDIN_CLIENT_SECRET"),
    redirectUri: getConfig("LINKEDIN_REDIRECT_URI"),
    apiKey: getConfig("LINKEDIN_API_KEY")
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