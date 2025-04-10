/// <reference lib="deno.unstable" />

// Use Deno's built-in KV store

// Define types for our state
export interface Account {
  id: string;
  platform: "youtube" | "linkedin";
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  profile?: {
    name?: string;
    email?: string;
    picture?: string;
    [key: string]: unknown;
  };
}

export interface StreamSettings {
  title: string;
  description: string;
  visibility: "public" | "private" | "unlisted";
  scheduledStartTime?: Date;
  tags?: string[];
  thumbnail?: string;
  category?: string;
  [key: string]: unknown;
}

export interface ScheduledEvent {
  id: string;
  title: string;
  description: string;
  platforms: ("youtube" | "linkedin")[];
  scheduledStartTime: Date;
  scheduledEndTime?: Date;
  settings: Record<string, StreamSettings>;
  status: "scheduled" | "live" | "completed" | "canceled";
  [key: string]: unknown;
}

export interface StreamStatus {
  isActive: boolean;
  startedAt?: Date;
  currentViewers?: number;
  platforms: {
    youtube?: {
      isStreaming: boolean;
      streamId?: string;
      viewerCount?: number;
      chatEnabled?: boolean;
      [key: string]: unknown;
    };
    linkedin?: {
      isStreaming: boolean;
      streamId?: string;
      viewerCount?: number;
      [key: string]: unknown;
    };
  };
  [key: string]: unknown;
}

// Define key prefixes for different types of data
const ACCOUNTS_PREFIX = ["accounts"];
const STREAM_SETTINGS_PREFIX = ["stream_settings"];
const SCHEDULED_EVENTS_PREFIX = ["scheduled_events"];
const STREAM_STATUS_PREFIX = ["stream_status"];

/**
 * StateManager class for managing application state using Deno KV
 */
export class StateManager {
  private kv!: Deno.Kv;
  private cache: Map<string, unknown>;
  private cacheExpiry: Map<string, number>;
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  private initialized = false;

  /**
   * Create a new StateManager instance
   * @param kvPath Optional path to the KV database file
   */
  constructor(kvPath?: string) {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.initKv(kvPath);
  }

  /**
   * Initialize the KV store
   * @param kvPath Optional path to the KV database file
   */
  private async initKv(kvPath?: string): Promise<void> {
    try {
      this.kv = await Deno.openKv(kvPath);
      this.initialized = true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to initialize KV store: ${errorMessage}`);
      throw new Error(`Failed to initialize KV store: ${errorMessage}`);
    }
  }

  /**
   * Ensure the KV store is initialized before performing operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.initialized) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    }
  }

  /**
   * Get a value from the cache
   * @param key The cache key
   * @returns The cached value or undefined if not in cache or expired
   */
  private getCachedValue<T>(key: string): T | undefined {
    const now = Date.now();
    const expiry = this.cacheExpiry.get(key);
    
    if (expiry && expiry > now) {
      return this.cache.get(key) as T;
    }
    
    // Remove expired items
    if (expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    }
    
    return undefined;
  }

  /**
   * Set a value in the cache
   * @param key The cache key
   * @param value The value to cache
   * @param ttl Time to live in milliseconds
   */
  private setCachedValue<T>(key: string, value: T, ttl = this.DEFAULT_CACHE_TTL): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + ttl);
  }

  /**
   * Clear a specific key from the cache
   * @param key The cache key to clear
   */
  private clearCacheKey(key: string): void {
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
  }

  /**
   * Clear all cached values
   */
  public clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Generate a cache key from KV key parts
   * @param keyParts The key parts
   * @returns A string cache key
   */
  private generateCacheKey(keyParts: unknown[]): string {
    return JSON.stringify(keyParts);
  }

  /**
   * Save an account to the database
   * @param account The account to save
   */
  async saveAccount(account: Account): Promise<void> {
    try {
      await this.ensureInitialized();
      const key = [...ACCOUNTS_PREFIX, account.platform, account.id];
      await this.kv.set(key, account);
      this.clearCacheKey(this.generateCacheKey(key));
      this.clearCacheKey(this.generateCacheKey(ACCOUNTS_PREFIX));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save account: ${errorMessage}`);
    }
  }

  /**
   * Get an account by platform and id
   * @param platform The platform (youtube or linkedin)
   * @param id The account id
   * @returns The account or null if not found
   */
  async getAccount(platform: "youtube" | "linkedin", id: string): Promise<Account | null> {
    try {
      await this.ensureInitialized();
      const key = [...ACCOUNTS_PREFIX, platform, id];
      const cacheKey = this.generateCacheKey(key);
      
      // Check cache first
      const cachedAccount = this.getCachedValue<Account>(cacheKey);
      if (cachedAccount) {
        return cachedAccount;
      }
      
      // Get from KV store
      const result = await this.kv.get<Account>(key);
      if (result.value) {
        this.setCachedValue(cacheKey, result.value);
        return result.value;
      }
      
      return null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get account: ${errorMessage}`);
    }
  }

  /**
   * Get all accounts for a specific platform
   * @param platform The platform (youtube or linkedin)
   * @returns Array of accounts
   */
  async getAccountsByPlatform(platform: "youtube" | "linkedin"): Promise<Account[]> {
    try {
      await this.ensureInitialized();
      const prefix = [...ACCOUNTS_PREFIX, platform];
      const cacheKey = this.generateCacheKey(prefix);
      
      // Check cache first
      const cachedAccounts = this.getCachedValue<Account[]>(cacheKey);
      if (cachedAccounts) {
        return cachedAccounts;
      }
      
      // Get from KV store
      const accounts: Account[] = [];
      const entries = this.kv.list<Account>({ prefix });
      
      for await (const entry of entries) {
        accounts.push(entry.value);
      }
      
      this.setCachedValue(cacheKey, accounts);
      return accounts;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get accounts by platform: ${errorMessage}`);
    }
  }

  /**
   * Get all accounts
   * @returns Array of all accounts
   */
  async getAllAccounts(): Promise<Account[]> {
    try {
      await this.ensureInitialized();
      const cacheKey = this.generateCacheKey(ACCOUNTS_PREFIX);
      
      // Check cache first
      const cachedAccounts = this.getCachedValue<Account[]>(cacheKey);
      if (cachedAccounts) {
        return cachedAccounts;
      }
      
      // Get from KV store
      const accounts: Account[] = [];
      const entries = this.kv.list<Account>({ prefix: ACCOUNTS_PREFIX });
      
      for await (const entry of entries) {
        accounts.push(entry.value);
      }
      
      this.setCachedValue(cacheKey, accounts);
      return accounts;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get all accounts: ${errorMessage}`);
    }
  }

  /**
   * Delete an account
   * @param platform The platform (youtube or linkedin)
   * @param id The account id
   */
  async deleteAccount(platform: "youtube" | "linkedin", id: string): Promise<void> {
    try {
      await this.ensureInitialized();
      const key = [...ACCOUNTS_PREFIX, platform, id];
      await this.kv.delete(key);
      this.clearCacheKey(this.generateCacheKey(key));
      this.clearCacheKey(this.generateCacheKey(ACCOUNTS_PREFIX));
      this.clearCacheKey(this.generateCacheKey([...ACCOUNTS_PREFIX, platform]));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete account: ${errorMessage}`);
    }
  }

  /**
   * Save stream settings
   * @param id The settings id (usually "default" or a specific stream id)
   * @param settings The stream settings to save
   */
  async saveStreamSettings(id: string, settings: StreamSettings): Promise<void> {
    try {
      await this.ensureInitialized();
      const key = [...STREAM_SETTINGS_PREFIX, id];
      await this.kv.set(key, settings);
      this.clearCacheKey(this.generateCacheKey(key));
      this.clearCacheKey(this.generateCacheKey(STREAM_SETTINGS_PREFIX));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save stream settings: ${errorMessage}`);
    }
  }

  /**
   * Get stream settings
   * @param id The settings id (usually "default" or a specific stream id)
   * @returns The stream settings or null if not found
   */
  async getStreamSettings(id: string): Promise<StreamSettings | null> {
    try {
      await this.ensureInitialized();
      const key = [...STREAM_SETTINGS_PREFIX, id];
      const cacheKey = this.generateCacheKey(key);
      
      // Check cache first
      const cachedSettings = this.getCachedValue<StreamSettings>(cacheKey);
      if (cachedSettings) {
        return cachedSettings;
      }
      
      // Get from KV store
      const result = await this.kv.get<StreamSettings>(key);
      if (result.value) {
        this.setCachedValue(cacheKey, result.value);
        return result.value;
      }
      
      return null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get stream settings: ${errorMessage}`);
    }
  }

  /**
   * Get all stream settings
   * @returns Array of all stream settings
   */
  async getAllStreamSettings(): Promise<Record<string, StreamSettings>> {
    try {
      await this.ensureInitialized();
      const cacheKey = this.generateCacheKey(STREAM_SETTINGS_PREFIX);
      
      // Check cache first
      const cachedSettings = this.getCachedValue<Record<string, StreamSettings>>(cacheKey);
      if (cachedSettings) {
        return cachedSettings;
      }
      
      // Get from KV store
      const settings: Record<string, StreamSettings> = {};
      const entries = this.kv.list<StreamSettings>({ prefix: STREAM_SETTINGS_PREFIX });
      
      for await (const entry of entries) {
        const id = entry.key[entry.key.length - 1] as string;
        settings[id] = entry.value;
      }
      
      this.setCachedValue(cacheKey, settings);
      return settings;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get all stream settings: ${errorMessage}`);
    }
  }

  /**
   * Delete stream settings
   * @param id The settings id
   */
  async deleteStreamSettings(id: string): Promise<void> {
    try {
      await this.ensureInitialized();
      const key = [...STREAM_SETTINGS_PREFIX, id];
      await this.kv.delete(key);
      this.clearCacheKey(this.generateCacheKey(key));
      this.clearCacheKey(this.generateCacheKey(STREAM_SETTINGS_PREFIX));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete stream settings: ${errorMessage}`);
    }
  }

  /**
   * Save a scheduled event
   * @param event The scheduled event to save
   */
  async saveScheduledEvent(event: ScheduledEvent): Promise<void> {
    try {
      await this.ensureInitialized();
      const key = [...SCHEDULED_EVENTS_PREFIX, event.id];
      await this.kv.set(key, event);
      this.clearCacheKey(this.generateCacheKey(key));
      this.clearCacheKey(this.generateCacheKey(SCHEDULED_EVENTS_PREFIX));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save scheduled event: ${errorMessage}`);
    }
  }

  /**
   * Get a scheduled event by id
   * @param id The event id
   * @returns The scheduled event or null if not found
   */
  async getScheduledEvent(id: string): Promise<ScheduledEvent | null> {
    try {
      await this.ensureInitialized();
      const key = [...SCHEDULED_EVENTS_PREFIX, id];
      const cacheKey = this.generateCacheKey(key);
      
      // Check cache first
      const cachedEvent = this.getCachedValue<ScheduledEvent>(cacheKey);
      if (cachedEvent) {
        return cachedEvent;
      }
      
      // Get from KV store
      const result = await this.kv.get<ScheduledEvent>(key);
      if (result.value) {
        this.setCachedValue(cacheKey, result.value);
        return result.value;
      }
      
      return null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get scheduled event: ${errorMessage}`);
    }
  }

  /**
   * Get all scheduled events
   * @returns Array of all scheduled events
   */
  async getAllScheduledEvents(): Promise<ScheduledEvent[]> {
    try {
      await this.ensureInitialized();
      const cacheKey = this.generateCacheKey(SCHEDULED_EVENTS_PREFIX);
      
      // Check cache first
      const cachedEvents = this.getCachedValue<ScheduledEvent[]>(cacheKey);
      if (cachedEvents) {
        return cachedEvents;
      }
      
      // Get from KV store
      const events: ScheduledEvent[] = [];
      const entries = this.kv.list<ScheduledEvent>({ prefix: SCHEDULED_EVENTS_PREFIX });
      
      for await (const entry of entries) {
        events.push(entry.value);
      }
      
      this.setCachedValue(cacheKey, events);
      return events;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get all scheduled events: ${errorMessage}`);
    }
  }

  /**
   * Get upcoming scheduled events
   * @param limit Optional limit on the number of events to return
   * @returns Array of upcoming scheduled events
   */
  async getUpcomingEvents(limit?: number): Promise<ScheduledEvent[]> {
    try {
      await this.ensureInitialized();
      const allEvents = await this.getAllScheduledEvents();
      const now = new Date();
      
      // Filter for upcoming events
      const upcomingEvents = allEvents
        .filter(event =>
          event.status === "scheduled" &&
          event.scheduledStartTime > now
        )
        .sort((a, b) => a.scheduledStartTime.getTime() - b.scheduledStartTime.getTime());
      
      return limit ? upcomingEvents.slice(0, limit) : upcomingEvents;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get upcoming events: ${errorMessage}`);
    }
  }

  /**
   * Delete a scheduled event
   * @param id The event id
   */
  async deleteScheduledEvent(id: string): Promise<void> {
    try {
      await this.ensureInitialized();
      const key = [...SCHEDULED_EVENTS_PREFIX, id];
      await this.kv.delete(key);
      this.clearCacheKey(this.generateCacheKey(key));
      this.clearCacheKey(this.generateCacheKey(SCHEDULED_EVENTS_PREFIX));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete scheduled event: ${errorMessage}`);
    }
  }

  /**
   * Save stream status
   * @param status The stream status to save
   */
  async saveStreamStatus(status: StreamStatus): Promise<void> {
    try {
      await this.ensureInitialized();
      const key = [...STREAM_STATUS_PREFIX, "current"];
      await this.kv.set(key, status);
      this.clearCacheKey(this.generateCacheKey(key));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save stream status: ${errorMessage}`);
    }
  }

  /**
   * Get current stream status
   * @returns The current stream status or null if not found
   */
  async getStreamStatus(): Promise<StreamStatus | null> {
    try {
      await this.ensureInitialized();
      const key = [...STREAM_STATUS_PREFIX, "current"];
      const cacheKey = this.generateCacheKey(key);
      
      // Check cache first with a shorter TTL for status (1 minute)
      const cachedStatus = this.getCachedValue<StreamStatus>(cacheKey);
      if (cachedStatus) {
        return cachedStatus;
      }
      
      // Get from KV store
      const result = await this.kv.get<StreamStatus>(key);
      if (result.value) {
        // Cache with a shorter TTL for status (1 minute)
        this.setCachedValue(cacheKey, result.value, 60 * 1000);
        return result.value;
      }
      
      return null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get stream status: ${errorMessage}`);
    }
  }

  /**
   * Create a new instance of StateManager with default settings
   * @returns A new StateManager instance
   */
  static async create(): Promise<StateManager> {
    const manager = new StateManager();
    await manager.ensureInitialized();
    return manager;
  }
}

// Create a singleton instance for easy import
// Note: This is a top-level await which requires Deno
export const stateManager = await StateManager.create();

// Export default for convenience
export default stateManager;