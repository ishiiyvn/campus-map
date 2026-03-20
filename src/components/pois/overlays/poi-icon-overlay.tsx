"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Konva from "konva";
import { PointOfInterest, Category } from "@/server/db/schema";
import { getIconComponent } from "@/components/ui/icon-picker";

interface PoiIconOverlayProps {
  pois: PointOfInterest[];
  categories: Category[];
  stageScale: number;
  stageRef: React.RefObject<Konva.Stage | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isEditMode: boolean;
  repositioning: boolean;
  repositionPoiId: number | null;
  onPoiContextMenu: (poi: PointOfInterest, screenPos: { x: number; y: number }) => void;
  onPoiMove: (poiId: number, x: number, y: number) => void;
}

export function PoiIconOverlay({
  pois,
  categories,
  stageScale,
  stageRef,
  containerRef,
  isEditMode,
  repositioning,
  repositionPoiId,
  onPoiContextMenu,
  onPoiMove,
}: PoiIconOverlayProps) {
  const [dragState, setDragState] = useState<{
    poiId: number;
    startMouseX: number;
    startMouseY: number;
    startPoiX: number;
    startPoiY: number;
  } | null>(null);
  const [localPositions, setLocalPositions] = useState<Record<number, { x: number; y: number }>>({});
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updatePos = () => {
      if (stageRef.current) {
        const newX = stageRef.current.x();
        const newY = stageRef.current.y();
        setStagePos({ x: newX, y: newY });
      }
      isDirtyRef.current = false;
    };

    const loop = () => {
      if (isDirtyRef.current) {
        updatePos();
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    const handleStageChange = () => {
      isDirtyRef.current = true;
    };

    stage.on("dragmove", handleStageChange);
    stage.on("dragend", handleStageChange);
    stage.on("xChange", handleStageChange);
    stage.on("yChange", handleStageChange);

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      stage.off("dragmove", handleStageChange);
      stage.off("dragend", handleStageChange);
      stage.off("xChange", handleStageChange);
      stage.off("yChange", handleStageChange);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [stageRef]);

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !stageRef.current) return;

      const dx = (e.clientX - dragState.startMouseX) / stageScale;
      const dy = (e.clientY - dragState.startMouseY) / stageScale;

      const newX = dragState.startPoiX + dx;
      const newY = dragState.startPoiY + dy;

      setLocalPositions((prev) => ({
        ...prev,
        [dragState.poiId]: { x: newX, y: newY },
      }));
    };

    const handleMouseUp = () => {
      if (!dragState) return;

      const poi = pois.find((p) => p.id === dragState.poiId);
      if (!poi) return;

      const finalPos = localPositions[dragState.poiId] || { x: dragState.startPoiX, y: dragState.startPoiY };
      onPoiMove(dragState.poiId, finalPos.x, finalPos.y);
      setLocalPositions((prev) => {
        const next = { ...prev };
        delete next[dragState.poiId];
        return next;
      });
      setDragState(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, stageScale, containerRef, stageRef, pois, localPositions, onPoiMove]);

  const getCategoryById = (categoryId: number | null) => {
    if (!categoryId) return null;
    return categories.find((c) => c.id === categoryId) || null;
  };

  const iconSize = 32;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pois.map((poi) => {
        const category = getCategoryById(poi.category_id);
        const displayType = category?.display_type || "icon";
        const color = poi.icon_color || category?.color || "#3b82f6";
        const iconName = poi.icon || category?.icon;
        const IconComponent = iconName ? getIconComponent(iconName) : null;

        if (displayType === "text") return null;

        const isRepositioningThis = repositioning && repositionPoiId === poi.id;
        const localPos = localPositions[poi.id];
        const baseX = poi.x_coordinate * stageScale + stagePos.x - iconSize / 2;
        const baseY = poi.y_coordinate * stageScale + stagePos.y - iconSize / 2;
        const x = localPos ? localPos.x * stageScale + stagePos.x - iconSize / 2 : baseX;
        const y = localPos ? localPos.y * stageScale + stagePos.y - iconSize / 2 : baseY;

        if (
          x < -iconSize * 2 ||
          y < -iconSize * 2 ||
          x > (containerRef.current?.clientWidth ?? 0) + iconSize * 2 ||
          y > (containerRef.current?.clientHeight ?? 0) + iconSize * 2
        ) {
          return null;
        }

        const isDragging = dragState?.poiId === poi.id;

        const iconElement = IconComponent ? (
          <div
            className="w-full h-full rounded-full bg-white shadow-md flex items-center justify-center"
            style={{
              boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.3)" : undefined,
            }}
          >
            <div style={{ color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconComponent />
            </div>
          </div>
        ) : (
          <div
            className="w-full h-full rounded-full shadow-md flex items-center justify-center text-white font-bold text-xs"
            style={{
              backgroundColor: color,
              boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.3)" : undefined,
            }}
          >
            {poi.name.charAt(0).toUpperCase()}
          </div>
        );

        return (
          <div
            key={poi.id}
            className={`pointer-events-auto absolute transition-all ${isDragging ? "cursor-grabbing z-50 scale-125" : isRepositioningThis ? "cursor-grab" : isEditMode ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
            style={{
              left: x,
              top: y,
              width: iconSize,
              height: iconSize,
            }}
            onMouseDown={(e) => {
              if (!isRepositioningThis) return;
              if (e.button !== 0) return;
              e.preventDefault();

              setDragState({
                poiId: poi.id,
                startMouseX: e.clientX,
                startMouseY: e.clientY,
                startPoiX: poi.x_coordinate,
                startPoiY: poi.y_coordinate,
              });
            }}
            onClick={(e) => {
              if (repositioning) return;
              if (!isEditMode) return;
              e.preventDefault();
              e.stopPropagation();
              onPoiContextMenu(poi, { x: e.clientX, y: e.clientY });
            }}
            onContextMenu={(e) => {
              if (repositioning) return;
              if (!isEditMode) return;
              e.preventDefault();
              e.stopPropagation();
              onPoiContextMenu(poi, { x: e.clientX, y: e.clientY });
            }}
          >
            {iconElement}
          </div>
        );
      })}
    </div>
  );
}
