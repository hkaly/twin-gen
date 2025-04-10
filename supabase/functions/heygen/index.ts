
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
    
    // Make sure video_inputs is properly formatted if text is passed
    if (requestBody.video_inputs === undefined && requestBody.text) {
      requestBody.video_inputs = [
        {
          text: requestBody.text
        }
      ];
      // Remove the original text property as it's now in video_inputs
      delete requestBody.text;
    }

    console.log("Using API key:", apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 5));

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
    
    if (!response.ok) {
      return new Response(JSON.stringify({
        error: data.error || "Error calling HeyGen API",
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
