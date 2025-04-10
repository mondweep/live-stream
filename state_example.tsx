/** @jsxImportSource solid-js */

import { createSignal, For, Show } from "solid-js";
import { render } from "solid-js/web";
import { 
  StateProvider, 
  accounts, 
  streamSettings, 
  scheduledEvents, 
  streamStatus,
  saveStreamSettings,
  saveScheduledEvent,
  deleteScheduledEvent,
  saveStreamStatus
} from "./ui_state_sync.ts";
import { StreamSettings, ScheduledEvent, StreamStatus } from "./state_manager.ts";

/**
 * Example component that demonstrates how to use the state management system
 */
export function StateExample() {
  // Local form state for creating/editing
  const [newTitle, setNewTitle] = createSignal("");
  const [newDescription, setNewDescription] = createSignal("");
  const [selectedVisibility, setSelectedVisibility] = createSignal<"public" | "private" | "unlisted">("public");
  
  // Create a new stream settings object
  const createNewSettings = () => {
    const settings: StreamSettings = {
      title: newTitle(),
      description: newDescription(),
      visibility: selectedVisibility()
    };
    
    saveStreamSettings(settings)
      .then(() => {
        // Reset form
        setNewTitle("");
        setNewDescription("");
        setSelectedVisibility("public");
      })
      .catch(error => {
        console.error("Failed to save settings:", error);
      });
  };
  
  // Create a new scheduled event
  const createNewEvent = () => {
    const event: ScheduledEvent = {
      id: crypto.randomUUID(),
      title: newTitle(),
      description: newDescription(),
      platforms: ["youtube", "linkedin"],
      scheduledStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      settings: {
        youtube: {
          title: newTitle(),
          description: newDescription(),
          visibility: selectedVisibility()
        },
        linkedin: {
          title: newTitle(),
          description: newDescription(),
          visibility: selectedVisibility()
        }
      },
      status: "scheduled"
    };
    
    saveScheduledEvent(event)
      .then(() => {
        // Reset form
        setNewTitle("");
        setNewDescription("");
        setSelectedVisibility("public");
      })
      .catch(error => {
        console.error("Failed to save event:", error);
      });
  };
  
  // Start streaming
  const startStreaming = () => {
    const status: StreamStatus = {
      isActive: true,
      startedAt: new Date(),
      platforms: {
        youtube: {
          isStreaming: true,
          streamId: crypto.randomUUID()
        },
        linkedin: {
          isStreaming: true,
          streamId: crypto.randomUUID()
        }
      }
    };
    
    saveStreamStatus(status)
      .catch(error => {
        console.error("Failed to start streaming:", error);
      });
  };
  
  // Stop streaming
  const stopStreaming = () => {
    if (!streamStatus().current) return;
    
    const status: StreamStatus = {
      ...streamStatus().current,
      isActive: false,
      platforms: {
        youtube: {
          isStreaming: false
        },
        linkedin: {
          isStreaming: false
        }
      }
    };
    
    saveStreamStatus(status)
      .catch(error => {
        console.error("Failed to stop streaming:", error);
      });
  };
  
  return (
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">State Management Example</h1>
      
      {/* Accounts Section */}
      <section class="mb-8">
        <h2 class="text-xl font-semibold mb-2">Connected Accounts</h2>
        
        <Show when={accounts().loading}>
          <p>Loading accounts...</p>
        </Show>
        
        <Show when={accounts().error}>
          <p class="text-red-500">Error: {accounts().error}</p>
        </Show>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="font-medium">YouTube Accounts</h3>
            <Show when={accounts().youtube.length === 0}>
              <p class="text-gray-500">No YouTube accounts connected</p>
            </Show>
            <For each={accounts().youtube}>
              {(account) => (
                <div class="border p-2 rounded mb-2">
                  <p><strong>ID:</strong> {account.id}</p>
                  <p><strong>Name:</strong> {account.profile?.name || "Unknown"}</p>
                </div>
              )}
            </For>
          </div>
          
          <div>
            <h3 class="font-medium">LinkedIn Accounts</h3>
            <Show when={accounts().linkedin.length === 0}>
              <p class="text-gray-500">No LinkedIn accounts connected</p>
            </Show>
            <For each={accounts().linkedin}>
              {(account) => (
                <div class="border p-2 rounded mb-2">
                  <p><strong>ID:</strong> {account.id}</p>
                  <p><strong>Name:</strong> {account.profile?.name || "Unknown"}</p>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>
      
      {/* Stream Settings Section */}
      <section class="mb-8">
        <h2 class="text-xl font-semibold mb-2">Stream Settings</h2>
        
        <Show when={streamSettings().loading}>
          <p>Loading settings...</p>
        </Show>
        
        <Show when={streamSettings().error}>
          <p class="text-red-500">Error: {streamSettings().error}</p>
        </Show>
        
        <Show when={streamSettings().current}>
          <div class="border p-4 rounded mb-4">
            <p><strong>Title:</strong> {streamSettings().current?.title}</p>
            <p><strong>Description:</strong> {streamSettings().current?.description}</p>
            <p><strong>Visibility:</strong> {streamSettings().current?.visibility}</p>
          </div>
        </Show>
        
        <div class="border p-4 rounded">
          <h3 class="font-medium mb-2">Create/Update Settings</h3>
          <div class="mb-2">
            <label class="block text-sm">Title</label>
            <input
              type="text"
              value={newTitle()}
              onInput={(e) => setNewTitle(e.target.value)}
              class="border p-2 w-full rounded"
            />
          </div>
          
          <div class="mb-2">
            <label class="block text-sm">Description</label>
            <textarea
              value={newDescription()}
              onInput={(e) => setNewDescription(e.target.value)}
              class="border p-2 w-full rounded"
              rows="3"
            ></textarea>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm">Visibility</label>
            <select
              value={selectedVisibility()}
              onChange={(e) => setSelectedVisibility(e.target.value as "public" | "private" | "unlisted")}
              class="border p-2 w-full rounded"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
            </select>
          </div>
          
          <button
            type="button"
            onClick={createNewSettings}
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Settings
          </button>
        </div>
      </section>
      
      {/* Scheduled Events Section */}
      <section class="mb-8">
        <h2 class="text-xl font-semibold mb-2">Scheduled Events</h2>
        
        <Show when={scheduledEvents().loading}>
          <p>Loading events...</p>
        </Show>
        
        <Show when={scheduledEvents().error}>
          <p class="text-red-500">Error: {scheduledEvents().error}</p>
        </Show>
        
        <div class="mb-4">
          <h3 class="font-medium mb-2">Upcoming Events</h3>
          <Show when={scheduledEvents().upcoming.length === 0}>
            <p class="text-gray-500">No upcoming events</p>
          </Show>
          <For each={scheduledEvents().upcoming}>
            {(event) => (
              <div class="border p-2 rounded mb-2 flex justify-between items-center">
                <div>
                  <p><strong>{event.title}</strong></p>
                  <p class="text-sm">{event.scheduledStartTime.toLocaleString()}</p>
                  <p class="text-sm">Platforms: {event.platforms.join(", ")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteScheduledEvent(event.id)}
                  class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            )}
          </For>
        </div>
        
        <div class="border p-4 rounded">
          <h3 class="font-medium mb-2">Create New Event</h3>
          <div class="mb-2">
            <label class="block text-sm">Title</label>
            <input
              type="text"
              value={newTitle()}
              onInput={(e) => setNewTitle(e.target.value)}
              class="border p-2 w-full rounded"
            />
          </div>
          
          <div class="mb-2">
            <label class="block text-sm">Description</label>
            <textarea
              value={newDescription()}
              onInput={(e) => setNewDescription(e.target.value)}
              class="border p-2 w-full rounded"
              rows="3"
            ></textarea>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm">Visibility</label>
            <select
              value={selectedVisibility()}
              onChange={(e) => setSelectedVisibility(e.target.value as "public" | "private" | "unlisted")}
              class="border p-2 w-full rounded"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
            </select>
          </div>
          
          <button
            type="button"
            onClick={createNewEvent}
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Schedule Event
          </button>
        </div>
      </section>
      
      {/* Stream Status Section */}
      <section>
        <h2 class="text-xl font-semibold mb-2">Stream Status</h2>
        
        <Show when={streamStatus().loading}>
          <p>Loading status...</p>
        </Show>
        
        <Show when={streamStatus().error}>
          <p class="text-red-500">Error: {streamStatus().error}</p>
        </Show>
        
        <div class="border p-4 rounded mb-4">
          <Show when={streamStatus().current?.isActive}>
            <div class="bg-green-100 p-2 rounded mb-2">
              <p class="font-bold text-green-800">Stream is active</p>
              <p>Started at: {streamStatus().current?.startedAt?.toLocaleString()}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 class="font-medium">YouTube</h3>
                <p>Status: {streamStatus().current?.platforms.youtube?.isStreaming ? "Streaming" : "Not streaming"}</p>
                <Show when={streamStatus().current?.platforms.youtube?.streamId}>
                  <p>Stream ID: {streamStatus().current?.platforms.youtube?.streamId}</p>
                </Show>
              </div>
              
              <div>
                <h3 class="font-medium">LinkedIn</h3>
                <p>Status: {streamStatus().current?.platforms.linkedin?.isStreaming ? "Streaming" : "Not streaming"}</p>
                <Show when={streamStatus().current?.platforms.linkedin?.streamId}>
                  <p>Stream ID: {streamStatus().current?.platforms.linkedin?.streamId}</p>
                </Show>
              </div>
            </div>
            
            <button
              type="button"
              onClick={stopStreaming}
              class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Stop Streaming
            </button>
          </Show>
          
          <Show when={!streamStatus().current?.isActive}>
            <p class="mb-4">Stream is not active</p>
            <button
              type="button"
              onClick={startStreaming}
              class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Start Streaming
            </button>
          </Show>
        </div>
      </section>
    </div>
  );
}

/**
 * Render the example app
 */
export function renderStateExample(rootElement: HTMLElement) {
  render(() => (
    <StateProvider>
      <StateExample />
    </StateProvider>
  ), rootElement);
}