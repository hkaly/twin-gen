
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Get the API key from environment variables
  const apiKey = Deno.env.get('heygen');
  
  if (!apiKey) {
    console.error("API key 'heygen' not found in environment variables");
    return new Response(
      JSON.stringify({
        error: "API key not configured. Please set the 'heygen' secret in your Supabase project."
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
  
  try {
    const requestBody = await req.json();
    const videoId = requestBody.video_id;
    
    if (!videoId) {
      return new Response(JSON.stringify({
        error: "Missing video_id parameter"
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    
    console.log("Checking status for video:", videoId);
    
    const url = `https://api.heygen.com/v1/video_status?video_id=${videoId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'x-api-key': apiKey
      }
    });

    const data = await response.json();
    console.log("Response from HeyGen status API:", JSON.stringify(data));
    
    if (!response.ok) {
      return new Response(JSON.stringify({
        error: data.error || "Error checking video status",
        status: response.status,
        statusText: response.statusText
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error("Error checking video status:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
