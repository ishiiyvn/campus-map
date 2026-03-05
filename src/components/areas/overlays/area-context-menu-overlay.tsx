"use client";

import type { Area } from "@/server/db/schema";
import { AreaContextMenu } from "@/components/areas/menus/area-context-menu";
import type { AreaContextMenuState } from "@/components/areas/overlays/types";

interface AreaContextMenuOverlayProps {
  isEditMode: boolean;
  editingId: number | null;
  contextMenu: AreaContextMenuState | null;
  mapAreas: Area[];
  onCloseContextMenu: () => void;
  onStartEditingArea: (area: Area) => void;
  onOpenEditInfo: (area: Area) => void;
  onDeleteTargetChange: (areaId: number | null) => void;
  onDeleteOpenChange: (open: boolean) => void;
}

export function AreaContextMenuOverlay({
  isEditMode,
  editingId,
  contextMenu,
  mapAreas,
  onCloseContextMenu,
  onStartEditingArea,
  onOpenEditInfo,
  onDeleteTargetChange,
  onDeleteOpenChange,
}: AreaContextMenuOverlayProps) {
  if (!contextMenu || editingId !== null || !isEditMode) {
    return null;
  }

  return (
    <AreaContextMenu
      x={contextMenu.x}
      y={contextMenu.y}
      onEditPolygon={() => {
        const area = mapAreas.find((item) => item.id === contextMenu.areaId);
        if (area) {
          onStartEditingArea(area);
          onCloseContextMenu();
        }
      }}
      onEditInfo={() => {
        const area = mapAreas.find((item) => item.id === contextMenu.areaId);
        if (area) {
          onOpenEditInfo(area);
          onCloseContextMenu();
        }
      }}
      onDelete={() => {
        onDeleteTargetChange(contextMenu.areaId);
        onDeleteOpenChange(true);
        onCloseContextMenu();
      }}
      onClose={onCloseContextMenu}
    />
  );
}
