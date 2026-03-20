"use client"

import { Map, Layers, LayoutGrid, LogIn } from "lucide-react"
import Link from "next/link"
import { routeWithLocale } from "@/i18n/routes"
import { UserButton, useUser } from "@stackframe/stack"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AppTopbar() {
  const user = useUser();
  const t = useTranslations("sidebar");
  
  const navItems = [
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
    <header className="sticky top-0 z-50 w-full border-b bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-2">
          <Map className="h-6 w-6" />
          <span className="font-bold">{t("brand")}</span>
        </div>

        {/* Center: Navigation - hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              size="sm"
              asChild
            >
              <Link href={item.url} className="gap-2">
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            </Button>
          ))}
        </nav>

        {/* Right: User */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <UserButton />
              <span className="hidden lg:block truncate text-sm text-sidebar-foreground/70">
                {user.primaryEmail ?? user.displayName ?? t("signedIn")}
              </span>
            </div>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href={routeWithLocale("/login", "es")} className="gap-2">
                <LogIn className="h-4 w-4" />
                <span>{t("login")}</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
