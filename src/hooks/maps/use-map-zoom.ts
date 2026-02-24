import { useCallback } from "react";
import Konva from "konva";
import { MapOutput } from "@/lib/validators/map";
type ViewportConfig = MapOutput["viewport_config"];
interface UseMapZoomOptions {
  scaleBy?: number;
}
export function useMapZoom(
  stageRef: React.RefObject<Konva.Stage | null>,
  viewportConfig?: ViewportConfig,
  options?: UseMapZoomOptions,
) {
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
      const scaleBy = options?.scaleBy ?? 1.1;
      const minZoom = viewportConfig?.minzoom ?? 0.1;
      const maxZoom = viewportConfig?.maxzoom ?? 5;
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };
      let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      newScale = Math.min(Math.max(newScale, minZoom), maxZoom);
      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      stage.position(newPos);
      stage.scale({ x: newScale, y: newScale });
      stage.batchDraw();
    },
    [stageRef, viewportConfig?.minzoom, viewportConfig?.maxzoom, options?.scaleBy],
  );
  return { handleWheel };
}
