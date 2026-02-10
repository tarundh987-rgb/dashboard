import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/ModeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import UserDropdown from "@/components/UserDropdown";
import { Bell, InfoIcon } from "lucide-react";
import Link from "next/link";

export default function DashBoardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "18rem",
          } as React.CSSProperties
        }
        className="flex flex-col"
      >
        <nav className="sticky top-0 z-50 p-2 shrink-0 flex items-center justify-between w-full bg-background">
          <div className="flex items-center justify-center gap-2">
            <Link href={"/"} className="cursor-pointer">
              <span className="px-4 font-semibold text-xl">Redux Auth</span>
            </Link>
            <SidebarTrigger className="cursor-pointer" />
          </div>
          <div className="flex gap-2">
            <Field className="md:block hidden">
              <InputGroup>
                <InputGroupInput id="search" placeholder="search..." />
                <InputGroupAddon align="inline-end">
                  <InfoIcon />
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative cursor-pointer"
                >
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-medium">New user signup</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Sarah joined your platform 2 minutes ago
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-accent" />
                    <span className="font-medium">Revenue milestone</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    You reached $50k MRR this month!
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-chart-3" />
                    <span className="font-medium">Server alert</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    CPU usage exceeded 80% threshold
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <UserDropdown />
          </div>
          <div className="pointer-events-none absolute -bottom-2 left-0 w-full h-2 bg-linear-to-b from-background to-transparent" />
        </nav>
        <div className="flex flex-1 my-1 px-2">
          <AppSidebar />
          <SidebarInset className="flex-1 overflow-y-auto">
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}
