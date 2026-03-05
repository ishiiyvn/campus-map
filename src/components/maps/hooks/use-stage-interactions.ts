"use client";

import { useCallback, useMemo } from "react";
import Konva from "konva";

interface StageContextMenu {
  areaId: number;
  x: number;
  y: number;
}

interface PoiInteractionsAdapter {
  isEditMode: boolean;
  activeTool: string;
  handleStageClick: (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
}

interface UseStageInteractionsOptions {
  stageRef: React.RefObject<Konva.Stage | null>;
  isDraggingRef: React.MutableRefObject<boolean>;
  contextMenu: StageContextMenu | null;
  closeContextMenu: () => void;
  editingAreaId: number | null;
  editingPoints: Array<{ x: number; y: number }>;
  insertEditingPointAtNearestEdge: (point: { x: number; y: number }) => void;
  getPointerMapPosition: () => { x: number; y: number } | null;
  poiInteractions: PoiInteractionsAdapter;
}

export function useStageInteractions({
  stageRef,
  isDraggingRef,
  contextMenu,
  closeContextMenu,
  editingAreaId,
  editingPoints,
  insertEditingPointAtNearestEdge,
  getPointerMapPosition,
  poiInteractions,
}: UseStageInteractionsOptions) {
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

      if (contextMenu && event.target === event.target.getStage()) {
        closeContextMenu();
      }

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

      poiInteractions.handleStageClick(event);
    },
    [
      closeContextMenu,
      contextMenu,
      editingAreaId,
      editingPoints.length,
      getPointerMapPosition,
      insertEditingPointAtNearestEdge,
      isDraggingRef,
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

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
    if (contextMenu) {
      closeContextMenu();
    }
  }, [closeContextMenu, contextMenu, isDraggingRef]);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, [isDraggingRef]);

  const isPointerTool =
    poiInteractions.activeTool === "add_poi" || poiInteractions.activeTool === "add_area";

  const stageProps = useMemo(
    () => ({
      onClick: handleClick,
      onTap: handleTap,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      draggable: poiInteractions.activeTool === "select" || poiInteractions.activeTool === "add_area",
      className: isPointerTool ? "cursor-crosshair" : "cursor-move",
      style: {
        cursor: isPointerTool ? "crosshair" : "move",
      },
    }),
    [handleClick, handleDragEnd, handleDragStart, handleTap, isPointerTool, poiInteractions.activeTool]
  );

  return {
    setCursor,
    stageProps,
  };
}
