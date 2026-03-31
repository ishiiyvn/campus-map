"use client";

import { AreaControls, DrawMode } from "@/components/areas/controls/area-controls";
import type { AreaPoint } from "@/components/areas/utils/types";

interface AreaControlsOverlayProps {
  isEditMode: boolean;
  activeTool: string;
  editingId: number | null;
  draftPoints: AreaPoint[];
  editPoints: AreaPoint[];
  mapAreas: unknown[];
  draftUndoStack: AreaPoint[][];
  editUndoStack: AreaPoint[][];
  drawMode: DrawMode;
  onDrawModeChange: (mode: DrawMode) => void;
  onDraftFinish: () => void;
  onDraftUndo: () => void;
  onDraftCancel: () => void;
  onEditUndo: () => void;
  onEditCancel: () => void;
  onEditFinishAuto: () => void;
}

export function AreaControlsOverlay({
  isEditMode,
  activeTool,
  editingId,
  draftPoints,
  editPoints,
  mapAreas,
  draftUndoStack,
  editUndoStack,
  drawMode,
  onDrawModeChange,
  onDraftFinish,
  onDraftUndo,
  onDraftCancel,
  onEditUndo,
  onEditCancel,
  onEditFinishAuto,
}: AreaControlsOverlayProps) {
  return (
    <>
      {isEditMode && activeTool === "add_area" && editingId === null && (
        <AreaControls
          isEditing={false}
          canUndo={draftUndoStack.length > 0}
          drawMode={drawMode}
          onDrawModeChange={onDrawModeChange}
          onFinish={onDraftFinish}
          onUndo={onDraftUndo}
          onCancel={onDraftCancel}
          showCancel={draftPoints.length > 0}
          isFinishDisabled={draftPoints.length < 3}
        />
      )}

      {isEditMode && editingId !== null && (
        <AreaControls
          isEditing
          canUndo={editUndoStack.length > 0}
          onFinish={onEditFinishAuto}
          onUndo={onEditUndo}
          onCancel={onEditCancel}
          isFinishDisabled={editPoints.length < 3}
        />
      )}
    </>
  );
}
