"use client";

import { useState, useEffect, useRef } from "react";
import Konva from "konva";

export function useStagePosition(
  containerRef: React.RefObject<HTMLDivElement | null>,
  stageRef?: React.RefObject<Konva.Stage | null>
) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        let stageX = 0;
        let stageY = 0;

        if (stageRef?.current) {
          stageX = stageRef.current.x();
          stageY = stageRef.current.y();
        }

        setPosition({ x: containerRect.left + stageX, y: containerRect.top + stageY });
      }
    };

    updatePosition();

    const resizeObserver = new ResizeObserver(updatePosition);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [containerRef, stageRef]);

  return position;
}
