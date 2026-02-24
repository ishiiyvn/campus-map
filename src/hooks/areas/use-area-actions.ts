"use client";

import { useCallback, useState } from "react";
import type { Area } from "@/server/db/schema";
import { deleteArea, updateArea } from "@/server/actions/areas";
import { toast } from "sonner";

export function useAreaActions() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetAreaId, setDeleteTargetAreaId] = useState<number | null>(null);

  const handleDeleteArea = useCallback(async (
    areaId: number,
    options: {
      onDeleted: (deletedId: number) => void;
      onResetEdit: () => void;
      onCloseDialogs: () => void;
    },
  ) => {
    try {
      await deleteArea(areaId);
      options.onDeleted(areaId);
      options.onResetEdit();
      options.onCloseDialogs();
      toast.success("Área eliminada");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar el área");
    }
  }, []);

  const handleEditFormSuccess = useCallback((
    updated: Area,
    options: {
      onUpdated: (area: Area) => void;
      onResetEdit: () => void;
      onCloseEdit: () => void;
    },
  ) => {
    options.onUpdated(updated);
    options.onResetEdit();
    options.onCloseEdit();
  }, []);

  const handleEditSave = useCallback((
    editingAreaId: number | null,
    editingPoints: { x: number; y: number }[],
    mapAreas: Area[],
    onOpenEditDialog: (area: Area) => void,
  ) => {
    if (editingAreaId === null) return;
    if (editingPoints.length < 3) {
      toast.error("Agrega al menos 3 puntos para guardar el área");
      return;
    }
    const area = mapAreas.find((item) => item.id === editingAreaId);
    if (!area) return;
    onOpenEditDialog(area);
  }, []);

  const handleAreaCreated = useCallback((
    newArea: Area,
    options: {
      onCreated: (area: Area) => void;
      onResetDraft: () => void;
      onCloseCreate: () => void;
      onResetTool: () => void;
    },
  ) => {
    options.onCreated(newArea);
    options.onResetDraft();
    options.onCloseCreate();
    options.onResetTool();
  }, []);

  return {
    isDeleteDialogOpen,
    deleteTargetAreaId,
    setIsDeleteDialogOpen,
    setDeleteTargetAreaId,
    handleDeleteArea,
    handleEditFormSuccess,
    handleEditSave,
    handleAreaCreated,
  };
}
