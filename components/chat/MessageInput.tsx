"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
}

export default function MessageInput({
  onSendMessage,
  onTyping,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Handle typing indicator
    onTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        onTyping(false);
      }
      await onSendMessage(message);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background/60 backdrop-blur-xl border border-border/40 rounded-2xl p-2 shadow-sm transition-all duration-300 focus-within:shadow-md focus-within:bg-background/80">
      <div className="flex items-end gap-2">
        <Textarea
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[20px] max-h-[150px] resize-none border-0 focus-visible:ring-0 bg-transparent py-3 px-3 shadow-none text-sm placeholder:text-muted-foreground/70"
          disabled={isLoading}
          rows={1}
          style={{ height: "auto", minHeight: "44px" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
          }}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          size="icon"
          className="mb-1 h-9 w-9 shrink-0 rounded-xl transition-all duration-200"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}
