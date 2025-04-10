# LinkedIn Live API Background

This document provides a summary of the key concepts, workflows, and prerequisites for using the LinkedIn Live API to stream video content.

## Prerequisites

*   **API Access Approval:** You must apply for and be granted access to the LinkedIn Live Video API.
*   **Permissions:** Your LinkedIn application needs the appropriate permissions (e.g., `w_member_social` for basic streaming, `rw_organization_admin` for streaming to Company Pages).
*   **OAuth 2.0 Access Token:** API calls must be authenticated using a valid OAuth 2.0 access token with the required scopes.

## Key Concepts

*   **Live Video API:** The set of endpoints provided by LinkedIn to create, manage, and stream live video events.
*   **URNs (Uniform Resource Names):** LinkedIn uses URNs to uniquely identify resources like users (`person URN`), organizations (`organization URN`), and live video events (`liveVideo URN`).
*   **RTMP (Real-Time Messaging Protocol):** The standard protocol used for streaming video. The API provides an RTMP ingest URL and a stream key for each live event.

## Core API Endpoints & Workflows

### 1. Basic Streaming Workflow

This workflow allows streaming directly to a member's profile or a Company Page they manage.

1.  **Register Live Event:**
    *   `POST /liveVideos`
    *   Provide the owner URN (member or organization) and input settings (like stream resolution).
    *   Response includes the `liveVideo URN` and RTMP `ingestUrl` and `streamKey`.
2.  **Configure Encoder:** Use the `ingestUrl` and `streamKey` in your RTMP encoder (e.g., OBS).
3.  **Start Streaming:** Begin sending the video feed from your encoder to the LinkedIn ingest URL.
4.  **Transition Event State (Optional but Recommended):**
    *   `POST /liveVideos/{liveVideoUrn}?action=transition` with `{"transition": "READY"}` (when stream is stable).
    *   `POST /liveVideos/{liveVideoUrn}?action=transition` with `{"transition": "PUBLISHED"}` (to make it visible).
5.  **Stop Streaming:** End the stream from your encoder.
6.  **End Live Event:**
    *   `POST /liveVideos/{liveVideoUrn}?action=transition` with `{"transition": "ENDED"}`.

### 2. Scheduled Streaming Workflow

Allows scheduling a live event in advance.

1.  **Register Scheduled Live Event:**
    *   `POST /scheduledLiveEvents`
    *   Provide owner URN, start/end times, title, description, etc.
    *   Response includes the `scheduledLiveEventUrn`.
2.  **Retrieve Live Video Details:**
    *   Shortly before the scheduled start time, use the `scheduledLiveEventUrn` to get the associated `liveVideo URN` and RTMP details (ingest URL/stream key) via a `GET` request or by listening for webhook notifications.
    *   `GET /scheduledLiveEvents/{scheduledLiveEventUrn}`
3.  **Follow Basic Streaming Workflow:** Proceed with steps 2-6 from the Basic Streaming Workflow using the obtained RTMP details.

### 3. Audience Targeting (Company Pages)

When creating a live event (`POST /liveVideos`) or scheduled event (`POST /scheduledLiveEvents`) owned by an organization, you can specify target audiences.

*   **Targeting Criteria:** Use the `targetAudiences` field in the request body. Define criteria based on geography, industry, function, seniority, company size, etc.
*   **Content Access API:** Use endpoints like `GET /targetAudienceCriteria` to discover available targeting facets and values.

## External Tools Requirement

The LinkedIn Live API **does not handle the video encoding or transmission**. You must use external software or hardware:

*   **RTMP Encoder:** Software like OBS Studio, Wirecast, or hardware encoders are needed to capture, encode, and send the video stream to the LinkedIn RTMP ingest URL.
*   **Simulcasting Services:** Platforms like Restream or Castr can take a single stream and distribute it to LinkedIn Live and other platforms simultaneously.

## Summary

The LinkedIn Live API provides powerful tools for programmatic live streaming. Key steps involve registering an event (basic or scheduled), obtaining RTMP credentials, using an external encoder to send the stream, and managing the event lifecycle via API calls. Access approval and correct permissions are essential prerequisites.