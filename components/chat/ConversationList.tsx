"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSocket } from "@/components/SocketProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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
  const { socket, isConnected, onlineUsers } = useSocket();
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;

    fetchConversations();

    const handleConversationUpdated = () => {
      fetchConversations();
    };

    const handleNewConversation = (conversation: Conversation) => {
      setConversations((prev) => {
        if (prev.some((c) => c._id === conversation._id)) return prev;
        return [conversation, ...prev];
      });
    };

    socket.on("conversation_updated", handleConversationUpdated);
    socket.on("new_conversation", handleNewConversation);

    return () => {
      socket.off("conversation_updated", handleConversationUpdated);
      socket.off("new_conversation", handleNewConversation);
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
    <SidebarMenu className="mt-2">
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
        const isOnline =
          !isGroup && otherUser?._id && onlineUsers.has(otherUser._id);

        return (
          <SidebarMenuItem key={conversation._id}>
            <SidebarMenuButton
              asChild
              isActive={isSelected}
              onClick={() => onSelectConversation(conversation._id)}
              className="h-auto py-3 cursor-pointer"
            >
              <Link href={"/"}>
                <div className="relative">
                  <Avatar className="h-8 w-8 shrink-0 border border-border">
                    <AvatarImage
                      src={otherUser?.image || ""}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-accent/80 flex items-center justify-center text-xs font-semibold">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <span className="font-medium truncate block">
                    {name} {!isGroup && otherUser?.lastName}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
