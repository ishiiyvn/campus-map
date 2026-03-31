"use client";

import type Konva from "konva";
import { useCallback } from "react";
import { useSmoothZoom } from "@/components/maps/hooks/use-smooth-zoom";

interface UseStageZoomOptions {
  stageRef: React.RefObject<Konva.Stage | null>;
  viewportConfig: { zoom: number; center: [number, number]; minzoom?: number; maxzoom?: number };
  onScaleUpdate: (newScale: number) => void;
}

export function useStageZoom({ stageRef, viewportConfig, onScaleUpdate }: UseStageZoomOptions) {
  const { handleWheel, setScale, minZoom, maxZoom, startInertia, handleDragEnd, stopInertia } = useSmoothZoom(stageRef);

  const onWheel = useCallback(
    (event: Konva.KonvaEventObject<WheelEvent>) => {
      const newScale = handleWheel(event);
      if (newScale !== null) {
        onScaleUpdate(newScale);
      }
    },
    [handleWheel, onScaleUpdate]
  );

  return { onWheel, setScale, minZoom, maxZoom, startInertia, handleDragEnd, stopInertia };
}
