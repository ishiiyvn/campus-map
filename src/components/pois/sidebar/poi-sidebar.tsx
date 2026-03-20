"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Category, Level } from "@/server/db/schema";
import { getIconComponent } from "@/components/ui/icon-picker";
import { Search, Eye, EyeOff, MapIcon, PanelLeftIcon, PanelRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { LevelSelector } from "@/components/pois/level-selector";

interface PoiSidebarProps {
  categories: Category[];
  levels?: Level[];
  visibility: Record<number, boolean>;
  onVisibilityChange: (categoryId: number, visible: boolean) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  selectedLevelId: number | null;
  onSelectLevel: (levelId: number | null) => void;
}

export function PoiSidebar({
  categories,
  levels = [],
  visibility,
  onVisibilityChange,
  onSearch,
  searchQuery,
  selectedLevelId,
  onSelectLevel,
}: PoiSidebarProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(!isMobile);
  const [collapsed, setCollapsed] = useState(false);

  const activeCategories = categories.filter((c) => c.is_active);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b flex items-center justify-between">
        <div className="flex items-center gap-2 px-2">
          <MapIcon className="h-5 w-5" />
          {!collapsed && <span className="font-semibold text-sm">POIs</span>}
        </div>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelRightIcon className="h-4 w-4" />
            ) : (
              <PanelLeftIcon className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!collapsed && (
          <>
            <div className="p-2 border-b space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search POIs..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <LevelSelector
                levels={levels}
                selectedLevelId={selectedLevelId}
                onSelectLevel={onSelectLevel}
              />
            </div>
          </>
        )}

        <div className="p-2 space-y-1">
          {activeCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No categories available
            </p>
          ) : (
            activeCategories.map((category) => {
              const isVisible = visibility[category.id] ?? category.is_map_level_default ?? true;
              const IconComponent = category.icon ? getIconComponent(category.icon) : null;

              const button = (
                <Button
                  variant="ghost"
                  size={collapsed ? "icon" : "sm"}
                  className={cn(
                    "w-full justify-start gap-2 h-9",
                    collapsed && "w-9 p-0",
                    isVisible && "bg-accent"
                  )}
                  onClick={() => onVisibilityChange(category.id, !isVisible)}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0",
                      category.color ? "" : "bg-accent"
                    )}
                    style={
                      category.color
                        ? { backgroundColor: category.color + "20" }
                        : undefined
                    }
                  >
                    {IconComponent ? (
                      <div style={category.color ? { color: category.color } : undefined}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                    ) : (
                      <span className="text-xs font-medium">
                        {category.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate text-sm">
                        {category.name}
                      </span>
                      {isVisible ? (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </>
                  )}
                </Button>
              );

              if (collapsed) {
                return (
                  <Tooltip key={category.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      {button}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div className="flex items-center gap-2">
                        {IconComponent && <IconComponent className="w-4 h-4" />}
                        <span>{category.name}</span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={category.id}>{button}</div>;
            })
          )}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          size="icon"
          className="absolute left-3 top-3 z-40"
          onClick={() => setOpen(true)}
        >
          <PanelLeftIcon className="h-4 w-4" />
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>POI Categories</SheetTitle>
            </SheetHeader>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  if (collapsed) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="absolute left-3 top-3 z-40"
        onClick={() => setCollapsed(false)}
      >
        <PanelRightIcon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "absolute left-0 top-0 h-full z-40 bg-background border-r flex flex-col w-72"
      )}
    >
      {sidebarContent}
    </div>
  );
}
