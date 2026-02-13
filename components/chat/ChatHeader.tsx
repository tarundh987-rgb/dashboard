"use client";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import UserDropdown from "@/components/UserDropdown";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/ModeToggle";

export default function ChatHeader() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="flex w-full items-center justify-between px-2">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="font-bold text-lg">Redux Auth</span>
        </Link>
        <SidebarTrigger className="md:ml-11.5 cursor-pointer" />
        <div className="h-6 w-px bg-border mx-2 hidden md:block" />
        <span className="text-sm font-medium text-muted-foreground hidden sm:block">
          {user ? (
            <>
              Welcome back,{" "}
              <span className="text-foreground">{user.firstName}</span>
            </>
          ) : (
            "Welcome back"
          )}
        </span>
      </div>
      <div className="flex items-center justify-center gap-2">
        <ModeToggle />
        <UserDropdown />
      </div>
    </div>
  );
}
