"use client";

import { useCallback, useMemo, useState } from "react";
import type { AreaPoint } from "@/components/areas/map/types";
import { insertPointBetweenNearestEdges } from "@/components/areas/map/geometry";

export function useAreaDraft() {
  const [draftAreaPoints, setDraftAreaPoints] = useState<AreaPoint[]>([]);
  const [draftUndoStack, setDraftUndoStack] = useState<AreaPoint[][]>([]);

  const draftAreaPointsFlat = useMemo(
    () => draftAreaPoints.flatMap((point) => [point.x, point.y]),
    [draftAreaPoints],
  );

  const addDraftPoint = useCallback((point: AreaPoint) => {
    setDraftAreaPoints((prev) => {
      const next = insertPointBetweenNearestEdges(prev, point);
      setDraftUndoStack((stack) => [...stack, prev]);
      return next;
    });
  }, []);

  const insertDraftPointAtNearestEdge = useCallback((point: AreaPoint) => {
    setDraftAreaPoints((prev) => {
      const next = insertPointBetweenNearestEdges(prev, point);
      setDraftUndoStack((stack) => [...stack, prev]);
      return next;
    });
  }, []);

  const updateDraftPoint = useCallback((index: number, point: AreaPoint) => {
    setDraftAreaPoints((prev) => prev.map((item, i) => (i === index ? point : item)));
  }, []);

  const removeDraftPointAt = useCallback((index: number) => {
    setDraftAreaPoints((prev) => {
      if (prev.length === 0) return prev;
      setDraftUndoStack((stack) => [...stack, prev]);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const moveDraftBy = useCallback((dx: number, dy: number) => {
    if (dx === 0 && dy === 0) return;
    setDraftAreaPoints((prev) => prev.map((point) => ({ x: point.x + dx, y: point.y + dy })));
  }, []);

  const resetDraft = useCallback(() => {
    setDraftAreaPoints([]);
    setDraftUndoStack([]);
  }, []);

  const undoDraft = useCallback(() => {
    if (draftUndoStack.length === 0) return;
    const next = [...draftUndoStack];
    const last = next.pop();
    if (last) {
      setDraftAreaPoints(last);
      setDraftUndoStack(next);
    }
  }, [draftUndoStack]);

  return {
    draftAreaPoints,
    draftAreaPointsFlat,
    draftUndoStack,
    addDraftPoint,
    insertDraftPointAtNearestEdge,
    updateDraftPoint,
    removeDraftPointAt,
    moveDraftBy,
    resetDraft,
    undoDraft,
  };
}
