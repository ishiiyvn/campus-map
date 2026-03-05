"use client";

import { AreaControls } from "@/components/areas/controls/area-controls";
import type { Area } from "@/server/db/schema";
import type { AreaPoint } from "@/components/areas/utils/types";

interface AreaControlsOverlayProps {
  isEditMode: boolean;
  activeTool: string;
  editingId: number | null;
  editPoints: AreaPoint[];
  mapAreas: Area[];
  draftUndoStack: AreaPoint[][];
  editUndoStack: AreaPoint[][];
  onDraftFinish: () => void;
  onDraftUndo: () => void;
  onDraftCancel: () => void;
  onEditUndo: () => void;
  onEditCancel: () => void;
  onSetEditSnapshot: (area: Area) => void;
  onRequestEditDialog: (
    areaId: number,
    points: AreaPoint[],
    areas: Area[],
    onOpen: (area: Area) => void
  ) => void;
  onOpenEditDialog: () => void;
}

export function AreaControlsOverlay({
  isEditMode,
  activeTool,
  editingId,
  editPoints,
  mapAreas,
  draftUndoStack,
  editUndoStack,
  onDraftFinish,
  onDraftUndo,
  onDraftCancel,
  onEditUndo,
  onEditCancel,
  onSetEditSnapshot,
  onRequestEditDialog,
  onOpenEditDialog,
}: AreaControlsOverlayProps) {
  return (
    <>
      {isEditMode && activeTool === "add_area" && editingId === null && (
        <AreaControls
          isEditing={false}
          canUndo={draftUndoStack.length > 0}
          onFinish={onDraftFinish}
          onUndo={onDraftUndo}
          onCancel={onDraftCancel}
        />
      )}

      {isEditMode && editingId !== null && (
        <AreaControls
          isEditing
          canUndo={editUndoStack.length > 0}
          onFinish={() =>
            onRequestEditDialog(editingId, editPoints, mapAreas, (area) => {
              onSetEditSnapshot(area);
              onOpenEditDialog();
            })
          }
          onUndo={onEditUndo}
          onCancel={onEditCancel}
        />
      )}
    </>
  );
}
