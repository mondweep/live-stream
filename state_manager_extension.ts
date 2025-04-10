/**
 * Extended StateManager with generic data storage capabilities
 */
import { StateManager, Account, StreamSettings, ScheduledEvent, StreamStatus } from "./state_manager.ts";
import { MockStateManager } from "./state_manager_mock.ts";

// Check if Deno.openKv is available
const isKvAvailable = typeof Deno.openKv === "function";

// Define key prefixes for different types of data
const GENERIC_DATA_PREFIX = ["generic_data"];

/**
 * Extends the StateManager with generic data storage methods using inheritance.
 * Only used when Deno.openKv is available.
 */
export class ExtendedStateManager extends StateManager {

  /**
   * Save generic data to the KV store
   * @param key The key for the data
   * @param data The data to save
   */
  async saveData<T>(key: string, data: T): Promise<void> {
    try {
      if (!isKvAvailable) {
        throw new Error("Deno.openKv is not available");
      }
      
      // @ts-ignore Accessing private ensureInitialized - necessary due to original design
      await this.ensureInitialized();
      const fullKey = [...GENERIC_DATA_PREFIX, key];
      // @ts-ignore Accessing private kv
      await this.kv.set(fullKey, data);
      // @ts-ignore Accessing private clearCacheKey and generateCacheKey
      this.clearCacheKey(this.generateCacheKey(fullKey));
      // @ts-ignore Accessing private clearCacheKey and generateCacheKey
      this.clearCacheKey(this.generateCacheKey(GENERIC_DATA_PREFIX));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save data with key "${key}": ${errorMessage}`);
    }
  }

  /**
   * Get generic data from the KV store
   * @param key The key for the data
   * @returns The data or null if not found
   */
  async getData<T>(key: string): Promise<T | null> {
    try {
      if (!isKvAvailable) {
        throw new Error("Deno.openKv is not available");
      }
      
      // @ts-ignore Accessing private ensureInitialized
      await this.ensureInitialized();
      const fullKey = [...GENERIC_DATA_PREFIX, key];
      // @ts-ignore Accessing private generateCacheKey
      const cacheKey = this.generateCacheKey(fullKey);
      
      // Check cache first
      // @ts-ignore Accessing private getCachedValue
      const cachedData = this.getCachedValue<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      // Get from KV store
      // @ts-ignore Accessing private kv
      const result = await this.kv.get<T>(fullKey);
      if (result.value !== null && result.value !== undefined) {
        // @ts-ignore Accessing private setCachedValue
        this.setCachedValue(cacheKey, result.value);
        return result.value;
      }
      
      return null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get data with key "${key}": ${errorMessage}`);
    }
  }

  /**
   * Create a new instance of ExtendedStateManager with default settings
   * @returns A new ExtendedStateManager instance
   */
  static async createExtended(): Promise<ExtendedStateManager> {
    if (!isKvAvailable) {
      throw new Error("Cannot create ExtendedStateManager: Deno.openKv is not available");
    }
    
    const manager = new ExtendedStateManager();
    // @ts-ignore Accessing private ensureInitialized
    await manager.ensureInitialized();
    return manager;
  }
}

/**
 * Class that extends the appropriate state manager based on availability
 */
export class StateManagerFactory {
  /**
   * Create the appropriate state manager based on environment
   */
  static async create(): Promise<ExtendedStateManager | MockStateManager> {
    try {
      if (isKvAvailable) {
        console.log("Using ExtendedStateManager with Deno KV store");
        return await ExtendedStateManager.createExtended();
      } else {
        throw new Error("Deno.openKv is not available");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log("Using MockStateManager (in-memory storage):", errorMessage);
      return MockStateManager.create();
    }
  }
}

// Create a singleton instance for easy import
let stateManagerInstance: ExtendedStateManager | MockStateManager;

try {
  stateManagerInstance = await StateManagerFactory.create();
} catch (error) {
  console.error("Error creating state manager, falling back to mock:", error);
  stateManagerInstance = MockStateManager.create();
}

// Export default for convenience
export default stateManagerInstance;

// Re-export original types for convenience
export type { Account, StreamSettings, ScheduledEvent, StreamStatus };