"use client";

import { Layer, Group, Circle } from "react-konva";
import Konva from "konva";
import { PointOfInterest } from "@/server/db/schema";

interface PoiLayerProps {
  pois: PointOfInterest[];
  onPoiClick: (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>, poi: PointOfInterest) => void;
  onPoiMouseEnter: (event: Konva.KonvaEventObject<MouseEvent>) => void;
  onPoiMouseLeave: (event: Konva.KonvaEventObject<MouseEvent>) => void;
}

export function PoiLayer({
  pois,
  onPoiClick,
  onPoiMouseEnter,
  onPoiMouseLeave,
}: PoiLayerProps) {
  return (
    <Layer>
      {pois.map((poi) => (
        <Group
          key={poi.id ?? `temp-${Math.random()}`}
          x={poi.x_coordinate}
          y={poi.y_coordinate}
          onClick={(event) => onPoiClick(event, poi)}
          onTap={(event) => onPoiClick(event, poi)}
          onMouseEnter={onPoiMouseEnter}
          onMouseLeave={onPoiMouseLeave}
        >
          <Circle
            radius={10}
            fill={poi.icon_color || "#ff0000"}
            stroke="white"
            strokeWidth={2}
            shadowColor="black"
            shadowBlur={5}
            shadowOpacity={0.3}
          />
        </Group>
      ))}
    </Layer>
  );
}
