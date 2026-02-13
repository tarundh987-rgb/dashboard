"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSocket } from "@/components/SocketProvider";
import { useAppSelector } from "@/redux/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import MessageInput from "./MessageInput";
import { format } from "date-fns";

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    image?: string;
  };
  text: string;
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  _id: string;
  isGroup: boolean;
  name?: string;
  participants: any[];
}

interface ChatWindowProps {
  conversationId: string;
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected, onlineUsers } = useSocket();
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
    });
  }, [socket]);

  // Fetch messages when conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const [msgsRes, convRes] = await Promise.all([
          axios.get(`/api/conversations/${conversationId}/messages`),
          axios.get(`/api/conversations/${conversationId}`),
        ]);
        setMessages(msgsRes.data.data);
        setConversation(convRes.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      fetchMessages();
      if (socket && isConnected) {
        socket.emit("join_conversation", { conversationId });
      }
    }

    return () => {
      if (socket && isConnected) {
        socket.emit("leave_conversation", { conversationId });
      }
    };
  }, [conversationId, socket, isConnected]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (message: any) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });

      setTimeout(scrollToBottom, 100);
    };

    const handleUserTyping = ({
      userId,
      isTyping,
    }: {
      userId: string;
      isTyping: boolean;
    }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleUserTyping);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleUserTyping);
    };
  }, [socket, isConnected, conversationId]);

  // Scroll to bottom on load and new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSendMessage = async (text: string) => {
    try {
      // 1. Call API
      const res = await axios.post(
        `/api/conversations/${conversationId}/messages`,
        { text },
      );
      const newMessage = res.data.data;

      // 2. Update Local UI immediately
      setMessages((prev) => [...prev, newMessage]);
      setTimeout(scrollToBottom, 50);

      // 3. Emit to Socket for others
      if (socket && isConnected) {
        socket.emit("send_message", {
          conversationId,
          message: newMessage, // This has populated sender
        });
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (socket && isConnected) {
      socket.emit("typing", { conversationId, isTyping });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getConversationDetails = () => {
    if (!conversation) return { name: "Loading...", image: null };
    if (conversation.isGroup) {
      return {
        name: conversation.name,
        image: null,
        isGroup: true,
      };
    }
    const otherUser = conversation.participants.find(
      (p) => p._id !== currentUser?._id,
    );
    return {
      name: otherUser?.firstName || otherUser?.email || "Unknown User",
      image: otherUser?.image,
      firstName: otherUser?.firstName,
      email: otherUser?.email,
      isGroup: false,
    };
  };

  const details = getConversationDetails();
  const otherUser = conversation?.participants.find(
    (p) => p._id !== currentUser?._id,
  );
  const isOnline =
    !details.isGroup && otherUser?._id && onlineUsers.has(otherUser._id);

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <div className="border-b border-border bg-background/50 backdrop-blur-sm p-3 flex items-center gap-3 shadow-sm z-10">
        <div className="relative">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={details.image || ""} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {details.isGroup
                ? details.name?.[0]?.toUpperCase()
                : details.firstName?.[0] ||
                  details.email?.[0]?.toUpperCase() ||
                  "?"}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>
        <div className="flex flex-col">
          <h2 className="font-semibold text-sm leading-tight">
            {details.name}
          </h2>
          {details.isGroup ? (
            <span className="text-xs text-muted-foreground">
              {conversation?.participants.length} members
            </span>
          ) : (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <div
                className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
              />
              {isOnline ? "Online" : "Offline"}
            </span>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg, index) => {
            const isMe =
              msg.sender?._id === currentUser?._id ||
              msg.sender === currentUser?._id;
            return (
              <div
                key={msg._id}
                className={`flex gap-3 max-w-[80%] ${
                  isMe ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                {!isMe && (
                  <Avatar className="h-8 w-8 mt-1 border border-border">
                    <AvatarImage
                      src={
                        typeof msg.sender === "object" ? msg.sender.image : ""
                      }
                    />
                    <AvatarFallback>
                      {typeof msg.sender === "object" && msg.sender.firstName
                        ? msg.sender.firstName[0]
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-background border border-border rounded-tl-sm text-foreground"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1 opacity-70">
                    {format(new Date(msg.createdAt), "p")}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {typingUsers.size > 0 && (
        <div className="px-4 py-2 text-xs text-muted-foreground italic">
          Someone is typing...
        </div>
      )}

      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
}
