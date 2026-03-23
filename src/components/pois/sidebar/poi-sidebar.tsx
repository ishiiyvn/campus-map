"use client";

import { useState } from "react";
import { Category, Level } from "@/server/db/schema";
import { PanelLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { PoiSidebarHeader } from "./poi-sidebar-header";
import { PoiSidebarSearch } from "./poi-sidebar-search";
import { PoiSidebarCategories } from "./poi-sidebar-categories";

interface PoiSidebarProps {
  categories: Category[];
  levels?: Level[];
  visibility: Record<number, boolean>;
  onVisibilityChange: (categoryId: number, visible: boolean) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  selectedLevelId: number | null;
  onSelectLevel: (levelId: number | null) => void;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

function DesktopSidebar({
  categories,
  levels,
  visibility,
  onVisibilityChange,
  searchQuery,
  onSearch,
  selectedLevelId,
  onSelectLevel,
  collapsed,
  onCollapseChange,
}: PoiSidebarProps) {
  return (
    <div
      className={cn(
        "flex-shrink-0 h-full bg-background border-r flex flex-col transition-all duration-200 ease-in-out",
        collapsed ? "w-0 overflow-hidden" : "w-72"
      )}
    >
      <PoiSidebarHeader collapsed={collapsed ?? false} onToggle={() => onCollapseChange?.(!collapsed)} />
      {!(collapsed ?? false) && (
        <div className="flex-1 overflow-y-auto">
          <PoiSidebarSearch
            searchQuery={searchQuery}
            onSearch={onSearch}
            levels={levels ?? []}
            selectedLevelId={selectedLevelId}
            onSelectLevel={onSelectLevel}
          />
          <PoiSidebarCategories
            categories={categories}
            visibility={visibility}
            onVisibilityChange={onVisibilityChange}
          />
        </div>
      )}
    </div>
  );
}

function MobileSidebar({
  categories,
  levels,
  visibility,
  onVisibilityChange,
  searchQuery,
  onSearch,
  selectedLevelId,
  onSelectLevel,
}: PoiSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>POI Categories</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <PoiSidebarHeader collapsed={false} onToggle={() => setOpen(false)} />
            <div className="flex-1 overflow-y-auto">
              <PoiSidebarSearch
                searchQuery={searchQuery}
                onSearch={onSearch}
                levels={levels ?? []}
                selectedLevelId={selectedLevelId}
                onSelectLevel={onSelectLevel}
              />
              <PoiSidebarCategories
                categories={categories}
                visibility={visibility}
                onVisibilityChange={onVisibilityChange}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function PoiSidebar(props: PoiSidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileSidebar {...props} />;
  }

  return <DesktopSidebar {...props} />;
}
