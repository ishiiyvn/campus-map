"use client";

import type Konva from "konva";
import { useCallback } from "react";
import { useMapZoom } from "@/components/maps/hooks/use-map-zoom";

interface UseStageZoomOptions {
  stageRef: React.RefObject<Konva.Stage | null>;
  viewportConfig: { zoom: number; center: [number, number]; minzoom?: number; maxzoom?: number };
  onScaleUpdate: () => void;
}

export function useStageZoom({ stageRef, viewportConfig, onScaleUpdate }: UseStageZoomOptions) {
  const { handleWheel, setScale, minZoom, maxZoom } = useMapZoom(stageRef, viewportConfig);

  const onWheel = useCallback(
    (event: Konva.KonvaEventObject<WheelEvent>) => {
      handleWheel(event);
      onScaleUpdate();
    },
    [handleWheel, onScaleUpdate]
  );

  return { onWheel, setScale, minZoom, maxZoom };
}
