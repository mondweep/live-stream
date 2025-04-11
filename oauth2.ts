/**
 * Manual OAuth 2.0 Authorization Code Flow Handlers
 */

// --- YouTube OAuth Handler ---

/**
 * YouTube OAuth request handler (Manual Flow)
 */
export async function youtubeOAuth(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    console.error("OAuth Error (YouTube):", url.searchParams.get("error_description") || error);
    return new Response(`OAuth Error: ${error}`, { status: 400 });
  }

  if (code) {
    // --- Step 2: Handle the callback from Google ---
    try {
      const tokenUri = "https://oauth2.googleapis.com/token";
      const clientId = Deno.env.get("YOUTUBE_CLIENT_ID") || "";
      const clientSecret = Deno.env.get("YOUTUBE_CLIENT_SECRET") || "";
      const redirectUri = Deno.env.get("YOUTUBE_REDIRECT_URI") || "";

      if (!clientId || !clientSecret || !redirectUri) {
         throw new Error("Missing YouTube OAuth environment variables");
      }

      // Prepare token exchange request body
      const tokenRequestBody = new URLSearchParams({
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });
      console.log("Sending YouTube Token Request Body:", tokenRequestBody.toString()); // Log request body

      // Exchange authorization code for tokens
      const response = await fetch(tokenUri, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tokenRequestBody,
      });

      // Log the full response for debugging
      const responseText = await response.text();
      console.log("YouTube Token Endpoint Response Status:", response.status);
      console.log("YouTube Token Endpoint Response Body:", responseText);

      if (!response.ok) {
        let errorBody;
        try {
          errorBody = JSON.parse(responseText);
        } catch (e) {
          errorBody = { error: "Failed to parse JSON error response", raw: responseText };
        }
        console.error("Token exchange failed (YouTube):", errorBody);
        throw new Error(`Token exchange failed: ${response.statusText} - ${errorBody.error_description || errorBody.error || 'Unknown error'}`);
      }

      const tokens = JSON.parse(responseText);

      // Extract tokens (names might vary slightly by provider)
      const accessToken = tokens.access_token;
      const refreshToken = tokens.refresh_token; // Google provides this on first auth with access_type=offline

      if (!accessToken) {
         console.error("Access Token not found in response (YouTube):", tokens);
         throw new Error("Access Token not found in response from Google");
      }
      // It's okay if refresh token is missing on subsequent calls
      
      // TODO: Securely store the accessToken and refreshToken associated with the user account
      // For this example, we store the access token in a session cookie
      console.log("YouTube Access Token obtained (first few chars):", accessToken.substring(0, 10));
      if (refreshToken) {
        console.log("YouTube Refresh Token obtained."); 
        // Store refreshToken securely (e.g., encrypted in database)
      } else {
        console.warn("YouTube Refresh Token not obtained. User might need to re-authenticate later.");
      }


      // Set cookie with access token (adjust cookie settings as needed)
      const headers = new Headers();
      headers.set(
        "Set-Cookie",
        `youtube_session=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600` // Example: 1 hour expiry
      );

      // Return plain text success message
      headers.set("Content-Type", "text/plain");
      return new Response("YouTube authentication successful! You can close this window.", {
        status: 200,
        headers,
      });

    } catch (err) {
      console.error("Error during YouTube token exchange:", err);
      return new Response(
        `Error during authentication: ${err instanceof Error ? err.message : String(err)}`,
        { status: 500 }
      );
    }
  } else {
    // --- Step 1: Redirect user to Google for authorization ---
    const youtubeAuthEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    const youtubeState = crypto.randomUUID();
    // TODO: Store youtubeState server-side (e.g., session or short-lived KV entry) associated with the user's session

    const params = new URLSearchParams({
      client_id: Deno.env.get("YOUTUBE_CLIENT_ID") || "",
      redirect_uri: Deno.env.get("YOUTUBE_REDIRECT_URI") || "",
      response_type: "code",
      scope: "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload",
      state: youtubeState,
      access_type: "offline", // Request refresh token
      // prompt: "consent" // Temporarily removed to simplify flow
    });

    const manualAuthUrl = `${youtubeAuthEndpoint}?${params.toString()}`;
    console.log("Redirecting to YouTube:", manualAuthUrl); 

    return new Response(null, {
      status: 302,
      headers: { Location: manualAuthUrl },
    });
  }
}

// --- LinkedIn OAuth Handler ---

/**
 * LinkedIn OAuth request handler (Manual Flow)
 */
export async function linkedinOAuth(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    console.error("OAuth Error (LinkedIn):", url.searchParams.get("error_description") || error);
    return new Response(`OAuth Error: ${error}`, { status: 400 });
  }

  if (code) {
    // --- Step 2: Handle the callback from LinkedIn ---
    try {
      const tokenUri = "https://www.linkedin.com/oauth/v2/accessToken";
      const clientId = Deno.env.get("LINKEDIN_CLIENT_ID") || "";
      const clientSecret = Deno.env.get("LINKEDIN_CLIENT_SECRET") || "";
      const redirectUri = Deno.env.get("LINKEDIN_REDIRECT_URI") || "";

      if (!clientId || !clientSecret || !redirectUri) {
         throw new Error("Missing LinkedIn OAuth environment variables");
      }

      // Prepare token exchange request body
      const tokenRequestBody = new URLSearchParams({
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });
      console.log("Sending LinkedIn Token Request Body:", tokenRequestBody.toString()); // Log request body

      // Exchange authorization code for tokens
      const response = await fetch(tokenUri, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tokenRequestBody,
      });

      // Log the full response for debugging
      const responseText = await response.text();
      console.log("LinkedIn Token Endpoint Response Status:", response.status);
      console.log("LinkedIn Token Endpoint Response Body:", responseText);

      if (!response.ok) {
        let errorBody;
        try {
          errorBody = JSON.parse(responseText);
        } catch (e) {
          errorBody = { error: "Failed to parse JSON error response", raw: responseText };
        }
        console.error("Token exchange failed (LinkedIn):", errorBody);
        throw new Error(`Token exchange failed: ${response.statusText} - ${errorBody.error_description || errorBody.error || 'Unknown error'}`);
      }

      const tokens = JSON.parse(responseText);

      // Extract tokens
      const accessToken = tokens.access_token;
      // LinkedIn might provide a refresh token depending on scope/settings, but often doesn't by default
      const refreshToken = tokens.refresh_token; 

      if (!accessToken) {
        console.error("Access Token not found in response (LinkedIn):", tokens);
        throw new Error("Access Token not found in response from LinkedIn");
      }

      // TODO: Securely store the accessToken and refreshToken (if available) associated with the user account
      console.log("LinkedIn Access Token obtained (first few chars):", accessToken.substring(0, 10));
      if (refreshToken) {
        console.log("LinkedIn Refresh Token obtained.");
        // Store refreshToken securely
      } else {
         console.warn("LinkedIn Refresh Token not obtained.");
      }

      // Set cookie with access token
      const headers = new Headers();
      headers.set(
        "Set-Cookie",
        `linkedin_session=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600` // Example: 1 hour expiry
      );

      // Return plain text success message
      headers.set("Content-Type", "text/plain");
      return new Response("LinkedIn authentication successful! You can close this window.", {
        status: 200,
        headers,
      });

    } catch (err) {
      console.error("Error during LinkedIn token exchange:", err);
      return new Response(
        `Error during authentication: ${err instanceof Error ? err.message : String(err)}`,
        { status: 500 }
      );
    }
  } else {
    // --- Step 1: Redirect user to LinkedIn for authorization ---
    const linkedinAuthEndpoint = "https://www.linkedin.com/oauth/v2/authorization";
    const linkedinState = crypto.randomUUID();
    // TODO: Store linkedinState server-side (e.g., session or short-lived KV entry) associated with the user's session

    const params = new URLSearchParams({
      client_id: Deno.env.get("LINKEDIN_CLIENT_ID") || "",
      redirect_uri: Deno.env.get("LINKEDIN_REDIRECT_URI") || "",
      response_type: "code",
      scope: "r_liteprofile w_member_social", // Ensure these scopes match your app's needs
      state: linkedinState
    });

    const manualAuthUrl = `${linkedinAuthEndpoint}?${params.toString()}`;
    console.log("Redirecting to LinkedIn:", manualAuthUrl); 

    return new Response(null, {
      status: 302,
      headers: { Location: manualAuthUrl },
    });
  }
}