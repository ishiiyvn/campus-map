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
  const minZoom = 0.25;
  const maxZoom = 3;

  const setScale = useCallback(
    (newScale: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const clampedScale = Math.min(Math.max(newScale, minZoom), maxZoom);
      const stageWidth = stage.width();
      const stageHeight = stage.height();
      const centerX = stageWidth / 2;
      const centerY = stageHeight / 2;
      const newPos = {
        x: centerX - (centerX - stage.x()) * (clampedScale / stage.scaleX()),
        y: centerY - (centerY - stage.y()) * (clampedScale / stage.scaleX()),
      };
      stage.position(newPos);
      stage.scale({ x: clampedScale, y: clampedScale });
      stage.batchDraw();
    },
    [stageRef, minZoom, maxZoom],
  );

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
      const scaleBy = options?.scaleBy ?? 1.1;
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
    [stageRef, minZoom, maxZoom, options?.scaleBy],
  );
  return { handleWheel, setScale, minZoom, maxZoom };
}
