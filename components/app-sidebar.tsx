"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const nav = {
  title: "Home",
  items: [
    {
      title: "Dashboard",
      url: "/",
    },
    {
      title: "Analytics",
      url: "/analytics",
    },
    {
      title: "Settings",
      url: "/settings",
    },
  ],
};
const adminNav = {
  title: "Admin",
  items: [
    {
      title: "Create User",
      url: "/create-user",
    },
    {
      title: "Manage Users",
      url: "/admin-users",
    },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <Sidebar
      variant="floating"
      className="mt-13 h-[calc(100vh-3rem)]"
      {...props}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>

          <SidebarMenu>
            {nav.items.map((item) => {
              const isActive =
                item.url === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.url);

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.url}>{item.title}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>

          {user?.role === "ADMIN" && (
            <>
              <SidebarGroupLabel className="mt-3">
                {adminNav.title}
              </SidebarGroupLabel>
              <SidebarMenu>
                {adminNav.items.map((item) => {
                  const isActive =
                    item.url === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.url);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>{item.title}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </>
          )}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
