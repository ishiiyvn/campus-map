import { useCallback, useState } from "react";
import Konva from "konva";
import { PointOfInterest } from "@/server/db/schema";
import { EditorTool } from "@/components/maps/editor-tools/map-editor-toolbar";

interface UsePoiInteractionsOptions {
  onViewPoi?: (poi: PointOfInterest) => void;
  onAreaPointAdd?: (point: { x: number; y: number }) => void;
}

export function usePoiInteractions(
  stageRef: React.RefObject<Konva.Stage | null>,
  options?: UsePoiInteractionsOptions,
) {

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTool, setActiveTool] = useState<EditorTool>("select");
  const [newPoiLocation, setNewPoiLocation] = useState<{ x: number; y: number } | null>(null);
  const [activePoi, setActivePoi] = useState<PointOfInterest | null>(null);

  const resetToolToSelect = useCallback(() => {
    setActiveTool("select");
  }, []);

  const transformPointerToMap = useCallback(
    (pointer: { x: number; y: number }) => {
      const stage = stageRef.current;
      if (!stage) return null;
      const transform = stage.getAbsoluteTransform().copy();
      transform.invert();
      return transform.point(pointer);
    },
    [stageRef],
  );

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!isEditMode) return;
      const stage = e.target.getStage();
      if (!stage) return;
      if (e.target !== stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const mapPoint = transformPointerToMap(pointer);
      if (!mapPoint) return;
      if (activeTool === "add_poi") {
        setNewPoiLocation({ x: mapPoint.x, y: mapPoint.y });
        resetToolToSelect();
      }
      if (activeTool === "add_area") {
        options?.onAreaPointAdd?.({ x: mapPoint.x, y: mapPoint.y });
      }
    },
    [activeTool, isEditMode, options, resetToolToSelect, transformPointerToMap],
  );

  const handlePoiClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, poi: PointOfInterest) => {
      e.cancelBubble = true;
      if (isEditMode && activeTool === "select") {
        setActivePoi(poi);
        return;
      }
      options?.onViewPoi?.(poi);
    },
    [activeTool, isEditMode, options],
  );

  const handlePoiMouseEnter = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (activeTool === "add_poi" || activeTool === "add_area") return;
      e.target.getStage()?.container()?.style && (e.target.getStage()!.container()!.style.cursor = "pointer");
    },
    [activeTool],
  );

  const handlePoiMouseLeave = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const container = e.target.getStage()?.container();
      if (container) {
        container.style.cursor = activeTool === "add_poi" || activeTool === "add_area" ? "crosshair" : "move";
      }
    },
    [activeTool],
  );

  return {
    isEditMode,
    setIsEditMode,
    activeTool,
    setActiveTool,
    newPoiLocation,
    setNewPoiLocation,
    activePoi,
    setActivePoi,
    handleStageClick,
    handlePoiClick,
    handlePoiMouseEnter,
    handlePoiMouseLeave,
  };
}
