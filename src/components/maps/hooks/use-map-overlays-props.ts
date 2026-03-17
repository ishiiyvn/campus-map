import type { Area } from "@/server/db/schema";
import type { AreaPoint } from "@/components/areas/utils/types";
import type { AreaUiProps } from "@/components/areas/overlays/area-ui";
import type { EditorTool } from "@/components/maps/editor-tools/map-editor-toolbar";

interface UseMapOverlaysPropsOptions {
  mapId: number;
  isMobile: boolean;
  isEditMode: boolean;
  activeTool: EditorTool;
  onEditModeChange: (enabled: boolean) => void;
  onToolChange: (tool: EditorTool) => void;
  mapAreas: Area[];
  editingAreaId: number | null;
  editingAreaSnapshot: Area | null;
  draftPoints: AreaPoint[];
  editPoints: AreaPoint[];
  draftUndoStack: AreaPoint[][];
  editingUndoStack: AreaPoint[][];
  contextMenu: { x: number; y: number; areaId: number } | null;
  isCreateOpen: boolean;
  isEditOpen: boolean;
  isDeleteOpen: boolean;
  deleteTargetId: number | null;
  setCreateOpen: (open: boolean) => void;
  setEditOpen: (open: boolean) => void;
  setDeleteOpen: (open: boolean) => void;
  setDeleteTargetId: (areaId: number | null) => void;
  onDraftFinish: () => void;
  onDraftUndo: () => void;
  onDraftCancel: () => void;
  onEditUndo: () => void;
  onEditCancel: () => void;
  onCloseContextMenu: () => void;
  onStartEditingArea: (area: Area) => void;
  onOpenEditInfo: (area: Area) => void;
  onSetEditSnapshot: (area: Area) => void;
  onRequestEditDialog: (areaId: number, points: AreaPoint[], areas: Area[], onOpen: (area: Area) => void) => void;
  onCreateSuccess: AreaUiProps["actions"]["onCreateSuccess"];
  onEditSuccess: AreaUiProps["actions"]["onEditSuccess"];
  onDeleteConfirm: AreaUiProps["actions"]["onDeleteConfirm"];
  onAreaCreated: (created: Area) => void;
  onAreaUpdated: (updated: Area) => void;
  onAreaDeleted: (deletedId: number) => void;
  onResetDraft: () => void;
  onResetEdit: () => void;
  onResetTool: () => void;
  onCloseDialogs: () => void;
}

export function useMapOverlaysProps({
  mapId,
  isMobile,
  isEditMode,
  activeTool,
  onEditModeChange,
  onToolChange,
  mapAreas,
  editingAreaId,
  editingAreaSnapshot,
  draftPoints,
  editPoints,
  draftUndoStack,
  editingUndoStack,
  contextMenu,
  isCreateOpen,
  isEditOpen,
  isDeleteOpen,
  deleteTargetId,
  setCreateOpen,
  setEditOpen,
  setDeleteOpen,
  setDeleteTargetId,
  onDraftFinish,
  onDraftUndo,
  onDraftCancel,
  onEditUndo,
  onEditCancel,
  onCloseContextMenu,
  onStartEditingArea,
  onOpenEditInfo,
  onSetEditSnapshot,
  onRequestEditDialog,
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
}: UseMapOverlaysPropsOptions) {
  const toolbar = {
    isEditMode,
    activeTool,
    onEditModeChange,
    onToolChange,
  };

  const hints = {
    isEditMode,
    activeTool,
    isMobile,
  };

  const areaUi: AreaUiProps = {
    mapId,
    areas: {
      list: mapAreas,
      editingId: editingAreaId,
      editSnapshot: editingAreaSnapshot,
      draftPoints,
      editPoints,
    },
    undo: {
      draft: draftUndoStack,
      edit: editingUndoStack,
    },
    ui: {
      isEditMode,
      activeTool,
      contextMenu,
    },
    dialogs: {
      createOpen: isCreateOpen,
      editOpen: isEditOpen,
      deleteOpen: isDeleteOpen,
      deleteTargetId,
    },
    onDialogToggles: {
      setCreateOpen,
      setEditOpen,
      setDeleteOpen,
      setDeleteTargetId,
    },
    actions: {
      onDraftFinish,
      onDraftUndo,
      onDraftCancel,
      onEditUndo,
      onEditCancel,
      onCloseContextMenu,
      onStartEditingArea,
      onOpenEditInfo,
      onSetEditSnapshot,
      onRequestEditDialog,
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
    },
  };

  return {
    isMobile,
    toolbar,
    hints,
    areaUi,
  };
}
