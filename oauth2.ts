import { OAuth2Client } from "https://deno.land/x/oauth2_client@v0.2.1/mod.ts";

// Create the OAuth2 clients for YouTube and LinkedIn
const youtubeOAuth2Client = new OAuth2Client({
  clientId: Deno.env.get("YOUTUBE_CLIENT_ID") || "",
  clientSecret: Deno.env.get("YOUTUBE_CLIENT_SECRET") || "",
  authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUri: "https://oauth2.googleapis.com/token",
  redirectUri: Deno.env.get("YOUTUBE_REDIRECT_URI") || "",
  defaults: {
    scope: "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload",
  },
});

const linkedinOAuth2Client = new OAuth2Client({
  clientId: Deno.env.get("LINKEDIN_CLIENT_ID") || "",
  clientSecret: Deno.env.get("LINKEDIN_CLIENT_SECRET") || "",
  authorizationEndpointUri: "https://www.linkedin.com/oauth/v2/authorization",
  tokenUri: "https://www.linkedin.com/oauth/v2/accessToken",
  redirectUri: Deno.env.get("LINKEDIN_REDIRECT_URI") || "",
  defaults: {
    scope: "r_liteprofile w_member_social",
  },
});

/**
 * Get tokens from authorization code
 */
async function getTokens(client: OAuth2Client, code: string): Promise<{ accessToken: string } | null> {
  try {
    const tokens = await client.code.getToken(code);
    console.log("Tokens:", tokens);
    
    const accessToken = tokens.accessToken;
    if (!accessToken) {
      console.log("Access token is null");
      return null;
    }

    return {
      accessToken: accessToken,
    };
  } catch (error: unknown) {
    console.error("Error during token exchange:", error);
    return null;
  }
}

/**
 * Process YouTube OAuth callback code
 */
export async function youtubeOAuthCallback(code: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const tokens = await youtubeOAuth2Client.code.getToken(code);
    
    const accessToken = tokens.accessToken;
    const refreshToken = tokens.refreshToken;

    if (!accessToken || !refreshToken) {
      console.log("Access token or refresh token is null");
      return null;
    }

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  } catch (error: unknown) {
    console.error("Error during token exchange:", error);
    return null;
  }
}

/**
 * Process LinkedIn OAuth callback code
 */
export async function linkedinOAuthCallback(code: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const tokens = await linkedinOAuth2Client.code.getToken(code);
    
    const accessToken = tokens.accessToken;
    const refreshToken = tokens.refreshToken;

    if (!accessToken || !refreshToken) {
      console.log("Access token or refresh token is null");
      return null;
    }

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  } catch (error: unknown) {
    console.error("Error during token exchange:", error);
    return null;
  }
}

/**
 * Refresh YouTube access token
 */
export async function refreshYoutubeToken(refreshToken: string): Promise<{ accessToken: string } | null> {
  try {
    const tokens = await youtubeOAuth2Client.refreshToken.refresh(refreshToken);
    
    const accessToken = tokens.accessToken;
    if (!accessToken) {
      console.error("Error refreshing YouTube token: Access token is null");
      return null;
    }

    return { accessToken: accessToken };
  } catch (error: unknown) {
    console.error("Error refreshing YouTube token:", error);
    return null;
  }
}

/**
 * Refresh LinkedIn access token
 */
export async function refreshLinkedinToken(refreshToken: string): Promise<{ accessToken: string } | null> {
  try {
    const tokens = await linkedinOAuth2Client.refreshToken.refresh(refreshToken);
    
    const accessToken = tokens.accessToken;
    if (!accessToken) {
      console.error("Error refreshing LinkedIn token: Access token is null");
      return null;
    }

    return { accessToken: accessToken };
  } catch (error: unknown) {
    console.error("Error refreshing LinkedIn token:", error);
    return null;
  }
}

/**
 * YouTube OAuth request handler
 */
export async function youtubeOAuth(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  
  if (code) {
    // This is the callback with the code
    try {
      const tokens = await youtubeOAuthCallback(code);
      if (!tokens) {
        return new Response("Failed to get tokens from code", { status: 400 });
      }
      
      // Set cookie with access token
      const headers = new Headers();
      headers.set("Set-Cookie", `youtube_session=${tokens.accessToken}; Path=/; HttpOnly; SameSite=Lax`);
      
      return new Response("YouTube authentication successful! You can close this window.", { 
        status: 200,
        headers
      });
    } catch (error) {
      return new Response(`Error during authentication: ${error instanceof Error ? error.message : String(error)}`, { 
        status: 500 
      });
    }
  } else {
    // This is the initial auth request, redirect to YouTube
    const authUrl = youtubeOAuth2Client.code.getAuthorizationUri();
    return new Response(null, {
      status: 302,
      headers: { Location: authUrl.toString() }
    });
  }
}

/**
 * LinkedIn OAuth request handler
 */
export async function linkedinOAuth(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  
  if (code) {
    // This is the callback with the code
    try {
      const tokens = await linkedinOAuthCallback(code);
      if (!tokens) {
        return new Response("Failed to get tokens from code", { status: 400 });
      }
      
      // Set cookie with access token
      const headers = new Headers();
      headers.set("Set-Cookie", `linkedin_session=${tokens.accessToken}; Path=/; HttpOnly; SameSite=Lax`);
      
      return new Response("LinkedIn authentication successful! You can close this window.", { 
        status: 200,
        headers
      });
    } catch (error) {
      return new Response(`Error during authentication: ${error instanceof Error ? error.message : String(error)}`, { 
        status: 500 
      });
    }
  } else {
    // This is the initial auth request, redirect to LinkedIn
    const authUrl = linkedinOAuth2Client.code.getAuthorizationUri();
    return new Response(null, {
      status: 302,
      headers: { Location: authUrl.toString() }
    });
  }
}