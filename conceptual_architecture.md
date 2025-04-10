# Conceptual Architecture: Multi-Destination Livestreaming Platform

This document outlines the conceptual architecture for a desktop application designed to simplify livestreaming to multiple destinations (initially YouTube and LinkedIn Live), built using the Deno runtime.

**Informed by:**

*   `background.md`: Details on LinkedIn Live API interactions.
*   `user_stories.md`: Functional and non-functional requirements.

## 1. Core Principles & Goals

*   **Simplicity:** Abstract away the complexities of individual platform APIs.
*   **Reliability:** Ensure stable streaming and clear status feedback.
*   **Extensibility:** Allow adding support for more destinations in the future.
*   **Security:** Handle API keys and user credentials securely.
*   **Deno Native:** Leverage Deno's features (TypeScript, security, built-in tooling).

## 2. Key Components

```mermaid
graph TD
    subgraph User Interface (Frontend - Deno/Webview)
        UI[UI Layer - Preact/SolidJS + Tailwind CSS]
        StateMgmt[State Management - Signals/Zustand]
        Config[Configuration Screen]
        Preview[Stream Preview]
        Controls[Start/Stop/Scene Controls]
    end

    subgraph Backend Logic (Deno)
        APIServer[API Server - Oak/Hono]
        Auth[Authentication Module - OAuth2 Client]
        StreamEngine[Streaming Engine]
        PlatformClients[Platform API Clients]
        StateManagerBE[Backend State Manager]
        Scheduler[Scheduling Module]
        RelayController[Relay Controller]
    end

    subgraph Platform APIs (External)
        YouTubeAPI[YouTube Live API]
        LinkedInAPI[LinkedIn Live API]
    end

    subgraph Local Resources
        Camera[Camera/Mic Input]
        Screen[Screen Capture]
    end

    subgraph Self-Hosted Relay (Future)
        SelfHostedRelay[Self-Hosted Relay Service]
    end

    UI -- Manages/Displays --> StateMgmt;
    Config -- Updates --> StateMgmt;
    Preview -- Displays --> StreamEngine;
    Controls -- Sends Commands --> APIServer;
    StateMgmt -- Syncs With --> StateManagerBE;

    APIServer -- Routes Requests --> Auth;
    APIServer -- Routes Requests --> StreamEngine;
    APIServer -- Routes Requests --> PlatformClients;
    APIServer -- Routes Requests --> Scheduler;
    APIServer -- Interacts With --> StateManagerBE;
    APIServer -- Interacts With --> RelayController;

    Auth -- Handles OAuth Flow --> PlatformClients;
    PlatformClients -- Interacts With --> YouTubeAPI;
    PlatformClients -- Interacts With --> LinkedInAPI;
    PlatformClients -- Stores Credentials Securely --> Auth;

    StreamEngine -- Gets Input From --> Camera;
    StreamEngine -- Gets Input From --> Screen;
    StreamEngine -- Sends Stream --> RelayController;
    RelayController -- Sends RTMP --> YouTubeAPI;
    RelayController -- Sends RTMP --> LinkedInAPI;
    RelayController -- Gets Config From --> StateManagerBE;
    RelayController -- Updates Status --> StateManagerBE;
    RelayController -- Implements --> SelfHostedRelay;

    Scheduler -- Uses --> PlatformClients;
    Scheduler -- Manages --> StateManagerBE;

    StateManagerBE -- Persists State --> Storage[Local Storage/DB];
```

**Component Descriptions:**

*   **User Interface (UI Layer):**
    *   Built using a web framework (like Preact or SolidJS) suitable for Deno.
    *   Styled with **Tailwind CSS** for a modern and customizable look.
    *   Runs within a Deno webview solution (simple web app).
    *   Provides screens for configuration (accounts, destinations, stream keys), stream preview, and controls.
    *   Manages UI state locally (e.g., using Signals).
*   **API Server (Backend):**
    *   Built with a Deno web framework (e.g., Oak, Hono).
    *   Handles requests from the UI (start/stop stream, save config, etc.).
    *   Acts as the central orchestrator for backend modules.
*   **Authentication Module:**
    *   Manages OAuth 2.0 flows for connecting YouTube and LinkedIn accounts.
    *   Securely stores and refreshes access/refresh tokens.
*   **Platform API Clients:**
    *   Dedicated modules for interacting with YouTube Live API and LinkedIn Live API.
    *   Handles specific API calls (checking access, registering streams, creating posts, getting stream keys/RTMP URLs, scheduling).
    *   Uses credentials managed by the Authentication Module.
*   **Streaming Engine:**
    *   Captures local camera/screen.
    *   Sends *one* high-quality stream (e.g., SRT or RTMP) to the Relay Controller.
*   **Relay Controller:**
    *   Manages the self-hosted relay service.
    *   Receives the single stream from the Streaming Engine.
    *   Distributes the stream to YouTube and LinkedIn via RTMP.
    *   Monitors the status of the relay service.
*   **Backend State Manager:**
    *   Manages the overall application state (connected accounts, selected destinations, stream status, API keys, scheduled events, relay configuration).
    *   Persists state locally (e.g., using Deno KV, SQLite, or simple JSON files).
    *   Synchronizes relevant state with the UI.
*   **Scheduling Module:**
    *   Interacts with Platform API Clients to schedule events on LinkedIn/YouTube.
    *   Manages scheduled times and triggers actions around the go-live time.

## 3. Technology Choices (Deno Ecosystem)

*   **Runtime:** Deno
*   **Web Framework (Backend API):** Oak or Hono (Lightweight, well-suited for API services)
*   **Web Framework (Frontend):** Preact or SolidJS (Performant, work well with Deno/TS)
*   **CSS Framework:** **Tailwind CSS**
*   **UI Packaging:** Deno's native webview capabilities (simple web app).
*   **State Management (UI):** Signals (Preact/Solid) or a simple store like Zustand.
*   **State Management (Backend):** In-memory stores for transient state, Deno KV or SQLite for persistence.
*   **OAuth 2.0 Client:** Deno's standard library or community modules for OAuth flows.
*   **Self-Hosted Relay:** To be determined (e.g., Nimble Streamer, SRS, custom solution).
*   **RTMP Handling:** Handled by the self-hosted relay service.
*   **Video/Audio Capture:** Browser APIs ( `getUserMedia`, `getDisplayMedia`).

## 4. Key Design Decisions & Trade-offs

*   **Local vs. Cloud Streaming Engine:** Opting for a self-hosted relay service provides more control and avoids reliance on third-party services, but requires more setup and maintenance.
*   **UI Technology:** Using Deno's webview simplifies deployment as a web app.
*   **State Persistence:** Deno KV is simple for key-value storage. SQLite offers relational storage if state becomes more complex. **Decision: Start with Deno KV.**
*   **Credential Storage:** Storing API keys/tokens securely is paramount. For the prototype, encryption with a key stored in an environment variable will be used. **This is not suitable for production.**

## 5. Scalability & Maintainability

*   **Modular Design:** Breaking down logic into distinct components (Auth, API Clients, Streaming Engine Control) aids maintainability.
*   **TypeScript:** Deno's native TS support improves code quality and refactoring.
*   **Self-Hosted Relay:** Scalability depends on the chosen relay service.
*   **Configuration:** Externalizing platform URLs, API endpoints, etc., allows for easier updates.

## 6. Assumptions (from user_stories.md)

*   Initial focus on YouTube and LinkedIn.
*   Single outgoing stream quality sent to the relay.
*   Basic scene management (e.g., camera feed + optional screen share).
*   User manages stream content/layout primarily *before* it hits this application (e.g., using OBS virtual camera as input or simple camera/screen selection).