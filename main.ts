import { youtubeOAuth, linkedinOAuth } from "./oauth2.ts";

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

function main() {
  // This is a simple example of how to use the OAuth functions
  // In a real application, you would use these functions in a web server
  
  console.log("OAuth server running on http://localhost:8000");

  // Start the server using Deno.serve({ port: 8000 }, handleRequest);
}

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  
  try {
    // Route requests to the appropriate handler
    if (path === "/oauth2/youtube") {
      return await youtubeOAuth(request);
    } else if (path === "/oauth2/youtube/callback") {
      return await youtubeOAuth(request);
    } else if (path === "/oauth2/linkedin") {
      return await linkedinOAuth(request);
    } else if (path === "/oauth2/linkedin/callback") {
      return await linkedinOAuth(request);
    } else {
      // Serve a simple HTML page with links to the OAuth endpoints
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>OAuth 2.0 Demo</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              .button { display: inline-block; background: #4285f4; color: white; padding: 10px 20px;
                        text-decoration: none; border-radius: 4px; margin: 10px; }
              .button:hover { background: #3367d6; }
            </style>
          </head>
          <body>
            <h1>OAuth 2.0 Demo</h1>
            <p>Click the buttons below to authenticate with YouTube or LinkedIn:</p>
            <a href="/oauth2/youtube" class="button">Authenticate with YouTube</a>
            <a href="/oauth2/linkedin" class="button">Authenticate with LinkedIn</a>
          </body>
        </html>
      `, { headers: { "Content-Type": "text/html" } });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

main();