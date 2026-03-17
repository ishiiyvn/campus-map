"use client";

import { useCallback } from "react";
import Konva from "konva";

interface UseAreaDragHandlersOptions {
  isDraggingRef: React.MutableRefObject<boolean>;
  setCursor: (cursor: string) => void;
  moveDraftBy: (dx: number, dy: number) => void;
  moveEditingBy: (dx: number, dy: number) => void;
  endDraftDrag: () => void;
  endEditingDrag: () => void;
}

export function useAreaDragHandlers({
  isDraggingRef,
  setCursor,
  moveDraftBy,
  moveEditingBy,
  endDraftDrag,
  endEditingDrag,
}: UseAreaDragHandlersOptions) {
  const handleDraftDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>) => {
    const node = event.target;
    const dx = node.x();
    const dy = node.y();
    if (dx !== 0 || dy !== 0) {
      moveDraftBy(dx, dy);
      node.position({ x: 0, y: 0 });
    }
    isDraggingRef.current = false;
    setCursor("crosshair");
    endDraftDrag();
  }, [endDraftDrag, isDraggingRef, moveDraftBy, setCursor]);

  const handleEditDragEnd = useCallback((event: Konva.KonvaEventObject<DragEvent>) => {
    const node = event.target;
    const dx = node.x();
    const dy = node.y();
    if (dx !== 0 || dy !== 0) {
      moveEditingBy(dx, dy);
      node.position({ x: 0, y: 0 });
    }
    isDraggingRef.current = false;
    setCursor("crosshair");
    endEditingDrag();
  }, [endEditingDrag, isDraggingRef, moveEditingBy, setCursor]);

  return {
    handleDraftDragEnd,
    handleEditDragEnd,
  };
}
