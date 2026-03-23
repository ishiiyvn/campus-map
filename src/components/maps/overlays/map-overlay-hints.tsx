"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface MapOverlayHintsProps {
  isEditMode: boolean;
  activeTool: string;
  isMobile?: boolean;
  showZoomHint?: boolean;
  sidebarCollapsed?: boolean;
}

export function MapOverlayHints({
  isEditMode,
  activeTool,
  isMobile = false,
  showZoomHint = true,
  sidebarCollapsed = true,
}: MapOverlayHintsProps) {
  const t = useTranslations("map.hints");

  const hints = useMemo(() => {
    const next: string[] = [];

    if (showZoomHint) {
      next.push(t("zoom"));
      if (isMobile) {
        next.push(t("mobileZoom"));
      }
    }

    if (isEditMode && activeTool === "add_area") {
      next.push(t("addArea"));
    }

    if (isEditMode && activeTool === "select") {
      next.push(t("select"));
    }

    return next;
  }, [activeTool, isEditMode, isMobile, showZoomHint, t]);

  return (
    <div className={cn(
      "fixed bottom-4 flex flex-col gap-2 text-xs pointer-events-none z-40",
      sidebarCollapsed ? "left-4" : "left-[19.5rem]"
    )}>
      {hints.map((hint, index) => (
        <div
          key={`${hint}-${index}`}
          className="bg-white/80 px-2 py-1 rounded shadow backdrop-blur-sm"
        >
          {hint}
        </div>
      ))}
    </div>
  );
}
