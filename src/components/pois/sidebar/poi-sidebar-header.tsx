"use client";

import { MapIcon, PanelLeftIcon, PanelRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PoiSidebarHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function PoiSidebarHeader({
  collapsed,
  onToggle,
}: PoiSidebarHeaderProps) {
  return (
    <div className="px-2 pt-4 pb-2 border-b flex items-center justify-between">
      <div className="flex items-center gap-2 px-2">
        <MapIcon className="h-5 w-5" />
        {!collapsed && <span className="font-semibold text-sm">POIs</span>}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={onToggle}
      >
        {collapsed ? (
          <PanelRightIcon className="h-4 w-4" />
        ) : (
          <PanelLeftIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
