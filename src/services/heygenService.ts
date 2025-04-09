
import { toast } from "sonner";
import { Avatar, VideoRequest, VideoResponse } from "@/types/avatar";

// This is a mock implementation that simulates API calls
// In a real implementation, you would replace these with actual API calls to HeyGen

class HeyGenService {
  // In a real application, this would be fetched from your backend
  private apiUrl = "https://api.heygen.com/v1";
  
  // For demo purposes, we're hardcoding the avatars
  private avatars: Avatar[] = [
    {
      id: "gala",
      name: "Gala",
      image: "/avatars/gala.jpg", // This would be a real image in production
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
      // In a real implementation, this would make an actual API call
      toast.info("Video generation started");
      console.log("Generating video with:", request);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Return a mock video ID
      return `video-${Date.now()}`;
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to generate video. Please try again.");
      throw error;
    }
  }

  async getVideoStatus(videoId: string): Promise<VideoResponse> {
    try {
      // In a real implementation, this would check the actual status
      console.log("Checking status for video:", videoId);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, always return completed after a delay
      return {
        id: videoId,
        url: "https://storage.googleapis.com/heygen-demo-videos/sample_video.mp4",
        status: "completed",
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error checking video status:", error);
      toast.error("Failed to check video status");
      throw error;
    }
  }
}

export const heygenService = new HeyGenService();
