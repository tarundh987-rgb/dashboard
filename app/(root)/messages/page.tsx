"use client";

import { useState } from "react";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import UserSearchDialog from "@/components/chat/UserSearchDialog";

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      <div className="w-full max-w-7xl mx-auto flex border rounded-lg overflow-hidden">
        {/* Conversation List */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Messages</h2>
            <UserSearchDialog
              onSelectUser={(userId: string) => {
                // Will be handled by creating/selecting conversation
              }}
            />
          </div>
          <ConversationList
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {selectedConversationId ? (
            <ChatWindow conversationId={selectedConversationId} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
