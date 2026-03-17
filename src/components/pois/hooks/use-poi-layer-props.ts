import { useMemo } from "react";
import Konva from "konva";
import { PointOfInterest } from "@/server/db/schema";

interface UsePoiLayerPropsOptions {
  pois: PointOfInterest[];
  onPoiClick: (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>, poi: PointOfInterest) => void;
  onPoiMouseEnter: (event: Konva.KonvaEventObject<MouseEvent>) => void;
  onPoiMouseLeave: (event: Konva.KonvaEventObject<MouseEvent>) => void;
}

export function usePoiLayerProps({
  pois,
  onPoiClick,
  onPoiMouseEnter,
  onPoiMouseLeave,
}: UsePoiLayerPropsOptions) {
  return useMemo(
    () => ({
      pois,
      onPoiClick,
      onPoiMouseEnter,
      onPoiMouseLeave,
    }),
    [pois, onPoiClick, onPoiMouseEnter, onPoiMouseLeave],
  );
}
