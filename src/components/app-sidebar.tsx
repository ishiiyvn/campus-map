"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Home, LayoutGrid, Map, Layers, LogIn } from "lucide-react"
import Link from "next/link"
import { UserButton, useUser } from "@stackframe/stack"

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Maps",
    url: "/", 
    icon: Map,
  },
  {
    title: "Areas",
    url: "/areas", 
    icon: Layers,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: LayoutGrid,
  },
]

export function AppSidebar() {
  const user = useUser();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
            <Map className="h-6 w-6" />
            <span className="font-bold">Campus Map</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
            <SidebarGroupContent>
            <SidebarMenu>
                {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                    <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                ))}
            </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {user ? (
          <div className="flex items-center gap-2 px-2 py-1">
            <UserButton />
            <span className="truncate text-xs text-muted-foreground">
              {user.primaryEmail ?? user.displayName ?? "Signed in"}
            </span>
          </div>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/login">
                  <LogIn />
                  <span>Login</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
