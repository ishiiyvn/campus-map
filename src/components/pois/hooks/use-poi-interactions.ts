import { useCallback, useState } from "react";
import Konva from "konva";
import { PointOfInterest, Area } from "@/server/db/schema";
import { EditorTool } from "@/components/maps/editor-tools/map-editor-toolbar";
import { findAreaContainingPoint } from "@/lib/point-utils";

interface UsePoiInteractionsOptions {
  onViewPoi?: (poi: PointOfInterest) => void;
  onAreaPointAdd?: (point: { x: number; y: number }) => void;
  onPoiEdit?: (poi: PointOfInterest) => void;
  areas?: Area[];
}

export function usePoiInteractions(
  stageRef: React.RefObject<Konva.Stage | null>,
  options?: UsePoiInteractionsOptions,
) {

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTool, setActiveTool] = useState<EditorTool>("select");
  const [newPoiLocation, setNewPoiLocation] = useState<{ x: number; y: number; areaId: number | null } | null>(null);
  const [activePoi, setActivePoi] = useState<PointOfInterest | null>(null);
  const [activePoiForEdit, setActivePoiForEdit] = useState<PointOfInterest | null>(null);

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
        const area = options?.areas ? findAreaContainingPoint(mapPoint.x, mapPoint.y, options.areas) : null;
        setNewPoiLocation({ x: mapPoint.x, y: mapPoint.y, areaId: area?.id ?? null });
        resetToolToSelect();
      }
      if (activeTool === "add_area") {
        options?.onAreaPointAdd?.({ x: mapPoint.x, y: mapPoint.y });
      }
    },
    [activeTool, isEditMode, options, resetToolToSelect, transformPointerToMap],
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
    activePoiForEdit,
    setActivePoiForEdit,
    handleStageClick,
    handlePoiMouseEnter,
    handlePoiMouseLeave,
  };
}
