"use client";

import { useCallback, useState } from "react";
import type { Area } from "@/server/db/schema";
import type { AreaPoint } from "@/components/areas/map/types";
import { insertPointBetweenNearestEdges } from "@/components/areas/map/geometry";

export function useAreaEdit() {
  const [editingAreaId, setEditingAreaId] = useState<number | null>(null);
  const [editingPoints, setEditingPoints] = useState<AreaPoint[]>([]);
  const [editingOriginalPoints, setEditingOriginalPoints] = useState<AreaPoint[]>([]);
  const [editingUndoStack, setEditingUndoStack] = useState<AreaPoint[][]>([]);
  const [isEditAreaDialogOpen, setIsEditAreaDialogOpen] = useState(false);
  const [editingAreaSnapshot, setEditingAreaSnapshot] = useState<Area | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; areaId: number } | null>(null);

  const isEditing = editingAreaId !== null;

  const startEditingArea = useCallback((area: Area) => {
    const points = (area.polygon_coordinates ?? []) as { x: number; y: number }[];
    setEditingAreaId(area.id ?? null);
    setEditingPoints(points.map((point) => ({ x: point.x, y: point.y })));
    setEditingOriginalPoints(points.map((point) => ({ x: point.x, y: point.y })));
    setEditingUndoStack([]);
  }, []);

  const openEditInfo = useCallback((area: Area) => {
    const points = (area.polygon_coordinates ?? []) as { x: number; y: number }[];
    setEditingPoints(points.map((point) => ({ x: point.x, y: point.y })));
    setEditingAreaSnapshot(area);
    setIsEditAreaDialogOpen(true);
  }, []);

  const openContextMenu = useCallback((areaId: number, x: number, y: number) => {
    setContextMenu({ areaId, x, y });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const updateEditingPoint = useCallback((index: number, point: AreaPoint) => {
    setEditingPoints((prev) => prev.map((item, i) => (i === index ? point : item)));
  }, []);

  const removeEditingPointAt = useCallback((index: number) => {
    setEditingPoints((prev) => {
      if (prev.length === 0) return prev;
      setEditingUndoStack((stack) => [...stack, prev]);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const insertEditingPointAtNearestEdge = useCallback((point: AreaPoint) => {
    setEditingPoints((prev) => {
      const next = insertPointBetweenNearestEdges(prev, point);
      setEditingUndoStack((stack) => [...stack, prev]);
      return next;
    });
  }, []);

  const moveEditingBy = useCallback((dx: number, dy: number) => {
    if (dx === 0 && dy === 0) return;
    setEditingPoints((prev) => prev.map((point) => ({ x: point.x + dx, y: point.y + dy })));
  }, []);

  const resetEditing = useCallback(() => {
    setEditingAreaId(null);
    setEditingPoints([]);
    setEditingOriginalPoints([]);
    setEditingUndoStack([]);
    setEditingAreaSnapshot(null);
  }, []);

  const undoEdit = useCallback(() => {
    if (editingUndoStack.length === 0) return;
    const next = [...editingUndoStack];
    const last = next.pop();
    if (last) {
      setEditingPoints(last);
      setEditingUndoStack(next);
    }
  }, [editingUndoStack]);

  return {
    editingAreaId,
    editingPoints,
    editingOriginalPoints,
    editingUndoStack,
    isEditAreaDialogOpen,
    editingAreaSnapshot,
    contextMenu,
    isEditing,
    setEditingAreaId,
    setIsEditAreaDialogOpen,
    setEditingAreaSnapshot,
    startEditingArea,
    openEditInfo,
    openContextMenu,
    closeContextMenu,
    updateEditingPoint,
    removeEditingPointAt,
    insertEditingPointAtNearestEdge,
    moveEditingBy,
    resetEditing,
    undoEdit,
    setEditingOriginalPoints,
    setEditingUndoStack,
  };
}
