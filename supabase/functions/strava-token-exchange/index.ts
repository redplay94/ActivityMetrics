import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const STRAVA_CLIENT_ID = "213926";
const STRAVA_CLIENT_SECRET = "d1c48fc41d632c0f22c5b6708c25e0db86ecb285";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { code, redirect_uri } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: "Missing code parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Exchange the authorization code for tokens with Strava
    const tokenResp = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResp.json();

    if (!tokenResp.ok) {
      console.error("Strava token error:", tokenData);
      return new Response(
        JSON.stringify({ error: "Strava token exchange failed", details: tokenData }),
        {
          status: tokenResp.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // tokenData contains: access_token, refresh_token, expires_at, athlete { id, firstname, ... }
    return new Response(JSON.stringify(tokenData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
