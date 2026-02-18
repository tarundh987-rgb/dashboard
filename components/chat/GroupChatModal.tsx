"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2, X, Users as UsersIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  image?: string;
}

interface GroupChatModalProps {
  onSelectConversation: (conversationId: string) => void;
  children?: React.ReactNode;
  tooltip?: string;
}

export default function GroupChatModal({
  onSelectConversation,
  children,
  tooltip,
}: GroupChatModalProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`/api/users/search?q=${value}`);
      const filteredUsers = res.data.data.filter(
        (u: User) => !selectedUsers.some((selected) => selected._id === u._id),
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error searching users", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (user: User) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
      setUsers(users.filter((u) => u._id !== user._id));
      setQuery("");
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    if (selectedUsers.length < 2) return;

    setCreating(true);
    try {
      const res = await axios.post("/api/conversations", {
        isGroup: true,
        name: groupName,
        members: selectedUsers.map((u) => u._id),
      });

      const conversationId = res.data.data._id;
      onSelectConversation(conversationId);
      setOpen(false);

      setGroupName("");
      setSelectedUsers([]);
      setQuery("");
      setUsers([]);
    } catch (error) {
      console.error("Failed to create group", error);
    } finally {
      setCreating(false);
    }
  };

  const trigger = (
    <DialogTrigger asChild>
      {children ? (
        children
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer w-full justify-start mb-1 border-none"
        >
          <UsersIcon className="h-4 w-4" />
          <span>New Group Chat</span>
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
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              placeholder="e.g. Project Team"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Participants</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedUsers.map((user) => (
                <Badge
                  key={user._id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {user.firstName}
                  <button
                    onClick={() => handleRemoveUser(user._id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="h-40 border rounded-md p-2">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-1">
                {users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => toggleUser(user)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Avatar className="h-8 w-8">
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
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                No users found.
              </p>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                {selectedUsers.length > 0
                  ? "Add more users..."
                  : "Search to add users"}
              </p>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.length < 2 || creating}
            className="w-full"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
