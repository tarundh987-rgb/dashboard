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
  isGroup?: boolean;
  name?: string;
  groupAdmin?: string;
}

interface ConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

import { useAppSelector } from "@/redux/hooks";
import Link from "next/link";

export default function ConversationList({
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
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
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    if (!currentUser) return conversation.participants[0];
    return (
      conversation.participants.find((p) => p._id !== currentUser._id) ||
      conversation.participants[0]
    );
  };

  return (
    <ScrollArea className="flex-1">
      <div className="divide-y">
        {conversations.map((conversation) => {
          const otherUser = getOtherParticipant(conversation);
          const isSelected = selectedConversationId === conversation._id;
          const isGroup = conversation.isGroup;
          const name = isGroup
            ? conversation.name
            : otherUser?.firstName || otherUser?.email || "Unknown";
          const avatarFallback = isGroup
            ? name?.[0]?.toUpperCase()
            : otherUser?.email?.[0]?.toUpperCase() || "?";

          return (
            <Link href={"/"} key={conversation._id}>
              <button
                onClick={() => onSelectConversation(conversation._id)}
                className={cn(
                  "w-full p-2 text-left hover:bg-accent/50 hover:text-accent-foreground cursor-pointer transition-colors rounded-lg",
                  isSelected && "bg-primary/70 text-primary-foreground",
                )}
              >
                <div className="flex items-start justify-center gap-3 ">
                  <Avatar className="h-6 w-6 shrink-0">
                    <div className="h-full w-full bg-accent/80 flex items-center justify-center text-sm font-semibold">
                      {avatarFallback}
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium truncate">
                      {name} {!isGroup && otherUser?.lastName}
                    </p>
                  </div>
                </div>
              </button>
            </Link>
          );
        })}
      </div>
    </ScrollArea>
  );
}
