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
    <>
      <Sidebar
        variant="floating"
        className="mt-15 h-[calc(100vh-4rem)]"
        {...props}
      >
        <SidebarContent>
          <SidebarGroup>
            <div className="flex items-center justify-between pb-3 border-b border-sidebar-border/50">
              <SidebarGroupLabel className="text-sm font-semibold text-sidebar-foreground uppercase tracking-wider">
                USERS
              </SidebarGroupLabel>

              <div className="flex items-center gap-1">
                <UserSearchDialog
                  onSelectUser={(conversationId: string) => {
                    dispatch(selectConversation(conversationId));
                  }}
                />
              </div>
            </div>
            <ConversationList
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
            />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <GroupChatModal
                onSelectConversation={(conversationId: string) => {
                  dispatch(selectConversation(conversationId));
                }}
              />
              <SidebarMenuButton asChild variant="outline">
                <Link href="/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
