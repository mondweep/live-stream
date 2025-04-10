/**
 * Mock StateManager Implementation
 * 
 * This is a fallback implementation when Deno.openKv is not available
 * It uses in-memory storage instead of the KV store
 */

import { Account, StreamSettings, ScheduledEvent, StreamStatus } from "./state_manager.ts";

// Define key prefixes for different types of data
const ACCOUNTS_PREFIX = "accounts";
const STREAM_SETTINGS_PREFIX = "stream_settings";
const SCHEDULED_EVENTS_PREFIX = "scheduled_events";
const STREAM_STATUS_PREFIX = "stream_status";
const GENERIC_DATA_PREFIX = "generic_data";

/**
 * MockStateManager class for managing application state using in-memory storage
 * Use this when Deno.openKv is not available
 */
export class MockStateManager {
  private storage: Map<string, unknown>;
  private cache: Map<string, unknown>;
  private cacheExpiry: Map<string, number>;
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  private initialized = true;

  /**
   * Create a new MockStateManager instance
   */
  constructor() {
    this.storage = new Map();
    this.cache = new Map();
    this.cacheExpiry = new Map();
    console.log("Using MockStateManager (in-memory storage)");
  }

  /**
   * Generate a storage key from key parts
   * @param prefix The prefix
   * @param parts The key parts
   * @returns A string storage key
   */
  private generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(":")}`;
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
   * Save an account to the storage
   * @param account The account to save
   */
  async saveAccount(account: Account): Promise<void> {
    try {
      const key = this.generateKey(ACCOUNTS_PREFIX, account.platform, account.id);
      this.storage.set(key, account);
      this.clearCacheKey(key);
      this.clearCacheKey(ACCOUNTS_PREFIX);
      return Promise.resolve();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to save account: ${errorMessage}`));
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
      const key = this.generateKey(ACCOUNTS_PREFIX, platform, id);
      
      // Check cache first
      const cachedAccount = this.getCachedValue<Account>(key);
      if (cachedAccount) {
        return cachedAccount;
      }
      
      // Get from storage
      const account = this.storage.get(key) as Account | undefined;
      if (account) {
        this.setCachedValue(key, account);
        return account;
      }
      
      return null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to get account: ${errorMessage}`));
    }
  }

  /**
   * Get all accounts for a specific platform
   * @param platform The platform (youtube or linkedin)
   * @returns Array of accounts
   */
  async getAccountsByPlatform(platform: "youtube" | "linkedin"): Promise<Account[]> {
    try {
      const prefix = this.generateKey(ACCOUNTS_PREFIX, platform);
      const cacheKey = prefix;
      
      // Check cache first
      const cachedAccounts = this.getCachedValue<Account[]>(cacheKey);
      if (cachedAccounts) {
        return cachedAccounts;
      }
      
      // Get from storage
      const accounts: Account[] = [];
      
      for (const [key, value] of this.storage.entries()) {
        if (key.startsWith(prefix)) {
          accounts.push(value as Account);
        }
      }
      
      this.setCachedValue(cacheKey, accounts);
      return accounts;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to get accounts by platform: ${errorMessage}`));
    }
  }

  /**
   * Get all accounts
   * @returns Array of all accounts
   */
  async getAllAccounts(): Promise<Account[]> {
    try {
      const cacheKey = ACCOUNTS_PREFIX;
      
      // Check cache first
      const cachedAccounts = this.getCachedValue<Account[]>(cacheKey);
      if (cachedAccounts) {
        return cachedAccounts;
      }
      
      // Get from storage
      const accounts: Account[] = [];
      
      for (const [key, value] of this.storage.entries()) {
        if (key.startsWith(ACCOUNTS_PREFIX)) {
          accounts.push(value as Account);
        }
      }
      
      this.setCachedValue(cacheKey, accounts);
      return accounts;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to get all accounts: ${errorMessage}`));
    }
  }

  /**
   * Delete an account
   * @param platform The platform (youtube or linkedin)
   * @param id The account id
   */
  deleteAccount(platform: "youtube" | "linkedin", id: string): Promise<void> {
    try {
      const key = this.generateKey(ACCOUNTS_PREFIX, platform, id);
      this.storage.delete(key);
      this.clearCacheKey(key);
      this.clearCacheKey(ACCOUNTS_PREFIX);
      this.clearCacheKey(this.generateKey(ACCOUNTS_PREFIX, platform));
      return Promise.resolve();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to delete account: ${errorMessage}`));
    }
  }

  /**
   * Save stream settings
   * @param id The settings id (usually "default" or a specific stream id)
   * @param settings The stream settings to save
   */
  async saveStreamSettings(id: string, settings: StreamSettings): Promise<void> {
    try {
      const key = this.generateKey(STREAM_SETTINGS_PREFIX, id);
      this.storage.set(key, settings);
      this.clearCacheKey(key);
      this.clearCacheKey(STREAM_SETTINGS_PREFIX);
      return Promise.resolve();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to save stream settings: ${errorMessage}`));
    }
  }

  /**
   * Get stream settings
   * @param id The settings id (usually "default" or a specific stream id)
   * @returns The stream settings or null if not found
   */
  async getStreamSettings(id: string): Promise<StreamSettings | null> {
    try {
      const key = this.generateKey(STREAM_SETTINGS_PREFIX, id);
      
      // Check cache first
      const cachedSettings = this.getCachedValue<StreamSettings>(key);
      if (cachedSettings) {
        return cachedSettings;
      }
      
      // Get from storage
      const settings = this.storage.get(key) as StreamSettings | undefined;
      if (settings) {
        this.setCachedValue(key, settings);
        return settings;
      }
      
      return null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to get stream settings: ${errorMessage}`));
    }
  }

  /**
   * Get all stream settings
   * @returns Record of all stream settings
   */
  async getAllStreamSettings(): Promise<Record<string, StreamSettings>> {
    try {
      const cacheKey = STREAM_SETTINGS_PREFIX;
      
      // Check cache first
      const cachedSettings = this.getCachedValue<Record<string, StreamSettings>>(cacheKey);
      if (cachedSettings) {
        return cachedSettings;
      }
      
      // Get from storage
      const settings: Record<string, StreamSettings> = {};
      
      for (const [key, value] of this.storage.entries()) {
        if (key.startsWith(STREAM_SETTINGS_PREFIX)) {
          const id = key.split(":").pop() || "";
          settings[id] = value as StreamSettings;
        }
      }
      
      this.setCachedValue(cacheKey, settings);
      return settings;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to get all stream settings: ${errorMessage}`));
    }
  }

  /**
   * Delete stream settings
   * @param id The settings id
   */
  deleteStreamSettings(id: string): Promise<void> {
    try {
      const key = this.generateKey(STREAM_SETTINGS_PREFIX, id);
      this.storage.delete(key);
      this.clearCacheKey(key);
      this.clearCacheKey(STREAM_SETTINGS_PREFIX);
      return Promise.resolve();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to delete stream settings: ${errorMessage}`));
    }
  }

  /**
   * Save a scheduled event
   * @param event The scheduled event to save
   */
  async saveScheduledEvent(event: ScheduledEvent): Promise<void> {
    try {
      const key = this.generateKey(SCHEDULED_EVENTS_PREFIX, event.id);
      this.storage.set(key, event);
      this.clearCacheKey(key);
      this.clearCacheKey(SCHEDULED_EVENTS_PREFIX);
      return Promise.resolve();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to save scheduled event: ${errorMessage}`));
    }
  }

  /**
   * Get a scheduled event by id
   * @param id The event id
   * @returns The scheduled event or null if not found
   */
  async getScheduledEvent(id: string): Promise<ScheduledEvent | null> {
    try {
      const key = this.generateKey(SCHEDULED_EVENTS_PREFIX, id);
      
      // Check cache first
      const cachedEvent = this.getCachedValue<ScheduledEvent>(key);
      if (cachedEvent) {
        return cachedEvent;
      }
      
      // Get from storage
      const event = this.storage.get(key) as ScheduledEvent | undefined;
      if (event) {
        this.setCachedValue(key, event);
        return event;
      }
      
      return null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to get scheduled event: ${errorMessage}`));
    }
  }

  /**
   * Get all scheduled events
   * @returns Array of all scheduled events
   */
  async getAllScheduledEvents(): Promise<ScheduledEvent[]> {
    try {
      const cacheKey = SCHEDULED_EVENTS_PREFIX;
      
      // Check cache first
      const cachedEvents = this.getCachedValue<ScheduledEvent[]>(cacheKey);
      if (cachedEvents) {
        return cachedEvents;
      }
      
      // Get from storage
      const events: ScheduledEvent[] = [];
      
      for (const [key, value] of this.storage.entries()) {
        if (key.startsWith(SCHEDULED_EVENTS_PREFIX)) {
          events.push(value as ScheduledEvent);
        }
      }
      
      this.setCachedValue(cacheKey, events);
      return events;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to get all scheduled events: ${errorMessage}`));
    }
  }

  /**
   * Get upcoming scheduled events
   * @param limit Optional limit on the number of events to return
   * @returns Array of upcoming scheduled events
   */
  async getUpcomingEvents(limit?: number): Promise<ScheduledEvent[]> {
    try {
      const allEvents = await this.getAllScheduledEvents();
      const now = new Date();
      
      // Filter events that are scheduled for the future and not canceled
      const upcomingEvents = allEvents
        .filter(event => 
          event.scheduledStartTime > now && 
          event.status !== "canceled" && 
          event.status !== "completed"
        )
        .sort((a, b) => a.scheduledStartTime.getTime() - b.scheduledStartTime.getTime());
      
      // Apply limit if specified
      return limit ? upcomingEvents.slice(0, limit) : upcomingEvents;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to get upcoming events: ${errorMessage}`));
    }
  }

  /**
   * Delete a scheduled event
   * @param id The event id
   */
  deleteScheduledEvent(id: string): Promise<void> {
    try {
      const key = this.generateKey(SCHEDULED_EVENTS_PREFIX, id);
      this.storage.delete(key);
      this.clearCacheKey(key);
      this.clearCacheKey(SCHEDULED_EVENTS_PREFIX);
      return Promise.resolve();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to delete scheduled event: ${errorMessage}`));
    }
  }

  /**
   * Save stream status
   * @param status The stream status to save
   */
  async saveStreamStatus(status: StreamStatus): Promise<void> {
    try {
      const key = STREAM_STATUS_PREFIX;
      this.storage.set(key, status);
      this.clearCacheKey(key);
      return Promise.resolve();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to save stream status: ${errorMessage}`));
    }
  }

  /**
   * Get stream status
   * @returns The stream status or null if not found
   */
  async getStreamStatus(): Promise<StreamStatus | null> {
    try {
      const key = STREAM_STATUS_PREFIX;
      
      // Check cache first
      const cachedStatus = this.getCachedValue<StreamStatus>(key);
      if (cachedStatus) {
        return cachedStatus;
      }
      
      // Get from storage
      const status = this.storage.get(key) as StreamStatus | undefined;
      if (status) {
        this.setCachedValue(key, status);
        return status;
      }
      
      return null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to get stream status: ${errorMessage}`));
    }
  }

  /**
   * Save generic data to the storage
   * @param key The key for the data
   * @param data The data to save
   */
  saveData<T>(key: string, data: T): Promise<void> {
    try {
      const fullKey = this.generateKey(GENERIC_DATA_PREFIX, key);
      this.storage.set(fullKey, data);
      this.clearCacheKey(fullKey);
      this.clearCacheKey(GENERIC_DATA_PREFIX);
      return Promise.resolve();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to save data with key "${key}": ${errorMessage}`));
    }
  }

  /**
   * Get generic data from the storage
   * @param key The key for the data
   * @returns The data or null if not found
   */
  async getData<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.generateKey(GENERIC_DATA_PREFIX, key);
      
      // Check cache first
      const cachedData = this.getCachedValue<T>(fullKey);
      if (cachedData) {
        return Promise.resolve(cachedData);
      }
      
      // Get from storage
      const data = this.storage.get(fullKey) as T | undefined;
      if (data !== undefined) {
        this.setCachedValue(fullKey, data);
        return Promise.resolve(data);
      }
      
      return Promise.resolve(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return Promise.reject(new Error(`Failed to get data with key "${key}": ${errorMessage}`));
    }
  }

  /**
   * Create a new instance of MockStateManager
   * @returns A new MockStateManager instance
   */
  static create(): MockStateManager {
    return new MockStateManager();
  }
}

// Create a singleton instance for easy import
const mockStateManager = MockStateManager.create();

// Export default for convenience
export default mockStateManager;