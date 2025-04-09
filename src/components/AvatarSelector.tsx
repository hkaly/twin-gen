
import { Card } from "@/components/ui/card";
import { Avatar as AvatarType } from "@/types/avatar";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AvatarSelectorProps {
  avatars: AvatarType[];
  selectedAvatarId: string | null;
  onSelectAvatar: (avatar: AvatarType) => void;
}

const AvatarSelector = ({ avatars, selectedAvatarId, onSelectAvatar }: AvatarSelectorProps) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-4">
        {avatars.map((avatar) => (
          <Card 
            key={avatar.id}
            className={cn(
              "avatar-option overflow-hidden cursor-pointer p-4 flex flex-col items-center justify-center",
              selectedAvatarId === avatar.id ? "ring-2 ring-primary" : ""
            )}
            onClick={() => onSelectAvatar(avatar)}
          >
            <Avatar className="h-16 w-16 mb-2">
              <AvatarImage src={avatar.image} alt={avatar.name} />
              <AvatarFallback>{avatar.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center font-medium">{avatar.name}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelector;
