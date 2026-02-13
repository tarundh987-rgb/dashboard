"use client";
import UserDropdown from "@/components/UserDropdown";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import InviteNotifications from "../InviteNotifications";
import { ModeToggle } from "@/components/ModeToggle";

export default function ChatHeader() {
  return (
    <div className="flex w-full items-center justify-between px-2">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="font-bold text-lg">Redux Auth</span>
        </Link>
        <SidebarTrigger className="cursor-pointer" />
      </div>
      <div className="flex items-center justify-center gap-2">
        <InviteNotifications />
        <ModeToggle />
        <UserDropdown />
      </div>
    </div>
  );
}
