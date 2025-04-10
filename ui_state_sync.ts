import { createSignal, createEffect, onCleanup } from "https://cdn.skypack.dev/solid-js";
import stateManager, { 
  Account, 
  StreamSettings, 
  ScheduledEvent, 
  StreamStatus 
} from "./state_manager.ts";

// Define types for UI state
export interface UIState {
  accounts: {
    youtube: Account[];
    linkedin: Account[];
    loading: boolean;
    error: string | null;
  };
  streamSettings: {
    current: StreamSettings | null;
    loading: boolean;
    error: string | null;
  };
  scheduledEvents: {
    upcoming: ScheduledEvent[];
    all: ScheduledEvent[];
    loading: boolean;
    error: string | null;
  };
  streamStatus: {
    current: StreamStatus | null;
    loading: boolean;
    error: string | null;
  };
}

// Create initial UI state
const initialState: UIState = {
  accounts: {
    youtube: [],
    linkedin: [],
    loading: false,
    error: null
  },
  streamSettings: {
    current: null,
    loading: false,
    error: null
  },
  scheduledEvents: {
    upcoming: [],
    all: [],
    loading: false,
    error: null
  },
  streamStatus: {
    current: null,
    loading: false,
    error: null
  }
};

// Create signals for each part of the state
const [accounts, setAccounts] = createSignal(initialState.accounts);
const [streamSettings, setStreamSettings] = createSignal(initialState.streamSettings);
const [scheduledEvents, setScheduledEvents] = createSignal(initialState.scheduledEvents);
const [streamStatus, setStreamStatus] = createSignal(initialState.streamStatus);

// Create a combined state signal
export const getUIState = (): UIState => ({
  accounts: accounts(),
  streamSettings: streamSettings(),
  scheduledEvents: scheduledEvents(),
  streamStatus: streamStatus()
});

/**
 * Load accounts from the state manager
 */
export async function loadAccounts(): Promise<void> {
  try {
    setAccounts((prev: UIState["accounts"]) => ({ ...prev, loading: true, error: null }));
    
    // Load YouTube accounts
    const youtubeAccounts = await stateManager.getAccountsByPlatform("youtube");
    
    // Load LinkedIn accounts
    const linkedinAccounts = await stateManager.getAccountsByPlatform("linkedin");
    
    setAccounts({
      youtube: youtubeAccounts,
      linkedin: linkedinAccounts,
      loading: false,
      error: null
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to load accounts:", errorMessage);
    setAccounts((prev: UIState["accounts"]) => ({ ...prev, loading: false, error: errorMessage }));
  }
}

/**
 * Load stream settings from the state manager
 * @param id The settings ID (default if not provided)
 */
export async function loadStreamSettings(id: string = "default"): Promise<void> {
  try {
    setStreamSettings((prev: UIState["streamSettings"]) => ({ ...prev, loading: true, error: null }));
    
    const settings = await stateManager.getStreamSettings(id);
    
    setStreamSettings({
      current: settings,
      loading: false,
      error: null
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to load stream settings:", errorMessage);
    setStreamSettings((prev: UIState["streamSettings"]) => ({ ...prev, loading: false, error: errorMessage }));
  }
}

/**
 * Save stream settings to the state manager
 * @param settings The settings to save
 * @param id The settings ID (default if not provided)
 */
export async function saveStreamSettings(settings: StreamSettings, id: string = "default"): Promise<void> {
  try {
    setStreamSettings((prev: UIState["streamSettings"]) => ({ ...prev, loading: true, error: null }));
    
    await stateManager.saveStreamSettings(id, settings);
    
    setStreamSettings({
      current: settings,
      loading: false,
      error: null
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to save stream settings:", errorMessage);
    setStreamSettings((prev: UIState["streamSettings"]) => ({ ...prev, loading: false, error: errorMessage }));
  }
}

/**
 * Load scheduled events from the state manager
 */
export async function loadScheduledEvents(): Promise<void> {
  try {
    setScheduledEvents((prev: UIState["scheduledEvents"]) => ({ ...prev, loading: true, error: null }));
    
    // Load all events
    const allEvents = await stateManager.getAllScheduledEvents();
    
    // Load upcoming events
    const upcomingEvents = await stateManager.getUpcomingEvents();
    
    setScheduledEvents({
      all: allEvents,
      upcoming: upcomingEvents,
      loading: false,
      error: null
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to load scheduled events:", errorMessage);
    setScheduledEvents((prev: UIState["scheduledEvents"]) => ({ ...prev, loading: false, error: errorMessage }));
  }
}

/**
 * Save a scheduled event to the state manager
 * @param event The event to save
 */
export async function saveScheduledEvent(event: ScheduledEvent): Promise<void> {
  try {
    setScheduledEvents((prev: UIState["scheduledEvents"]) => ({ ...prev, loading: true, error: null }));
    
    await stateManager.saveScheduledEvent(event);
    
    // Reload events to update the UI
    await loadScheduledEvents();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to save scheduled event:", errorMessage);
    setScheduledEvents((prev: UIState["scheduledEvents"]) => ({ ...prev, loading: false, error: errorMessage }));
  }
}

/**
 * Delete a scheduled event from the state manager
 * @param id The event ID to delete
 */
export async function deleteScheduledEvent(id: string): Promise<void> {
  try {
    setScheduledEvents((prev: UIState["scheduledEvents"]) => ({ ...prev, loading: true, error: null }));
    
    await stateManager.deleteScheduledEvent(id);
    
    // Reload events to update the UI
    await loadScheduledEvents();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to delete scheduled event:", errorMessage);
    setScheduledEvents((prev: UIState["scheduledEvents"]) => ({ ...prev, loading: false, error: errorMessage }));
  }
}

/**
 * Load stream status from the state manager
 */
export async function loadStreamStatus(): Promise<void> {
  try {
    setStreamStatus((prev: UIState["streamStatus"]) => ({ ...prev, loading: true, error: null }));
    
    const status = await stateManager.getStreamStatus();
    
    setStreamStatus({
      current: status,
      loading: false,
      error: null
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to load stream status:", errorMessage);
    setStreamStatus((prev: UIState["streamStatus"]) => ({ ...prev, loading: false, error: errorMessage }));
  }
}

/**
 * Save stream status to the state manager
 * @param status The status to save
 */
export async function saveStreamStatus(status: StreamStatus): Promise<void> {
  try {
    setStreamStatus((prev: UIState["streamStatus"]) => ({ ...prev, loading: true, error: null }));
    
    await stateManager.saveStreamStatus(status);
    
    setStreamStatus({
      current: status,
      loading: false,
      error: null
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to save stream status:", errorMessage);
    setStreamStatus((prev: UIState["streamStatus"]) => ({ ...prev, loading: false, error: errorMessage }));
  }
}

/**
 * Setup automatic polling for stream status
 * @param intervalMs Polling interval in milliseconds (default: 10000 - 10 seconds)
 * @returns A function to stop polling
 */
export function setupStreamStatusPolling(intervalMs: number = 10000): () => void {
  const intervalId = setInterval(loadStreamStatus, intervalMs);
  
  // Return a function to stop polling
  return () => clearInterval(intervalId);
}

/**
 * Initialize all state
 */
export async function initializeState(): Promise<void> {
  try {
    await Promise.all([
      loadAccounts(),
      loadStreamSettings(),
      loadScheduledEvents(),
      loadStreamStatus()
    ]);
    console.log("State initialized successfully");
  } catch (error) {
    console.error("Failed to initialize state:", error);
  }
}

/**
 * Create a component that automatically initializes and keeps state in sync
 * @param props Component props
 * @returns Component JSX
 */
export function StateProvider(props: { children: any }) {
  // Initialize state when component mounts
  createEffect(() => {
    initializeState();
    
    // Setup polling for stream status
    const stopPolling = setupStreamStatusPolling();
    
    // Cleanup when component unmounts
    onCleanup(() => {
      stopPolling();
    });
  });
  
  return props.children;
}

// Export all state signals
export { accounts, streamSettings, scheduledEvents, streamStatus };