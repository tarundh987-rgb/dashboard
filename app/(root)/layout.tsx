import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ChatHeader from "@/components/chat/ChatHeader";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider className="flex flex-col">
      <nav className="sticky top-0 z-50 p-2 shrink-0 flex items-center w-full bg-background">
        <div className="flex items-center gap-2 w-full px-2">
          <ChatHeader />
        </div>
        <div className="pointer-events-none absolute -bottom-2 left-0 w-full h-2 bg-linear-to-b from-background to-transparent" />
      </nav>
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
        <ChatSidebar />
        <SidebarInset className="flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col h-full">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
