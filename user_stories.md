# User Stories: Multi-Destination Livestreaming Platform

This document outlines the user stories for a platform designed to simplify livestreaming from a laptop to multiple destinations, initially focusing on YouTube Live and LinkedIn Live.

## Assumptions

*   **Initial Destinations:** The platform will initially support streaming to LinkedIn Live (Personal Profiles & Company Pages) and YouTube Live.
*   **Simultaneous Streams:** Only one livestream session can be active at a time in the initial version. Simulcasting to selected destinations within that single session is the core feature.
*   **Input Sources:** The platform will support basic scene management, allowing users to switch between or combine:
    *   Laptop Webcam
    *   Screen Share (Full screen or specific application window)
*   **Encoding:** The platform handles the necessary video/audio encoding internally, providing a user-friendly interface that abstracts away the complexities of RTMP settings (though it will use RTMP/RTMPS behind the scenes).
*   **Platform:** The initial product is assumed to be a desktop application for macOS and Windows.
*   **Authentication:** Users will connect their LinkedIn and YouTube accounts using standard OAuth 2.0 flows managed by the platform.
*   **Scheduling:** Basic scheduling capabilities will be included, leveraging the native scheduling features of the destination platforms where available (e.g., LinkedIn Scheduled Events). Advanced scheduling features are deferred.
*   **Audience Targeting:** Advanced audience targeting (like LinkedIn's specific criteria) is not included in the initial scope. Basic privacy/visibility settings (Public, Unlisted for YouTube; Public, Connections for LinkedIn) will be supported.
*   **Monitoring:** Basic stream health indicators (e.g., connection status, bitrate) will be displayed. Advanced analytics are out of scope initially.
*   **Chat/Interaction:** Viewing or managing live chat/comments is not part of the initial scope.

## Prioritization (MoSCoW)

*   **M (Must Have):** Essential for the Minimum Viable Product (MVP). The platform cannot launch without these.
*   **S (Should Have):** Important features that add significant value, but the platform could launch without them if necessary.
*   **C (Could Have):** Desirable features, nice-to-haves, to be considered if time/resources permit after Musts and Shoulds.
*   **W (Won't Have this time):** Features explicitly excluded from this release/scope.

---

## User Stories

### Account Management

**US01: Connect LinkedIn Account (M)**
*   **As a** user,
*   **I want to** securely connect my LinkedIn account to the platform,
*   **So that** I can stream to my personal profile or managed Company Pages.
*   **Acceptance Criteria:**
    *   User can initiate the LinkedIn OAuth 2.0 flow from the platform settings.
    *   User is redirected to LinkedIn to authorize the application.
    *   Required permissions (`w_member_social`, `r_liteprofile`, potentially `rw_organization_admin`) are requested.
    *   Upon successful authorization, the platform securely stores the necessary tokens.
    *   The platform indicates a successful connection status for LinkedIn.
    *   User can disconnect their LinkedIn account.
    *   Clear error messages are shown if the connection fails (e.g., permissions denied, API error).

**US02: Connect YouTube Account (M)**
*   **As a** user,
*   **I want to** securely connect my YouTube (Google) account to the platform,
*   **So that** I can stream to my YouTube channel.
*   **Acceptance Criteria:**
    *   User can initiate the Google OAuth 2.0 flow from the platform settings.
    *   User is redirected to Google to authorize the application.
    *   Required permissions (e.g., `youtube.googleapis.com/auth/youtube.upload`, `youtube.googleapis.com/auth/youtube`) are requested.
    *   Upon successful authorization, the platform securely stores the necessary tokens.
    *   The platform indicates a successful connection status for YouTube.
    *   User can disconnect their YouTube account.
    *   Clear error messages are shown if the connection fails.

### Stream Setup & Configuration

**US03: Select Streaming Destinations (M)**
*   **As a** user,
*   **I want to** select one or more connected accounts/pages (LinkedIn Profile, LinkedIn Page, YouTube Channel) as destinations for my upcoming stream,
*   **So that** my video is broadcast to the chosen platforms simultaneously.
*   **Acceptance Criteria:**
    *   The UI displays a list of successfully connected accounts/pages.
    *   User can toggle/select destinations for the current stream session.
    *   At least one destination must be selected to enable streaming.
    *   The selection is clearly indicated in the UI.

**US04: Configure Basic Stream Details (M)**
*   **As a** user,
*   **I want to** set a title and description for my livestream,
*   **So that** viewers on the destination platforms know what the stream is about.
*   **Acceptance Criteria:**
    *   Input fields for Stream Title and Stream Description are available.
    *   These details are sent to the respective platform APIs when the stream is created/started.
    *   Defaults or previous values might be suggested (S).
    *   Character limits (if applicable per platform) are indicated or handled gracefully.

**US05: Select Input Sources (Basic Scene) (M)**
*   **As a** user,
*   **I want to** choose my video source (webcam) and optionally add a screen share (full screen or application window),
*   **So that** I can control what content is broadcast.
*   **Acceptance Criteria:**
    *   User can select available webcams.
    *   User can initiate screen sharing selection (choosing screen or window).
    *   User can choose a layout (e.g., Camera only, Screen only, Picture-in-Picture). (S)
    *   A preview area shows the current scene composition before going live.
    *   Audio input source (microphone) is automatically selected or selectable (S).

**US06: Set Stream Visibility/Privacy (S)**
*   **As a** user,
*   **I want to** set the basic visibility for my stream on each platform (e.g., Public/Unlisted for YouTube, Public/Connections for LinkedIn),
*   **So that** I control who can view the stream.
*   **Acceptance Criteria:**
    *   Visibility options relevant to the selected platforms are presented.
    *   User selection is mapped to the correct API parameters for each destination.
    *   Default visibility is 'Public'.

### Streaming Lifecycle

**US07: Start Livestream (M)**
*   **As a** user,
*   **I want to** click a "Go Live" button,
*   **So that** the platform initiates the stream creation process on the selected destinations and starts broadcasting my configured scene.
*   **Acceptance Criteria:**
    *   The "Go Live" button is enabled only when prerequisites are met (account connected, destination selected, input source configured).
    *   Clicking the button triggers API calls to register/create live events on selected platforms (e.g., `POST /liveVideos` on LinkedIn, `liveBroadcasts.insert` on YouTube).
    *   The platform obtains RTMP ingest URLs and stream keys from the APIs.
    *   The internal encoder starts sending the video/audio feed to the destinations.
    *   The UI clearly indicates the stream is starting/connecting.
    *   Error handling: If any destination fails to start, provide clear feedback to the user (e.g., "Failed to start on LinkedIn: [Reason]"). The stream might proceed to other successful destinations (S).

**US08: Monitor Stream Status (M)**
*   **As a** user,
*   **I want to** see clear indicators of the stream status while live,
*   **So that** I know if the stream is active and broadcasting correctly.
*   **Acceptance Criteria:**
    *   A clear "LIVE" indicator is displayed.
    *   A timer shows the duration of the current live session.
    *   Basic status indicators for each destination are shown (e.g., Green dot for 'Streaming', Red dot for 'Error', Yellow for 'Connecting/Buffering'). (S)
    *   Basic stream health info (e.g., bitrate, connection quality indicator) is visible. (S)

**US09: Stop Livestream (M)**
*   **As a** user,
*   **I want to** click a "Stop Stream" button,
*   **So that** the broadcast ends cleanly on all selected destinations.
*   **Acceptance Criteria:**
    *   A "Stop Stream" button is available while live.
    *   Clicking the button stops the internal encoder.
    *   API calls are made to end the live events on destination platforms (e.g., `POST /liveVideos/{urn}?action=transition` with `ENDED` on LinkedIn, `liveBroadcasts.transition` to `complete` on YouTube).
    *   The UI updates to indicate the stream has ended.
    *   A confirmation prompt is shown before stopping (S).

### Basic Scheduling

**US10: Schedule a LinkedIn Live Event (S)**
*   **As a** user,
*   **I want to** schedule a LinkedIn live stream for a future date and time, providing title and description,
*   **So that** I can promote it in advance.
*   **Acceptance Criteria:**
    *   UI allows selecting a future start date/time.
    *   Platform uses the LinkedIn `POST /scheduledLiveEvents` endpoint.
    *   User can view their scheduled streams within the platform.
    *   When it's time to go live (or shortly before), the platform retrieves the RTMP details for the scheduled event (`GET /scheduledLiveEvents/{urn}`).
    *   Starting the stream follows a similar flow to US07, but uses the pre-scheduled event details.

**US11: Schedule a YouTube Live Event (C)**
*   **As a** user,
*   **I want to** schedule a YouTube live stream for a future date and time,
*   **So that** I can promote it in advance on YouTube.
*   **Acceptance Criteria:**
    *   UI allows selecting a future start date/time for YouTube destinations.
    *   Platform uses the YouTube `liveBroadcasts.insert` API with appropriate scheduling parameters.
    *   User can view scheduled YouTube streams.
    *   Starting the stream uses the pre-scheduled broadcast details.

### Error Handling & UX

**US12: Handle API/Connection Errors Gracefully (M)**
*   **As a** user,
*   **I want** the platform to inform me clearly if there are issues connecting to accounts, starting streams, or during an active stream (e.g., API errors, network problems, permission issues),
*   **So that** I understand the problem and can potentially take corrective action.
*   **Acceptance Criteria:**
    *   Specific, user-friendly error messages are displayed for common issues (invalid tokens, insufficient permissions, API rate limits, network disconnects, ingest errors).
    *   Where possible, suggestions for resolution are provided.
    *   During a live stream, if a destination fails, the user is notified, but the stream continues to other active destinations if possible.

**US13: Persist Settings (S)**
*   **As a** user,
*   **I want** the platform to remember my connected accounts and common settings (like preferred camera/mic, last used destinations),
*   **So that** I don't have to reconfigure everything each time I open the application.
*   **Acceptance Criteria:**
    *   Connected accounts remain linked between sessions until explicitly disconnected.
    *   Last used input devices are pre-selected if available.
    *   Last selected destinations might be pre-selected (optional toggle).

### Features Not Included (Won't Have this time - W)

*   Advanced scene mixing (multiple cameras, complex overlays, transitions beyond simple cuts).
*   Guest invitations/participation.
*   Recording the stream locally (beyond what platforms might do).
*   Viewing/managing live chat comments.
*   Advanced analytics display within the platform.
*   Support for platforms beyond LinkedIn and YouTube.
*   Advanced LinkedIn Audience Targeting.
*   RTSP/SRT or other ingest protocols.
*   Plugin architecture or extensive customization.