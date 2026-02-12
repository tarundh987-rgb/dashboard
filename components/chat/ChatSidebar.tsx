"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Settings } from "lucide-react";
import Link from "next/link";
import ConversationList from "@/components/chat/ConversationList";
import UserSearchDialog from "@/components/chat/UserSearchDialog";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { selectConversation } from "@/redux/features/chat/chatSlice";
import GroupChatModal from "./GroupChatModal";

export function ChatSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const dispatch = useDispatch();
  const selectedConversationId = useSelector(
    (state: RootState) => state.chat.selectedConversationId,
  );

  const handleSelectConversation = (id: string) => {
    dispatch(selectConversation(id));
  };

  return (
    <Sidebar
      variant="inset"
      className="mt-15 h-[calc(100vh-4rem)] border-r border-border bg-sidebar/50 backdrop-blur-md"
      {...props}
    >
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between pb-3 border-b border-sidebar-border/50">
            <SidebarGroupLabel className="text-sm font-semibold text-sidebar-foreground uppercase tracking-wider">
              Messages
            </SidebarGroupLabel>
            <div className="flex items-center gap-1">
              <GroupChatModal
                onSelectConversation={(conversationId: string) => {
                  dispatch(selectConversation(conversationId));
                }}
              />
              <UserSearchDialog
                onSelectUser={(conversationId: string) => {
                  dispatch(selectConversation(conversationId));
                }}
              />
            </div>
          </div>
          <SidebarMenu className="px-2 py-2">
            <ConversationList
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
            />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="bg-accent hover:bg-accent/70">
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
