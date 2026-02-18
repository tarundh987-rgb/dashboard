"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Loader2,
  UserPlus,
  MessageCircle,
  Clock,
  Check,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useSocket } from "@/components/SocketProvider";

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  image?: string;
  inviteStatus?: string;
  invitationId?: string;
}

interface UserSearchDialogProps {
  onSelectUser: (conversationId: string) => void;
  children?: React.ReactNode;
  tooltip?: string;
}

export default function UserSearchDialog({
  onSelectUser,
  children,
  tooltip,
}: UserSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (open) {
      handleSearch("");
    } else {
      setQuery("");
      setUsers([]);
    }
  }, [open]);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.trim().length > 0 && value.trim().length < 2) {
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`/api/users/search?q=${value}`);
      setUsers(res.data.data);
    } catch (error) {
      console.error("Error searching users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await axios.post("/api/conversations", {
        otherUserId: userId,
      });
      const conversationId = res.data.data._id;

      if (socket) {
        socket.emit("conversation_created", {
          conversation: res.data.data,
          otherUserId: userId,
        });
      }

      onSelectUser(conversationId);
      setOpen(false);
    } catch (error) {
      console.error("Failed to start conversation", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendInvite = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await axios.post("/api/invitations", {
        receiverId: userId,
      });

      if (socket) {
        socket.emit("send_invite", {
          receiverId: userId,
          invitation: res.data.data,
        });
      }

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, inviteStatus: "pending_sent" }
            : user,
        ),
      );
    } catch (error: any) {
      console.error("Failed to send invitation", error);
      alert(error.response?.data?.message || "Failed to send invitation");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptInvite = async (userId: string, invitationId?: string) => {
    if (!invitationId) return;

    setActionLoading(userId);
    try {
      const res = await axios.post(`/api/invitations/${invitationId}/accept`);

      if (socket) {
        socket.emit("accept_invite", {
          senderId: userId,
          invitation: res.data.data,
        });
      }

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, inviteStatus: "connected" } : user,
        ),
      );
    } catch (error) {
      console.error("Failed to accept invitation", error);
    } finally {
      setActionLoading(null);
    }
  };

  const renderActionButton = (user: User) => {
    const isLoading = actionLoading === user._id;

    switch (user.inviteStatus) {
      case "connected":
        return (
          <Button
            size="sm"
            onClick={() => handleStartChat(user._id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat
              </>
            )}
          </Button>
        );

      case "pending_sent":
        return (
          <Button size="sm" variant="secondary" disabled>
            <Clock className="h-4 w-4 mr-1" />
            Pending
          </Button>
        );

      case "pending_received":
        return (
          <Button
            size="sm"
            variant="default"
            onClick={() => handleAcceptInvite(user._id, user.invitationId)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                Accept
              </>
            )}
          </Button>
        );

      default:
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSendInvite(user._id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-1" />
                Invite
              </>
            )}
          </Button>
        );
    }
  };

  const trigger = (
    <DialogTrigger asChild>
      {children ? (
        children
      ) : (
        <Button size="sm" variant="secondary" className="cursor-pointer">
          <Search className="h-4 w-4" />
        </Button>
      )}
    </DialogTrigger>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search Users</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <ScrollArea className="h-75">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-1">
                {query.length === 0 && (
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-2">
                    Suggested Users
                  </p>
                )}
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="w-full flex items-center gap-3 p-2 rounded-lg border bg-card"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image} />
                      <AvatarFallback>
                        {user.firstName ? user.firstName[0] : user.email[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    {renderActionButton(user)}
                  </div>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                No users found.
              </p>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                Type to search users...
              </p>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
