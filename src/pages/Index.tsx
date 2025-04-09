
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Send } from "lucide-react";
import AvatarSelector from "@/components/AvatarSelector";
import VideoPlayer from "@/components/VideoPlayer";
import { heygenService } from "@/services/heygenService";
import { Avatar as AvatarType, VideoResponse } from "@/types/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ChatMessage from "@/components/ChatMessage";

const Index = () => {
  const [avatars, setAvatars] = useState<AvatarType[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType | null>(null);
  const [messages, setMessages] = useState<Array<{text: string; isUser: boolean; videoUrl?: string}>>([
    { text: "Hey, how's it going?", isUser: false },
    { text: "Just finished a meeting. What's up?", isUser: true },
    { text: "Want to grab lunch later?", isUser: false },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoResponse | null>(null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load avatars
    const availableAvatars = heygenService.getAvatars();
    setAvatars(availableAvatars);
  }, []);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Poll for video status when videoId changes
    const checkVideoStatus = async () => {
      if (!videoId) return;
      
      try {
        const status = await heygenService.getVideoStatus(videoId);
        setVideoData(status);
        
        if (status.status === "completed") {
          setIsGenerating(false);
          toast.success("Video response ready!");
          
          // Add the AI response with video URL to messages
          setMessages(prev => [...prev, {
            text: currentMessage,
            isUser: false,
            videoUrl: status.url
          }]);
          
          setShowAvatarSelector(false);
          setSelectedAvatar(null);
          setCurrentMessage("");
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
  }, [videoId, currentMessage]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMessage.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { text: currentMessage, isUser: true }]);
    
    // Show avatar selector
    setShowAvatarSelector(true);
  };

  const handleSelectAvatar = (avatar: AvatarType) => {
    setSelectedAvatar(avatar);
    handleGenerateVideo(avatar);
  };

  const handleGenerateVideo = async (avatar: AvatarType) => {
    try {
      setIsGenerating(true);
      const id = await heygenService.generateVideo({
        avatarId: avatar.avatarId,
        voiceId: avatar.voiceId,
        script: currentMessage
      });
      
      setVideoId(id);
      toast.info("Generating video response...");
    } catch (error) {
      setIsGenerating(false);
      toast.error("Error generating video");
      console.error("Error generating video:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-3xl font-bold">Messaging Demo</h1>
      </header>
      
      <main className="flex-1 overflow-hidden flex flex-col p-4">
        <div className="flex-1 overflow-y-auto pb-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage 
              key={index}
              message={message.text}
              isUser={message.isUser}
              videoUrl={message.videoUrl}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {showAvatarSelector && !isGenerating && !videoData && (
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-2">Choose an avatar to respond:</h2>
            <AvatarSelector 
              avatars={avatars}
              selectedAvatarId={selectedAvatar?.id || null}
              onSelectAvatar={handleSelectAvatar}
            />
          </div>
        )}
        
        {isGenerating && (
          <Card className="p-4 mb-4 text-center">
            <p className="text-gray-600">Generating video response...</p>
          </Card>
        )}
        
        <form onSubmit={handleSendMessage} className="mt-auto relative">
          <div className="relative flex items-center">
            <Input
              className="pr-12 py-6 text-base"
              placeholder="Type a message..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              disabled={isGenerating || showAvatarSelector}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-1 h-10 w-10 rounded-full"
              disabled={!currentMessage.trim() || isGenerating || showAvatarSelector}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Index;
