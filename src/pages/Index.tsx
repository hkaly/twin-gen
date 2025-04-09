
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AvatarSelector from "@/components/AvatarSelector";
import ScriptInput from "@/components/ScriptInput";
import VideoPlayer from "@/components/VideoPlayer";
import { heygenService } from "@/services/heygenService";
import { Avatar, VideoResponse } from "@/types/avatar";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const Index = () => {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoResponse | null>(null);

  useEffect(() => {
    // Load avatars
    const availableAvatars = heygenService.getAvatars();
    setAvatars(availableAvatars);
  }, []);

  useEffect(() => {
    // Poll for video status when videoId changes
    const checkVideoStatus = async () => {
      if (!videoId) return;
      
      try {
        const status = await heygenService.getVideoStatus(videoId);
        setVideoData(status);
        
        if (status.status === "completed") {
          setIsGenerating(false);
          toast.success("Your video is ready to play!");
        } else if (status.status === "failed") {
          setIsGenerating(false);
          toast.error("Video generation failed. Please try again.");
        } else {
          // Continue polling
          setTimeout(checkVideoStatus, 2000);
        }
      } catch (error) {
        console.error("Error checking video status:", error);
        setIsGenerating(false);
      }
    };

    if (videoId && isGenerating) {
      checkVideoStatus();
    }
  }, [videoId]);

  const handleSelectAvatar = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
  };

  const handleGenerateVideo = async () => {
    if (!selectedAvatar) {
      toast.error("Please select an avatar first");
      return;
    }

    if (!script.trim()) {
      toast.error("Please enter a script for your avatar");
      return;
    }

    try {
      setIsGenerating(true);
      const id = await heygenService.generateVideo({
        avatarId: selectedAvatar.avatarId,
        voiceId: selectedAvatar.voiceId,
        script
      });
      
      setVideoId(id);
    } catch (error) {
      setIsGenerating(false);
      console.error("Error generating video:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-primary" />
            HeyGen Video Creator
          </h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-10">
          <AvatarSelector 
            avatars={avatars}
            selectedAvatarId={selectedAvatar?.id || null}
            onSelectAvatar={handleSelectAvatar}
          />
          
          <ScriptInput 
            value={script}
            onChange={setScript}
            disabled={isGenerating}
          />
          
          <div className="flex justify-center">
            <Button 
              onClick={handleGenerateVideo}
              disabled={isGenerating || !selectedAvatar || !script.trim()}
              className="generate-btn px-8 py-6 text-lg"
              size="lg"
            >
              {isGenerating ? "Generating..." : "Generate Video"}
            </Button>
          </div>
          
          <VideoPlayer 
            videoUrl={videoData?.url || null}
            isLoading={isGenerating}
          />
        </div>
      </main>
      
      <footer className="border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} HeyGen Video Creator - Built with React and Tailwind CSS
        </div>
      </footer>
    </div>
  );
};

export default Index;
