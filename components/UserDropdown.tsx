"use client";

import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useLogoutMutation } from "@/redux/features/auth/authApi";
import { toast } from "sonner";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { clearUser } from "@/redux/features/auth/authSlice";
import { formatDate } from "@/utils/ageCalculator";

export default function UserDropdown() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const [logoutApi, { isLoading }] = useLogoutMutation();

  if (!user) {
    return (
      <Link href="/auth/sign-in">
        <Button className="cursor-pointer hover:bg-primary/80">Sign In</Button>
      </Link>
    );
  }

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(clearUser());
      toast.success("Logged out successfully.");
    } catch (err) {
      const error = err as FetchBaseQueryError & {
        data?: {
          message?: string;
        };
      };
      toast.error(error?.data?.message || "Logout failed.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 cursor-pointer"
        >
          <Image
            src="/man.png"
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
        <DropdownMenuLabel className="flex gap-3">
          <Image
            src="/man.png"
            alt="Profile"
            width={44}
            height={44}
            className="rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-medium">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <span className="font-semibold">
            Role: <span className="font-normal">{user?.role}</span>
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <span className="font-semibold">
            DOB:{" "}
            <span className="font-normal">{formatDate(user?.dateOfBirth)}</span>
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoading}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoading ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
