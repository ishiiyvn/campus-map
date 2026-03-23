"use client";

import type { Area } from "@/server/db/schema";
import type { AreaPoint } from "@/components/areas/utils/types";
import { AreaControlsOverlay } from "@/components/areas/overlays/area-controls-overlay";
import { AreaDialogsOverlay } from "@/components/areas/overlays/area-dialogs-overlay";

export interface AreaUiProps {
  mapId: number;
  areas: {
    list: Area[];
    editingId: number | null;
    editSnapshot: Area | null;
    draftPoints: AreaPoint[];
    editPoints: AreaPoint[];
  };
  undo: {
    draft: AreaPoint[][];
    edit: AreaPoint[][];
  };
  ui: {
    isEditMode: boolean;
    activeTool: string;
  };
  dialogs: {
    createOpen: boolean;
    editOpen: boolean;
    deleteOpen: boolean;
    deleteTargetId: number | null;
  };
  onDialogToggles: {
    setCreateOpen: (open: boolean) => void;
    setEditOpen: (open: boolean) => void;
    setDeleteOpen: (open: boolean) => void;
    setDeleteTargetId: (areaId: number | null) => void;
  };
  actions: {
    onDraftFinish: () => void;
    onDraftUndo: () => void;
    onDraftCancel: () => void;
    onEditUndo: () => void;
    onEditCancel: () => void;
    onStartEditingArea: (area: Area) => void;
    onOpenEditInfo: (area: Area) => void;
    onSetEditSnapshot: (area: Area) => void;
    onRequestEditDialog: (areaId: number, points: AreaPoint[], areas: Area[], onOpen: (area: Area) => void) => void;
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
  };
}

export function AreaUi({ mapId, areas, undo, ui, dialogs, onDialogToggles, actions }: AreaUiProps) {
  const { list, editingId, editSnapshot, draftPoints, editPoints } = areas;
  const { draft: draftUndoStack, edit: editingUndoStack } = undo;
  const { isEditMode, activeTool } = ui;
  const { createOpen, editOpen, deleteOpen, deleteTargetId } = dialogs;
  const { setCreateOpen, setEditOpen, setDeleteOpen, setDeleteTargetId } = onDialogToggles;
  return (
    <>
      <AreaControlsOverlay
        isEditMode={isEditMode}
        activeTool={activeTool}
        editingId={editingId}
        draftPoints={draftPoints}
        editPoints={editPoints}
        mapAreas={list}
        draftUndoStack={draftUndoStack}
        editUndoStack={editingUndoStack}
        onDraftFinish={actions.onDraftFinish}
        onDraftUndo={actions.onDraftUndo}
        onDraftCancel={actions.onDraftCancel}
        onEditUndo={actions.onEditUndo}
        onEditCancel={actions.onEditCancel}
        onSetEditSnapshot={actions.onSetEditSnapshot}
        onRequestEditDialog={actions.onRequestEditDialog}
        onOpenEditDialog={() => setEditOpen(true)}
      />

      <AreaDialogsOverlay
        mapId={mapId}
        draftPoints={draftPoints}
        editPoints={editPoints}
        editSnapshot={editSnapshot}
        createOpen={createOpen}
        editOpen={editOpen}
        deleteOpen={deleteOpen}
        deleteTargetId={deleteTargetId}
        onCreateOpenChange={setCreateOpen}
        onEditOpenChange={setEditOpen}
        onDeleteOpenChange={setDeleteOpen}
        onDeleteTargetChange={setDeleteTargetId}
        onCreateSuccess={actions.onCreateSuccess}
        onEditSuccess={actions.onEditSuccess}
        onDeleteConfirm={actions.onDeleteConfirm}
        onAreaCreated={actions.onAreaCreated}
        onAreaUpdated={actions.onAreaUpdated}
        onAreaDeleted={actions.onAreaDeleted}
        onResetDraft={actions.onResetDraft}
        onResetEdit={actions.onResetEdit}
        onResetTool={actions.onResetTool}
        onCloseDialogs={actions.onCloseDialogs}
      />
    </>
  );
}
