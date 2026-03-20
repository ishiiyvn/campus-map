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
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import { LayoutGrid, Map, Layers, LogIn, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { routeWithLocale } from "@/i18n/routes"
import { UserButton, useUser } from "@stackframe/stack"
import { useTranslations } from "next-intl"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const user = useUser();
  const t = useTranslations("sidebar");
  const { state, toggleSidebar } = useSidebar();
  
  const items = [
    {
      title: t("maps"),
      url: routeWithLocale("/maps", "es"),
      icon: Map,
    },
    {
      title: t("layers"),
      url: routeWithLocale("/layers", "es"),
      icon: Layers,
    },
    {
      title: t("areas"),
      url: routeWithLocale("/areas", "es"),
      icon: Layers,
    },
    {
      title: t("categories"),
      url: routeWithLocale("/categories", "es"),
      icon: LayoutGrid,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Map className="h-6 w-6" />
            <span className="font-bold">{t("brand")}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleSidebar}
          >
            {state === "expanded" ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
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
              {user.primaryEmail ?? user.displayName ?? t("signedIn")}
            </span>
          </div>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={routeWithLocale("/login", "es")}>
                  <LogIn />
                  <span>{t("login")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
