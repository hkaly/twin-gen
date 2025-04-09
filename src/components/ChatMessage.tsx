
import { cn } from "@/lib/utils";
import VideoPlayer from "@/components/VideoPlayer";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  videoUrl?: string;
}

const ChatMessage = ({ message, isUser, videoUrl }: ChatMessageProps) => {
  // Always make messages with videos appear as user messages (blue bubble, right-aligned)
  const isUserStyled = videoUrl ? true : isUser;
  
  return (
    <div className={cn("flex", isUserStyled ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl p-4",
          isUserStyled
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-200 text-gray-900 rounded-bl-none"
        )}
      >
        <p>{message}</p>
        {videoUrl && (
          <div className="mt-2">
            <VideoPlayer videoUrl={videoUrl} isLoading={false} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
