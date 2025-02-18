"use client";

import { SquareTerminal, Zap } from "lucide-react";
import * as React from "react";

import { LiveModeToggle } from "@/app/_components/live-mode-toggle";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { DateFilter } from "./date-filter";

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/",
      icon: SquareTerminal,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 border items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Zap className="size-4 fill-primary stroke-primary" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">AmpDash</span>
                  <span className="truncate text-xs">
                    Live current measurements
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <LiveModeToggle />
        <DateFilter />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
