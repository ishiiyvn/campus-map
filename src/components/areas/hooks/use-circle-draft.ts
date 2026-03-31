"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { AreaPoint } from "@/components/areas/utils/types";
import { toast } from "sonner";

const CIRCLE_POINTS = 36;

export function useCircleDraft() {
  const [center, setCenter] = useState<AreaPoint | null>(null);
  const [radius, setRadius] = useState(0);
  const isDraggingRef = useRef(false);

  const hasCircle = center !== null && radius > 0;

  const circlePoints = useMemo((): AreaPoint[] => {
    if (!center || radius <= 0) return [];

    const points: AreaPoint[] = [];
    for (let i = 0; i < CIRCLE_POINTS; i++) {
      const angle = (i / CIRCLE_POINTS) * Math.PI * 2;
      points.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
      });
    }
    return points;
  }, [center, radius]);

  const circlePointsFlat = useMemo(
    () => circlePoints.flatMap((point) => [point.x, point.y]),
    [circlePoints],
  );

  const startCircle = useCallback((point: AreaPoint) => {
    setCenter(point);
    setRadius(10); // Small initial radius so circle is visible
    isDraggingRef.current = true;
  }, []);

  const updateRadius = useCallback((point: AreaPoint) => {
    if (!center) return;
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    setRadius(Math.sqrt(dx * dx + dy * dy));
  }, [center]);

  const finishDragging = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const moveCircleBy = useCallback((dx: number, dy: number) => {
    if (dx === 0 && dy === 0) return;
    setCenter((prev) => prev ? { x: prev.x + dx, y: prev.y + dy } : prev);
  }, []);

  const resetCircle = useCallback(() => {
    setCenter(null);
    setRadius(0);
    isDraggingRef.current = false;
  }, []);

  const getCirclePoints = useCallback((n: number = CIRCLE_POINTS): AreaPoint[] => {
    if (!center || radius <= 0) return [];

    const points: AreaPoint[] = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2;
      points.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
      });
    }
    return points;
  }, [center, radius]);

  const validate = useCallback((): boolean => {
    if (!center || radius <= 0) {
      toast.error("Dibuja un círculo válido");
      return false;
    }
    return true;
  }, [center, radius]);

  return {
    center,
    radius,
    hasCircle,
    circlePoints,
    circlePointsFlat,
    isDraggingRef,
    startCircle,
    updateRadius,
    finishDragging,
    moveCircleBy,
    resetCircle,
    getCirclePoints,
    validate,
  };
}
