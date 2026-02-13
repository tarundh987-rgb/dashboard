"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSocket } from "@/components/SocketProvider";
import { useAppSelector } from "@/redux/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileText, Download } from "lucide-react";
import MessageInput from "./MessageInput";
import { format } from "date-fns";

interface Attachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

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
  attachments?: Attachment[];
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

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSendMessage = async (
    text: string,
    attachments?: Attachment[],
  ) => {
    try {
      const res = await axios.post(
        `/api/conversations/${conversationId}/messages`,
        { text, attachments },
      );
      const newMessage = res.data.data;

      setMessages((prev) => [...prev, newMessage]);
      setTimeout(scrollToBottom, 50);

      if (socket && isConnected) {
        socket.emit("send_message", {
          conversationId,
          message: newMessage,
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
    <div className="relative flex flex-col h-[calc(100vh-4rem)] w-full bg-transparent overflow-hidden">
      <div className="absolute top-2.5 left-4 right-4 z-20 border border-border/40 bg-background/60 backdrop-blur-md p-3 flex items-center gap-3 shadow-sm rounded-2xl transition-all duration-300 hover:bg-background/80 hover:shadow-md">
        <div className="relative">
          <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
            <AvatarImage src={details.image || ""} className="object-cover" />
            <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/5 text-primary font-medium">
              {details.isGroup
                ? details.name?.[0]?.toUpperCase()
                : details.firstName?.[0] ||
                  details.email?.[0]?.toUpperCase() ||
                  "?"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col">
          <h2 className="font-semibold text-sm leading-tight tracking-tight">
            {details.name}
          </h2>
          {details.isGroup ? (
            <span className="text-xs text-muted-foreground/80">
              {conversation?.participants.length} members
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/80 flex items-center gap-1.5">
              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  isOnline
                    ? "bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]"
                    : "bg-muted-foreground/40"
                }`}
              />
              {isOnline ? "Online" : "Offline"}
            </span>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 h-full w-full">
        <div className="flex flex-col gap-4 pt-24 pb-28 px-4 sm:px-6">
          {messages.map((msg, index) => {
            const isMe =
              msg.sender?._id === currentUser?._id ||
              msg.sender === currentUser?._id;
            const isPrevFromSame =
              index > 0 &&
              (messages[index - 1].sender?._id === msg.sender?._id ||
                messages[index - 1].sender === msg.sender);

            return (
              <div
                key={msg._id}
                className={`flex gap-3 max-w-[85%] md:max-w-[70%] group ${
                  isMe ? "ml-auto flex-row-reverse" : ""
                } ${!isPrevFromSame ? "mt-2" : "mt-0.5"}`}
              >
                {!isMe && !isPrevFromSame ? (
                  <Avatar className="h-8 w-8 mt-1 border border-border/40 shadow-sm shrink-0">
                    <AvatarImage
                      src={
                        typeof msg.sender === "object" ? msg.sender.image : ""
                      }
                      className="object-cover"
                    />
                    <AvatarFallback className="text-[10px] bg-muted">
                      {typeof msg.sender === "object" && msg.sender.firstName
                        ? msg.sender.firstName[0]
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                ) : !isMe ? (
                  <div className="w-8 shrink-0" />
                ) : null}

                <div
                  className={`flex flex-col ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`px-5 py-2.5 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm hover:brightness-110"
                        : "bg-card border border-border/50 text-card-foreground rounded-2xl rounded-tl-sm hover:bg-accent/50"
                    }`}
                  >
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-col gap-2 mb-2">
                        {msg.attachments.map((attachment, i) => (
                          <div
                            key={i}
                            className="rounded-lg overflow-hidden border border-border/20 bg-background/5"
                          >
                            {attachment.type.startsWith("image/") ? (
                              <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="max-w-full max-h-60 object-contain cursor-pointer transition-transform hover:scale-[1.02]"
                                onClick={() =>
                                  window.open(attachment.url, "_blank")
                                }
                              />
                            ) : attachment.type.startsWith("video/") ? (
                              <video
                                src={attachment.url}
                                controls
                                className="max-w-full max-h-60 rounded-md"
                              />
                            ) : (
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-background transition-colors text-secondary"
                              >
                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-medium truncate">
                                    {attachment.name}
                                  </span>
                                  <span className="text-[10px] opacity-70">
                                    {(attachment.size / 1024).toFixed(1)} KB
                                  </span>
                                </div>
                                <Download className="h-4 w-4 ml-auto opacity-0 group-hover/file:opacity-100 transition-opacity" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.text && (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] text-muted-foreground/60 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isMe ? "text-right" : "text-left"}`}
                  >
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
        <div className="absolute bottom-24 left-8 z-10 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/40 text-xs text-muted-foreground shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <span className="animate-pulse">Typing...</span>
        </div>
      )}

      <div className="absolute bottom-1.5 left-4 right-4 z-20">
        <MessageInput
          conversationId={conversationId}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
        />
      </div>
    </div>
  );
}
