"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { AreaPoint } from "@/components/areas/utils/types";
import { insertPointBetweenNearestEdges } from "@/components/areas/utils/geometry";
import { arePointsEqual } from "@/components/areas/utils/points";
import { toast } from "sonner";

export function useAreaDraft() {
  const [draftAreaPoints, setDraftAreaPoints] = useState<AreaPoint[]>([]);
  const [draftUndoStack, setDraftUndoStack] = useState<AreaPoint[][]>([]);
  const isDraftDraggingRef = useRef(false);

  const draftAreaPointsFlat = useMemo(
    () => draftAreaPoints.flatMap((point) => [point.x, point.y]),
    [draftAreaPoints],
  );

  const addDraftPoint = useCallback((point: AreaPoint) => {
    setDraftAreaPoints((prev) => {
      const next = insertPointBetweenNearestEdges(prev, point);
      if (!arePointsEqual(prev, next)) {
        setDraftUndoStack((stack) => [...stack, prev]);
      }
      return next;
    });
  }, []);

  const updateDraftPoint = useCallback((index: number, point: AreaPoint) => {
    setDraftAreaPoints((prev) => prev.map((item, i) => (i === index ? point : item)));
  }, []);

  const removeDraftPointAt = useCallback((index: number) => {
    setDraftAreaPoints((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.filter((_, i) => i !== index);
      if (!arePointsEqual(prev, next)) {
        setDraftUndoStack((stack) => [...stack, prev]);
      }
      return next;
    });
  }, []);

  const moveDraftBy = useCallback((dx: number, dy: number) => {
    if (dx === 0 && dy === 0) return;
    setDraftAreaPoints((prev) => prev.map((point) => ({ x: point.x + dx, y: point.y + dy })));
  }, []);

  const beginDraftDrag = useCallback(() => {
    if (isDraftDraggingRef.current) return;
    if (draftAreaPoints.length === 0) return;
    setDraftUndoStack((stack) => [...stack, draftAreaPoints]);
    isDraftDraggingRef.current = true;
  }, [draftAreaPoints]);

  const endDraftDrag = useCallback(() => {
    isDraftDraggingRef.current = false;
  }, []);

  const resetDraft = useCallback(() => {
    setDraftAreaPoints([]);
    setDraftUndoStack([]);
  }, []);

  const openDraftDialogIfValid = useCallback((openDialog: () => void) => {
    if (draftAreaPoints.length < 3) {
      toast.error("Agrega al menos 3 puntos para crear un área");
      return false;
    }
    openDialog();
    return true;
  }, [draftAreaPoints]);

  const undoDraft = useCallback(() => {
    if (draftUndoStack.length === 0) return;
    const current = draftAreaPoints;
    const next = [...draftUndoStack];
    while (next.length > 0) {
      const last = next.pop();
      if (last && !arePointsEqual(last, current)) {
        while (next.length > 0 && arePointsEqual(next[next.length - 1]!, last)) {
          next.pop();
        }
        setDraftAreaPoints(last);
        setDraftUndoStack(next);
        return;
      }
    }
    setDraftUndoStack(next);
  }, [draftAreaPoints, draftUndoStack]);

  return {
    draftAreaPoints,
    draftAreaPointsFlat,
    draftUndoStack,
    addDraftPoint,
    updateDraftPoint,
    removeDraftPointAt,
    moveDraftBy,
    beginDraftDrag,
    endDraftDrag,
    resetDraft,
    openDraftDialogIfValid,
    undoDraft,
  };
}
