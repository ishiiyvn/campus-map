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
import { LayoutGrid, Map, Layers, LogIn } from "lucide-react"
import Link from "next/link"
import { routeWithLocale } from "@/i18n/routes"
import { UserButton, useUser } from "@stackframe/stack"
import { useTranslations } from "next-intl"

export function AppSidebar() {
  const user = useUser();
  const t = useTranslations("sidebar");
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
        <div className="flex items-center gap-2 px-4 py-2">
            <Map className="h-6 w-6" />
            <span className="font-bold">{t("brand")}</span>
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
