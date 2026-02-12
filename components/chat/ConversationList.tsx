"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSocket } from "@/components/SocketProvider";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Conversation {
  _id: string;
  participants: any[];
  lastMessage?: {
    text: string;
    createdAt: string;
  };
  updatedAt: string;
}

interface ConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

import { useAppSelector } from "@/redux/hooks";

export default function ConversationList({
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocket();
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleConversationUpdated = () => {
      fetchConversations();
    };

    socket.on("conversation_updated", handleConversationUpdated);

    return () => {
      socket.off("conversation_updated", handleConversationUpdated);
    };
  }, [socket, isConnected]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get("/api/conversations");
      setConversations(res.data.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    if (!currentUser) return conversation.participants[0];
    return (
      conversation.participants.find((p) => p._id !== currentUser._id) ||
      conversation.participants[0]
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-muted-foreground">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center">
        <p className="text-muted-foreground text-sm">
          No conversations yet. Search for users to start chatting!
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="divide-y">
        {conversations.map((conversation) => {
          const otherUser = getOtherParticipant(conversation);
          const isSelected = selectedConversationId === conversation._id;

          return (
            <button
              key={conversation._id}
              onClick={() => onSelectConversation(conversation._id)}
              className={cn(
                "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                isSelected && "bg-muted",
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <div className="h-full w-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                    {otherUser?.email?.[0]?.toUpperCase() || "?"}
                  </div>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">
                      {otherUser?.firstName || otherUser?.email || "Unknown"}
                    </p>
                    {conversation.lastMessage && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(
                          conversation.lastMessage.createdAt,
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage.text}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
