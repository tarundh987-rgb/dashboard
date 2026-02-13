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

const nav = {
  title: "Home",
  items: [
    {
      title: "Dashboard",
      url: "/dashboard",
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
    },
    {
      title: "Create User",
      url: "/dashboard/create-user",
    },
    {
      title: "Manage Users",
      url: "/dashboard/admin-users",
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
    },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar
      variant="floating"
      className="mt-13 h-[calc(100vh-3rem)]"
      {...props}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {nav.items.map((item) => {
              const isActive =
                item.url === "/dashboard" || item.url === "/"
                  ? pathname === item.url
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
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
