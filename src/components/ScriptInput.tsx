
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ScriptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

const ScriptInput = ({ 
  value, 
  onChange, 
  disabled = false,
  maxLength = 1000
}: ScriptInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isAtLimit = characterCount === maxLength;

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-4">Enter Your Script</h2>
      <Card className="bg-white shadow-md">
        <CardContent className="pt-6">
          <Textarea
            placeholder="Enter the script for your avatar to speak..."
            className="min-h-32 resize-y"
            value={value}
            onChange={handleChange}
            disabled={disabled}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <span 
            className={`text-sm ${
              isAtLimit 
                ? "text-destructive font-semibold" 
                : isNearLimit 
                  ? "text-amber-500" 
                  : "text-muted-foreground"
            }`}
          >
            {characterCount}/{maxLength} characters
          </span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ScriptInput;
