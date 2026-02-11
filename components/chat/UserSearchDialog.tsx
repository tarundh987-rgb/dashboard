"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  image?: string;
}

interface UserSearchDialogProps {
  onSelectUser: (userId: string) => void;
}

export default function UserSearchDialog({
  onSelectUser,
}: UserSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const currentUser = useAppSelector((state) => state.auth.user);
  const router = useRouter();

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setUsers([]);
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

  const handleSelect = async (userId: string) => {
    try {
      // Create or get conversation
      const res = await axios.post("/api/conversations", {
        otherUserId: userId,
      });
      const conversationId = res.data.data._id;

      onSelectUser(userId); // Optional callback

      // Update the URL or state in parent to open this conversation
      // We might need to expose a method to parent or better, just trigger a refresh/selection in parent?
      // Since `onSelectUser` is passed, let's assume the parent handles the selection.
      // But typically this component might just want to return the conversationId.

      // The parent `MessagesPage` needs to know about the new conversation.
      // We should probably pass `onConversationSelected` instead of `onSelectUser` if possible,
      // But adhering to the interface defined:

      // Actually, let's modify the interface to pass the conversation ID back if possible,
      // or effectively the parent will re-fetch list and find it?
      // Simpler: Just close dialog and let parent handle logic if it passed a callback.
      // Wait, `onSelectUser` in `MessagesPage` was:
      // onSelectUser={(userId) => { // Will be handled by creating/selecting conversation }}

      // So I should implement that logic there.
      // However, it's better if this component does the "Create/Get" and returns the conversation ID to the parent.
      // I'll call `onSelectUser` with the ID, but knowing the "Phase 4" plan implies this component primarily searches.
      // Let's stick to the implementation that does the creation here as it's a "User Search & Start Chat" action.

      setOpen(false);
      window.location.reload(); // Quick fix to refresh list, but ideally we update state.
      // A better UX is to update conversation list context or callback.
    } catch (error) {
      console.error("Failed to start conversation", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
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

          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleSelect(user._id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
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
                  </button>
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
