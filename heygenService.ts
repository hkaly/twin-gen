import { toast } from "sonner";
import { Avatar, VideoRequest, VideoResponse } from "@/types/avatar";
import setMessages from "@/pages/Index";

// This service handles interactions with the HeyGen API
class HeyGenService {
  private apiUrl = "https://api.heygen.com/v2/video/generate";
  private pollInterval = 5000; // 5 seconds

  // Hardcoded avatars for demo purposes
  private avatars: Avatar[] = [
    {
      id: "gala",
      name: "Gala",
      image: "/avatars/gala.jpg",
      voiceId: "35b75145af9041b298c720f23375f578",
      avatarId: "Gala_sitting_casualsofawithipad_front"
    },
    {
      id: "conrad",
      name: "Conrad",
      image: "/avatars/conrad.jpg",
      voiceId: "5403a745860347beb7d342e07eef33fb",
      avatarId: "Conrad_sitting_sofa_front"
    },
    {
      id: "jocelyn",
      name: "Jocelyn",
      image: "/avatars/jocelyn.jpg",
      voiceId: "7194df66c861492fb6cc379e99905e22",
      avatarId: "Jocelyn_sitting_sofa_front"
    }
  ];

  getAvatars(): Avatar[] {
    return this.avatars;
  }

  async generateVideo(request: VideoRequest): Promise<string> {
    try {
      toast.info("Video generation started");
      console.log("Generating video with:", request);
      
      // Prepare the payload for the HeyGen API
      const payload = {
        caption: false,
        dimension: {
          width: 1280,
          height: 720
        },
        video_inputs: [
          {
            character: {
              type: "avatar",
              scale: 1,
              avatar_style: "normal",
              avatar_id: request.avatarId,
            },
            voice: {
              voice_id: request.voiceId,
              input_text: request.script,
              type: "text",
            },
          },
        ],
      };

      // Call the HeyGen API directly
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "x-api-key": import.meta.env.VITE_HEYGEN_API_KEY || "",
        },
        body: JSON.stringify(payload),
      });

      // Log the response from the HeyGen API
      const responseData = await response.json();
      console.log("Response from HeyGen API:", responseData);

      if (!response.ok) {
        console.error("Error from HeyGen API:", responseData);
        toast.error("Failed to generate video. Please try again.");
        throw new Error(responseData.message || "Failed to generate video");
      }

      // Return the video ID from the HeyGen response
      const videoId = responseData.data?.video_id || `video-${Date.now()}`;
      await this.registerWebhook(videoId);
      return videoId;
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to generate video. Please check your HeyGen API key.");
      throw error;
    }
  }

  async registerWebhook(videoId: string): Promise<void> {
    try {
      const payload = {
        entity_id: videoId,
        url: "https://jkvceqitkmzmcrdsoeha.supabase.co/functions/v1/welcome-function",
        events: ["avatar_video.success"],
      };

      const response = await fetch("https://api.heygen.com/v1/webhook/endpoint.add", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "x-api-key": import.meta.env.VITE_HEYGEN_API_KEY || "",
        },
        body: JSON.stringify(payload),
      });

      // Log the response from the HeyGen API
      const responseData = await response.json();

      if (!response.ok) {
        console.error("Error from HeyGen API:", responseData);
        throw new Error(responseData.message || "Failed to register webhook");
      }

      console.log("Webhook registration payload:", payload);
      console.log("Webhook registration response:", responseData);
    } catch (error) {
      console.error("Error registering webhook:", error);
      throw error;
    }
  }

  async getVideoStatus(videoId: string): Promise<VideoResponse> {
    try {
      
       return fetch(`https://api.heygen.com/v1/video_status.get?video_id=`+videoId , {
        method: "GET",
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "x-api-key": import.meta.env.VITE_HEYGEN_API_KEY || "",
        }
      })
      .then(response => {
        return response.json();
      })
      .then(data => {
        const responseData = data;
        console.log(responseData.data.video_url);
        if (responseData.data.video_url != null){
          return responseData.data;
        } else {
          console.log("Output HeyGen API:", responseData);
        }
      })
      

    } catch (error) {
      console.error("Error getting video status:", error);
      throw error;
    }
  }
}

export const heygenService = new HeyGenService();