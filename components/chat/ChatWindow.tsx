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

interface ChatWindowProps {
  conversationId: string;
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useSocket();
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
        const res = await axios.get(
          `/api/conversations/${conversationId}/messages`,
        );
        setMessages(res.data.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      fetchMessages();
      // Join the conversation room if socket is connected
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

  // Handle real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (message: any) => {
      // If the message is for this conversation, add it
      // The sender is just an ID in the real-time payload often, or populated.
      // My server sends: { ...message, sender: socket.userId }
      // The API returns populated sender.
      // For optimisic UI or simple handling, I might need to fetch user details or structure the payload better on server.
      // Let's assume the server payload needs to be normalized or we just re-fetch/append.
      // Re-fetching is safer for data consistency but slower.
      // Unpopulated sender might break rendering if I expect object.
      // Let's rely on re-fetching or better, let's update server to send populated data if possible, or simple client updat.

      // Actually, for now, let's append. If sender is just ID, I'll need to handle it.
      // But wait, the messages from API have populated sender.
      // The server.js sends `...message, sender: socket.userId`.
      // The `message` object in server.js comes from `data.message` in `send_message` event.
      // The client `handleSendMessage` sends the message to API (which returns populated message)
      // AND maybe it emits to socket?
      // Wtih the current server.js logic:
      // `socket.on("send_message"... io.to... emit("new_message")`
      // Validation: The API `POST /messages` creates the message.
      // WE SHOULD sending message via API, then the API could emit via socket (if using a shared redis/socket instance)
      // OR the client sends API request, gets response, THEN emits to socket to notify others.
      // OR the client just rely on the API response to update local UI, and socket is for *incoming* messages from others.

      // Let's see my plan: "Send message (API fallback)".
      // Usually: Client calls API. API saves to DB.
      // Real-time:
      // Option A: API pushes to Socket.IO (needs standard way to access io instance from API routes - tricky in Next.js serverless/edge without custom server setup passed around or external bus like Redis pub/sub).
      // Option B: Client calls API, then Client emits "sent_message" to Socket, which broadcasts "new_message".

      // I will implement Option B for simplicity with the custom server setup I have.
      // Check server.js: `socket.on("send_message", ...)` broadcasts.

      // So Flow:
      // 1. User types, hits send.
      // 2. Client calls POST API -> Gets saved Message object (populated).
      // 3. Client updates local UI (append message).
      // 4. Client emits "send_message" to socket with the SAVED message object.
      // 5. Server broadcasts "new_message" to others.
      // 6. Other clients receive "new_message" and append.

      // Wait, "new_message" event in server.js:
      // `socket.on("send_message", async (data) => { ... io.to(...).emit("new_message", { ...message, sender: socket.userId }) })`
      // If I pass the fully populated message from client to `send_message`, I should respect that.
      // Let's look at server.js again.

      /* 
        socket.on("send_message", async (data) => {
          const { conversationId, message } = data;
          io.to(`conversation:${conversationId}`).emit("new_message", {
            ...message,
            sender: socket.userId, // This overrides sender with just ID if I'm not careful, or maybe that's intended?
          });
        });
        */

      // If I pass a populated message as `data.message`, `...message` spreads it. `sender: socket.userId` overwrites the `sender` field with just the ID string.
      // This is problematic if UI expects `sender` to be an object.
      // I should update server.js or handle it in client.
      // Easier to fix in server.js to NOT overwrite if not needed, or client handles "sender is string".
      // Or better, client sends API response which has populated sender, and server just broadcasts it.
      // I'll adjust `handleNewMessage` to handle both.

      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m._id === message._id)) return prev;
        // If sender is string (ID), we might have issues rendering name.
        // But for "incoming" messages, they usually come from *other* users.
        // We might need to fetch the message or user info if missing.
        // For now, let's assume valid data or fallback.
        // API GET: `.sort({ createdAt: -1 }) ... .reverse()` -> so API returns Oldest -> Newest.
        // So I should append to end.
        return [...prev, message];
      });

      // Scroll to bottom
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

  return (
    <div className="flex flex-col h-full bg-muted/20">
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
                  <Avatar className="h-8 w-8">
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
                    className={`p-3 rounded-lg text-sm ${
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-white dark:bg-zinc-800 border shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {format(new Date(msg.createdAt), "p")}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <div className="px-4 py-2 text-xs text-muted-foreground italic">
          Someone is typing...
        </div>
      )}

      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
}
