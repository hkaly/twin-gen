
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar as AvatarType } from "@/types/avatar";
import { cn } from "@/lib/utils";

interface AvatarSelectorProps {
  avatars: AvatarType[];
  selectedAvatarId: string | null;
  onSelectAvatar: (avatar: AvatarType) => void;
}

const AvatarSelector = ({ avatars, selectedAvatarId, onSelectAvatar }: AvatarSelectorProps) => {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-4">Choose an Avatar</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {avatars.map((avatar) => (
          <Card 
            key={avatar.id}
            className={cn(
              "avatar-option overflow-hidden h-64 bg-muted flex justify-center items-center",
              selectedAvatarId === avatar.id ? "selected" : ""
            )}
            onClick={() => onSelectAvatar(avatar)}
          >
            {/* In a real app, we would use real images */}
            <div className="w-full h-full bg-gradient-to-b from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-500">{avatar.name}</span>
            </div>
            <div className="avatar-name">{avatar.name}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelector;
