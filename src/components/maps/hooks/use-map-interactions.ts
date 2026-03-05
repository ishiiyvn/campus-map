"use client";

import { useCallback } from "react";

interface UseMapDragHandlersOptions {
  isDraggingRef: React.MutableRefObject<boolean>;
  updateCursor: (cursor: string) => void;
}

export function useMapInteractions({ isDraggingRef, updateCursor }: UseMapDragHandlersOptions) {
  const onDraftDragStart = useCallback(() => {
    isDraggingRef.current = true;
    updateCursor("grabbing");
  }, [isDraggingRef, updateCursor]);

  const onEditDragStart = useCallback(() => {
    isDraggingRef.current = true;
    updateCursor("grabbing");
  }, [isDraggingRef, updateCursor]);

  return {
    onDraftDragStart,
    onEditDragStart,
  };
}
