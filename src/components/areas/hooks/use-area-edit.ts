"use client";

import { useCallback, useRef, useState } from "react";
import type { Area } from "@/server/db/schema";
import type { AreaPoint } from "@/components/areas/utils/types";
import { insertPointBetweenNearestEdges } from "@/components/areas/utils/geometry";
import { arePointsEqual } from "@/components/areas/utils/points";

export function useAreaEdit() {
  const [editingAreaId, setEditingAreaId] = useState<number | null>(null);
  const [editingPoints, setEditingPoints] = useState<AreaPoint[]>([]);
  const [editingOriginalPoints, setEditingOriginalPoints] = useState<AreaPoint[]>([]);
  const [editingUndoStack, setEditingUndoStack] = useState<AreaPoint[][]>([]);
  const [isEditAreaDialogOpen, setIsEditAreaDialogOpen] = useState(false);
  const [editingAreaSnapshot, setEditingAreaSnapshot] = useState<Area | null>(null);
  const isEditingDragRef = useRef(false);

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

  const updateEditingPoint = useCallback((index: number, point: AreaPoint) => {
    setEditingPoints((prev) => prev.map((item, i) => (i === index ? point : item)));
  }, []);

  const removeEditingPointAt = useCallback((index: number) => {
    setEditingPoints((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.filter((_, i) => i !== index);
      if (!arePointsEqual(prev, next)) {
        setEditingUndoStack((stack) => [...stack, prev]);
      }
      return next;
    });
  }, []);

  const insertEditingPointAtNearestEdge = useCallback((point: AreaPoint) => {
    setEditingPoints((prev) => {
      const next = insertPointBetweenNearestEdges(prev, point);
      if (!arePointsEqual(prev, next)) {
        setEditingUndoStack((stack) => [...stack, prev]);
      }
      return next;
    });
  }, []);

  const moveEditingBy = useCallback((dx: number, dy: number) => {
    if (dx === 0 && dy === 0) return;
    setEditingPoints((prev) => prev.map((point) => ({ x: point.x + dx, y: point.y + dy })));
  }, []);

  const beginEditingDrag = useCallback(() => {
    if (isEditingDragRef.current) return;
    if (editingPoints.length === 0) return;
    setEditingUndoStack((stack) => [...stack, editingPoints]);
    isEditingDragRef.current = true;
  }, [editingPoints]);

  const endEditingDrag = useCallback(() => {
    isEditingDragRef.current = false;
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingAreaId(null);
    setEditingPoints([]);
    setEditingOriginalPoints([]);
    setEditingUndoStack([]);
    setEditingAreaSnapshot(null);
  }, []);

  const undoEditing = useCallback(() => {
    if (editingUndoStack.length === 0) return;
    const current = editingPoints;
    const next = [...editingUndoStack];
    while (next.length > 0) {
      const last = next.pop();
      if (last && !arePointsEqual(last, current)) {
        while (next.length > 0 && arePointsEqual(next[next.length - 1]!, last)) {
          next.pop();
        }
        setEditingPoints(last);
        setEditingUndoStack(next);
        return;
      }
    }
    setEditingUndoStack(next);
  }, [editingPoints, editingUndoStack]);

  return {
    editingAreaId,
    editingPoints,
    editingOriginalPoints,
    editingUndoStack,
    isEditAreaDialogOpen,
    editingAreaSnapshot,
    isEditing,
    setEditingAreaId,
    setIsEditAreaDialogOpen,
    setEditingAreaSnapshot,
    startEditingArea,
    openEditInfo,
    updateEditingPoint,
    removeEditingPointAt,
    insertEditingPointAtNearestEdge,
    moveEditingBy,
    beginEditingDrag,
    endEditingDrag,
    cancelEditing,
    undoEditing,
    setEditingOriginalPoints,
    setEditingUndoStack,
  };
}
