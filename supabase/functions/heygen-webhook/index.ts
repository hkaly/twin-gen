
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

  // Only allow POST requests for webhooks
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const webhookData = await req.json();
    console.log("Received webhook from HeyGen:", JSON.stringify(webhookData));

    // Verify this is a completed video event
    if (webhookData.event_type === 'video.completed') {
      const videoId = webhookData.video_id;
      const videoUrl = webhookData.video_url;
      
      // Here you would typically update your database with the completed video information
      // For now, we'll just log it
      console.log(`Video ${videoId} completed. URL: ${videoUrl}`);
      
      // You could also insert this into a Supabase table to track videos
      // const { data, error } = await supabaseAdmin.from('videos').update({
      //   status: 'completed',
      //   url: videoUrl
      // }).eq('heygen_id', videoId);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      });
    }
    
    // Handle other webhook events like video.failed
    if (webhookData.event_type === 'video.failed') {
      console.error(`Video ${webhookData.video_id} failed to generate.`);
      // You could update your database to mark the video as failed
    }

    // Return a successful response for any webhook event
    return new Response(JSON.stringify({ received: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing HeyGen webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 500,
    });
  }
});
