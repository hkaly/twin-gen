
import { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Video, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  videoUrl: string | null;
  isLoading: boolean;
}

const VideoPlayer = ({ videoUrl, isLoading }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = `heygen-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-4">Your Generated Video</h2>
      <Card className="overflow-hidden bg-gray-900 rounded-lg shadow-lg">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-80 bg-gray-900 text-white">
            <RefreshCw className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg font-medium">Generating your video...</p>
            <p className="text-sm text-gray-400 mt-2">This may take a minute</p>
          </div>
        ) : videoUrl ? (
          <div className="relative">
            <video 
              ref={videoRef}
              controls
              className="w-full"
              poster="/placeholder.svg"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute bottom-4 right-4">
              <Button 
                variant="secondary" 
                size="icon"
                onClick={handleDownload}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/40"
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 bg-gray-800 text-white">
            <Video className="w-12 h-12 mb-4 text-gray-500" />
            <p className="text-lg font-medium">No video generated yet</p>
            <p className="text-sm text-gray-400 mt-2">Select an avatar and enter a script to get started</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VideoPlayer;
