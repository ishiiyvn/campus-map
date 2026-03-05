"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Konva from "konva";

export function useMapStage(stageRef: React.RefObject<Konva.Stage | null>, deps: { width: number; height: number }) {
  const [stageScale, setStageScale] = useState(1);
  const isDraggingRef = useRef(false);

  const updateScaleFromStage = useCallback(() => {
    const stage = stageRef.current;
    if (stage) {
      setStageScale(stage.scaleX());
    }
  }, [stageRef]);

  const getPointerMapPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    return transform.point(pointer);
  }, [stageRef]);

  useEffect(() => {
    updateScaleFromStage();
  }, [deps.width, deps.height, updateScaleFromStage]);

  return {
    stageScale,
    isDraggingRef,
    updateScaleFromStage,
    getPointerMapPosition,
  };
}
