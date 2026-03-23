"use client";

import { memo, useMemo } from "react";
import { Layer, Group, Text, Rect } from "react-konva";
import Konva from "konva";
import { PointOfInterest, Category } from "@/server/db/schema";

interface PoiLayerProps {
  pois: PointOfInterest[];
  categories: Category[];
  isEditMode: boolean;
  onPoiContextMenu: (poi: PointOfInterest, screenPos: { x: number; y: number }) => void;
  onPoiMouseEnter: (event: Konva.KonvaEventObject<MouseEvent>) => void;
  onPoiMouseLeave: (event: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const PoiLayer = memo(function PoiLayer({
  pois,
  categories,
  isEditMode,
  onPoiContextMenu,
  onPoiMouseEnter,
  onPoiMouseLeave,
}: PoiLayerProps) {
  const categoryMap = useMemo(() => {
    const map = new Map<number, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const textPois = useMemo(() => {
    return pois.filter((poi) => {
      const category = categoryMap.get(poi.category_id);
      return category?.display_type === "text";
    });
  }, [pois, categoryMap]);

  return (
    <Layer>
      {textPois.map((poi) => {
        const category = categoryMap.get(poi.category_id);
        const color = poi.icon_color || category?.color || "#3b82f6";

        return (
          <Group
            key={poi.id}
            x={poi.x_coordinate}
            y={poi.y_coordinate}
            onMouseEnter={onPoiMouseEnter}
            onMouseLeave={onPoiMouseLeave}
            onClick={(event) => {
              if (!isEditMode) return;
              event.cancelBubble = true;
              onPoiContextMenu(poi, {
                x: event.evt.clientX,
                y: event.evt.clientY,
              });
            }}
            onContextMenu={(event) => {
              event.cancelBubble = true;
              if (!isEditMode) {
                event.evt.preventDefault();
                return;
              }
              event.evt.preventDefault();
              onPoiContextMenu(poi, {
                x: event.evt.clientX,
                y: event.evt.clientY,
              });
            }}
          >
            <Rect
              x={-40}
              y={-12}
              width={80}
              height={24}
              fill={color}
              cornerRadius={4}
              shadowColor="black"
              shadowBlur={5}
              shadowOpacity={0.3}
            />
            <Text
              text={poi.name.length > 10 ? poi.name.substring(0, 10) + "..." : poi.name}
              x={-40}
              y={-8}
              width={80}
              align="center"
              fontSize={12}
              fontStyle="bold"
              fill="white"
            />
          </Group>
        );
      })}
    </Layer>
  );
});
