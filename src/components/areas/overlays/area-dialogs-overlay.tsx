"use client";

import type { Area } from "@/server/db/schema";
import type { AreaPoint } from "@/components/areas/utils/types";
import { AreaDialogs } from "@/components/areas/dialogs/area-dialogs";

interface AreaDialogsOverlayProps {
  mapId: number;
  draftPoints: AreaPoint[];
  editPoints: AreaPoint[];
  editSnapshot: Area | null;
  createOpen: boolean;
  editOpen: boolean;
  deleteOpen: boolean;
  deleteTargetId: number | null;
  onCreateOpenChange: (open: boolean) => void;
  onEditOpenChange: (open: boolean) => void;
  onDeleteOpenChange: (open: boolean) => void;
  onDeleteTargetChange: (areaId: number | null) => void;
  onCreateSuccess: (
    area: Area,
    handlers: {
      onCreated: (created: Area) => void;
      onResetDraft: () => void;
      onCloseCreate: () => void;
      onResetTool: () => void;
    }
  ) => void;
  onEditSuccess: (
    area: Area,
    handlers: {
      onUpdated: (updated: Area) => void;
      onResetEdit: () => void;
      onCloseEdit: () => void;
    }
  ) => void;
  onDeleteConfirm: (
    areaId: number,
    handlers: {
      onDeleted: (deletedId: number) => void;
      onResetEdit: () => void;
      onCloseDialogs: () => void;
    }
  ) => void;
  onAreaCreated: (created: Area) => void;
  onAreaUpdated: (updated: Area) => void;
  onAreaDeleted: (deletedId: number) => void;
  onResetDraft: () => void;
  onResetEdit: () => void;
  onResetTool: () => void;
  onCloseDialogs: () => void;
}

export function AreaDialogsOverlay({
  mapId,
  draftPoints,
  editPoints,
  editSnapshot,
  createOpen,
  editOpen,
  deleteOpen,
  deleteTargetId,
  onCreateOpenChange,
  onEditOpenChange,
  onDeleteOpenChange,
  onDeleteTargetChange,
  onCreateSuccess,
  onEditSuccess,
  onDeleteConfirm,
  onAreaCreated,
  onAreaUpdated,
  onAreaDeleted,
  onResetDraft,
  onResetEdit,
  onResetTool,
  onCloseDialogs,
}: AreaDialogsOverlayProps) {
  return (
    <AreaDialogs
      mapId={mapId}
      draftPoints={draftPoints}
      editPoints={editPoints}
      editSnapshot={editSnapshot}
      isCreateOpen={createOpen}
      isEditOpen={editOpen}
      isDeleteOpen={deleteOpen}
      onCreateOpenChange={onCreateOpenChange}
      onEditOpenChange={onEditOpenChange}
      onDeleteOpenChange={onDeleteOpenChange}
      onCreateSuccess={(area) =>
        onCreateSuccess(area, {
          onCreated: onAreaCreated,
          onResetDraft: onResetDraft,
          onCloseCreate: () => onCreateOpenChange(false),
          onResetTool: onResetTool,
        })
      }
      onEditSuccess={(area) =>
        onEditSuccess(area, {
          onUpdated: onAreaUpdated,
          onResetEdit: onResetEdit,
          onCloseEdit: () => onEditOpenChange(false),
        })
      }
      onDeleteConfirm={() => {
        if (deleteTargetId !== null) {
          onDeleteConfirm(deleteTargetId, {
            onDeleted: onAreaDeleted,
            onResetEdit: onResetEdit,
            onCloseDialogs: () => {
              onCloseDialogs();
              onDeleteTargetChange(null);
            },
          });
        }
      }}
    />
  );
}
