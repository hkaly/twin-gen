
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

  const apiKey = Deno.env.get('heygen');
  const url = 'https://api.heygen.com/v2/video/generate';

  try {
    const requestBody = await req.json();
    console.log("Request to HeyGen API:", JSON.stringify(requestBody));
    
    // Ensure the request has proper dimension format if not already provided
    if (!requestBody.dimension) {
      requestBody.dimension = {
        width: 1280,
        height: 720
      };
    }
    
    // Add caption field if not already provided
    if (requestBody.caption === undefined) {
      requestBody.caption = false;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log("Response from HeyGen API:", JSON.stringify(data));

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: response.status
    });
  } catch (error) {
    console.error("Error calling HeyGen API:", error);
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
