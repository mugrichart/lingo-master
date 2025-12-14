"use client"

import * as React from "react"
import {
  UserRound,
  Trophy,
  BookOpen,
  Settings2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Mugrich",
    email: "richard.mugisha@acity.edu.gh",
    avatar: "/avatars/shadcn.jpg",
  },
  modes: [
    {
      logo: UserRound,
      name: "Solo",
    },
    {
      logo: Trophy,
      name: "Multiplayer",
    },
  ],
  navMain: [
    {
      title: "Solo-player",
      url: "#",
      icon: UserRound,
      isActive: true,
      items: [
        {
          title: "Topics",
          url: "#",
        },
        {
          title: "ForYou",
          url: "#",
        },
        {
          title: "My Learning",
          url: "#",
        },
        {
          title: "Stories",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Multi-player",
      url: "#",
      icon: Trophy,
      items: [
        {
          title: "Learning",
          url: "#",
        },
        {
          title: "Stories",
          url: "#",
        },
      ],
    },
    {
      title: "Imports",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "From PDF reading",
          url: "#",
        },
        {
          title: "From Website reading",
          url: "#",
        }
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
      ],
    },
  ],
  
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher modes={data.modes} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
