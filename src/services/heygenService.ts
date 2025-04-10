import { toast } from "sonner";
import { Avatar, VideoRequest, VideoResponse } from "@/types/avatar";
import { supabase } from "@/integrations/supabase/client";

// This service handles interactions with the HeyGen API through our Supabase Edge Function
class HeyGenService {
  // In a real application, this would be fetched from your backend
  private apiUrl = "https://jkvceqitkmzmcrdsoeha.supabase.co/functions/v1/heygen";
  private statusUrl = "https://api.heygen.com/v1/video_status";
  private pollInterval = 5000; // 5 seconds
  
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
      
      // Prepare the payload for the HeyGen API according to their format
      const payload = {
        caption: false,
        dimension: {
          width: 1280,
          height: 720
        },
        background: {
          type: "color",
          value: "#ffffff"
        },
        video_inputs: [
          {
            text: request.script
          }
        ],
        clips: [
          {
            avatar: {
              id: request.avatarId
            },
            voice: {
              id: request.voiceId
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

      if (data.error) {
        console.error("Error from HeyGen API:", data.error);
        const errorMessage = data.error.message || "Failed to generate video";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      console.log("Response from HeyGen API:", data);
      
      // Return the video ID from the HeyGen response
      return data.data?.video_id || `video-${Date.now()}`;
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to generate video. Please check your HeyGen API key.");
      throw error;
    }
  }

  async getVideoStatus(videoId: string): Promise<VideoResponse> {
    try {
      console.log("Checking status for video:", videoId);
      
      // Call our Supabase Edge Function to check status
      const { data, error } = await supabase.functions.invoke('heygen-status', {
        body: { video_id: videoId }
      });

      if (error) {
        console.error("Error checking video status:", error);
        throw error;
      }

      // If we don't have a real implementation yet, use mock data
      if (!data || process.env.NODE_ENV === 'development') {
        // For demo purposes, simulate a delay and return a completed status
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
          id: videoId,
          url: "https://storage.googleapis.com/heygen-demo-videos/sample_video.mp4",
          status: "completed",
          createdAt: new Date().toISOString()
        };
      }
      
      return {
        id: videoId,
        url: data.video_url || null,
        status: data.status || "processing",
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error checking video status:", error);
      toast.error("Failed to check video status");
      throw error;
    }
  }

  // Poll for video status until it's completed or fails
  async pollVideoStatus(videoId: string, 
    onUpdate: (status: VideoResponse) => void, 
    maxAttempts = 60): Promise<VideoResponse | null> {
    
    let attempts = 0;
    
    const poll = async (): Promise<VideoResponse | null> => {
      if (attempts >= maxAttempts) {
        toast.error("Video generation timed out. Please try again.");
        return null;
      }
      
      try {
        const status = await this.getVideoStatus(videoId);
        onUpdate(status);
        
        if (status.status === "completed") {
          toast.success("Video generation completed!");
          return status;
        } else if (status.status === "failed") {
          toast.error("Video generation failed. Please try again.");
          return status;
        } else {
          // Continue polling
          attempts++;
          await new Promise(resolve => setTimeout(resolve, this.pollInterval));
          return poll();
        }
      } catch (error) {
        console.error("Error polling video status:", error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, this.pollInterval));
        return poll();
      }
    };
    
    return poll();
  }
}

export const heygenService = new HeyGenService();
