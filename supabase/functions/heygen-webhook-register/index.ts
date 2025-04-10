
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
    // Construct the webhook URL using the project ID
    const webhookUrl = "https://jkvceqitkmzmcrdsoeha.supabase.co/functions/v1/heygen-webhook";
    
    // Prepare the request to register the webhook with HeyGen
    const registerWebhookUrl = 'https://api.heygen.com/v1/webhook/endpoint.add';
    const webhookData = {
      url: webhookUrl,
      events: ["video.completed", "video.failed"] // Subscribe to these events
    };

    console.log("Registering webhook URL:", webhookUrl);
    console.log("With events:", webhookData.events);

    // Send the request to register the webhook
    const response = await fetch(registerWebhookUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(webhookData)
    });

    const data = await response.json();
    console.log("Response from HeyGen webhook registration:", JSON.stringify(data));
    
    if (!response.ok) {
      return new Response(JSON.stringify({
        error: data.error || "Error registering webhook with HeyGen API",
        status: response.status,
        details: data
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Webhook registered successfully with HeyGen",
      details: data
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error("Error registering webhook with HeyGen:", error);
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
