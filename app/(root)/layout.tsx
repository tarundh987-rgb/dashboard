import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import ChatHeader from "@/components/chat/ChatHeader";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider className="flex flex-col">
      <nav className="sticky top-0 z-50 p-2 shrink-0 flex items-center w-full bg-background/95 backdrop-blur-md border-b">
        <div className="flex items-center gap-2 w-full px-2">
          <Separator
            orientation="vertical"
            className="mr-2 h-4 hidden md:block"
          />
          <ChatHeader />
        </div>
      </nav>
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-4rem)]">
        <ChatSidebar />
        <SidebarInset className="flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col h-full px-2">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
