
import { toast } from "sonner";
import { Avatar, VideoRequest, VideoResponse } from "@/types/avatar";
import { supabase } from "@/integrations/supabase/client";

// This service handles interactions with the HeyGen API through our Supabase Edge Function
class HeyGenService {
  // In a real application, this would be fetched from your backend
  private apiUrl = "https://jkvceqitkmzmcrdsoeha.supabase.co/functions/v1/heygen";
  
  // For demo purposes, we're hardcoding the avatars
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
        background: {
          type: "color",
          value: "#ffffff"
        },
        clips: [
          {
            avatar: {
              id: request.avatarId
            },
            voice: {
              id: request.voiceId
            },
            script: {
              type: "text",
              input: request.script
            }
          }
        ]
      };

      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('heygen', {
        body: payload
      });

      if (error) {
        console.error("Error from Edge Function:", error);
        toast.error("Failed to generate video. Please try again.");
        throw error;
      }

      console.log("Response from HeyGen API:", data);
      
      // Return the video ID from the HeyGen response
      return data.data.video_id || `video-${Date.now()}`;
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to generate video. Please try again.");
      throw error;
    }
  }

  async getVideoStatus(videoId: string): Promise<VideoResponse> {
    try {
      // In a real implementation, this would call the HeyGen API to check status
      console.log("Checking status for video:", videoId);
      
      // For demo purposes, simulate a delay and return a completed status
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        id: videoId,
        url: "https://storage.googleapis.com/heygen-demo-videos/sample_video.mp4",
        status: "completed",
        createdAt: new Date().toISOString()
      };
      
      // In a real implementation, you would make another API call:
      // const { data, error } = await supabase.functions.invoke('heygen-status', {
      //   body: { video_id: videoId }
      // });
      // return data;
    } catch (error) {
      console.error("Error checking video status:", error);
      toast.error("Failed to check video status");
      throw error;
    }
  }
}

export const heygenService = new HeygenService();
