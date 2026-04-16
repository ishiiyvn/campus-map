"use client";

import { useCallback, useMemo, useRef } from "react";
import Konva from "konva";

interface PoiInteractionsAdapter {
  isEditMode: boolean;
  activeTool: string;
  handleStageClick: (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
}

interface UseStageInteractionsOptions {
  stageRef: React.RefObject<Konva.Stage | null>;
  isDraggingRef: React.MutableRefObject<boolean>;
  editingAreaId: number | null;
  editingPoints: Array<{ x: number; y: number }>;
  insertEditingPointAtNearestEdge: (point: { x: number; y: number }) => void;
  getPointerMapPosition: () => { x: number; y: number } | null;
  poiInteractions: PoiInteractionsAdapter;
  onDragEnd?: (velocityX: number, velocityY: number) => void;
  onStageBackgroundClick?: () => void;
}

export function useStageInteractions({
  stageRef,
  isDraggingRef,
  editingAreaId,
  editingPoints,
  insertEditingPointAtNearestEdge,
  getPointerMapPosition,
  poiInteractions,
  onDragEnd,
  onStageBackgroundClick,
}: UseStageInteractionsOptions) {
  const lastPosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  const setCursor = useCallback(
    (cursor: string) => {
      const container = stageRef.current?.container();
      if (container) {
        container.style.cursor = cursor;
      }
    },
    [stageRef]
  );

  const onStageClick = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>, isTap: boolean) => {
      if (isDraggingRef.current) return;

      if (editingAreaId !== null) {
        if (poiInteractions.isEditMode && event.target === event.target.getStage()) {
          if (editingPoints.length >= 3 && (isTap || (event.evt as MouseEvent).button === 0)) {
            const point = getPointerMapPosition();
            if (point) {
              insertEditingPointAtNearestEdge(point);
            }
          }
        }
        return;
      }

      if (event.target === event.target.getStage()) {
        onStageBackgroundClick?.();
      }

      poiInteractions.handleStageClick(event);
    },
    [
      editingAreaId,
      editingPoints.length,
      getPointerMapPosition,
      insertEditingPointAtNearestEdge,
      isDraggingRef,
      onStageBackgroundClick,
      poiInteractions,
    ]
  );

  const handleClick = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent>) => {
      onStageClick(event, false);
    },
    [onStageClick]
  );

  const handleTap = useCallback(
    (event: Konva.KonvaEventObject<TouchEvent>) => {
      onStageClick(event, true);
    },
    [onStageClick]
  );

  const handleDragStart = useCallback(
    (event: Konva.KonvaEventObject<DragEvent>) => {
      isDraggingRef.current = true;
      const stage = stageRef.current;
      if (stage) {
        lastPosRef.current = { x: stage.x(), y: stage.y(), time: Date.now() };
      }
    },
    [isDraggingRef, stageRef]
  );

  const handleDragMove = useCallback((event: Konva.KonvaEventObject<DragEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const now = Date.now();
    const dt = now - lastPosRef.current.time;
    if (dt > 0) {
      lastPosRef.current = { x: stage.x(), y: stage.y(), time: now };
    }
  }, [stageRef]);

  const handleDragEnd = useCallback(
    (event: Konva.KonvaEventObject<DragEvent>) => {
      isDraggingRef.current = false;
      const stage = stageRef.current;
      if (!stage || !onDragEnd) return;

      const now = Date.now();
      const dt = now - lastPosRef.current.time;
      if (dt > 0 && dt < 100) {
        const velocityX = (stage.x() - lastPosRef.current.x) / dt;
        const velocityY = (stage.y() - lastPosRef.current.y) / dt;
        onDragEnd(velocityX, velocityY);
      }
    },
    [isDraggingRef, onDragEnd, stageRef]
  );

  const isPointerTool =
    poiInteractions.activeTool === "add_poi" || poiInteractions.activeTool === "add_area";

  const stageProps = useMemo(
    () => ({
      onClick: handleClick,
      onTap: handleTap,
      onDragStart: handleDragStart,
      onDragMove: handleDragMove,
      onDragEnd: handleDragEnd,
      draggable: poiInteractions.activeTool === "select" || poiInteractions.activeTool === "add_area",
      className: isPointerTool ? "cursor-crosshair" : "cursor-move",
      style: {
        cursor: isPointerTool ? "crosshair" : "move",
      },
    }),
    [
      handleClick,
      handleDragEnd,
      handleDragMove,
      handleDragStart,
      handleTap,
      isPointerTool,
      poiInteractions.activeTool,
    ]
  );

  return {
    setCursor,
    stageProps,
  };
}
