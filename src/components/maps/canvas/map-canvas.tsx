"use client";

import { Stage, Layer, Image as KonvaImage, Group, Circle } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { MapOutput } from "@/lib/validators/map";
import { PointOfInterest } from "@/server/db/schema";
import { EditorTool } from "@/components/maps/editor-tools/map-editor-toolbar";
import { cn } from "@/lib/utils";


type KonvaEvent<E> = Konva.KonvaEventObject<E>;


interface MapCanvasProps {
  mapData: MapOutput;
  pois: PointOfInterest[];
  stageSize: { width: number; height: number };
  stageRef: React.RefObject<Konva.Stage | null>;
  activeTool: EditorTool;
  onWheel: (event: KonvaEvent<WheelEvent>) => void;
  onStageClick: (event: KonvaEvent<MouseEvent | TouchEvent>) => void;
  onStageTap: (event: KonvaEvent<MouseEvent | TouchEvent>) => void;
  onPoiClick: (event: KonvaEvent<MouseEvent | TouchEvent>, poi: PointOfInterest) => void;
  onPoiTap: (event: KonvaEvent<MouseEvent | TouchEvent>, poi: PointOfInterest) => void;
  onPoiMouseEnter: (event: KonvaEvent<MouseEvent | TouchEvent>) => void;
  onPoiMouseLeave: (event: KonvaEvent<MouseEvent | TouchEvent>) => void;
}

// Module-scoped storage for stable temporary POI ids for objects without
// server-side ids. WeakMap lets entries be GC'd when the POI objects are
// no longer referenced.
const POI_TEMP_ID_MAP = new WeakMap<object, string>();
let POI_NEXT_TEMP_ID = 0;

const URLImage = ({ src, width, height }: { src: string; width: number; height: number }) => {
  const [image, status] = useImage(src, "anonymous");

  if (status !== "loaded" || !image) {
    return null;
  }

  return <KonvaImage image={image} width={width} height={height} />;
};


export function MapCanvas({
  mapData,
  pois,
  stageSize,
  stageRef,
  activeTool,
  onWheel,
  onStageClick,
  onStageTap,
  onPoiClick,
  onPoiTap,
  onPoiMouseEnter,
  onPoiMouseLeave,
}: MapCanvasProps) {

  const cursorClass = activeTool === "add_poi" ? "cursor-crosshair" : "cursor-move";
  const cursorStyle = activeTool === "add_poi" ? "crosshair" : "move";

  // Use a module-scoped WeakMap and counter to store stable temporary IDs for
  // POI objects that don't have a server id. Using a WeakMap avoids accessing
  // ref.current during render (which ESLint flags).

  return (
    <Stage
      width={stageSize.width}
      height={stageSize.height}
      onWheel={onWheel}
      onClick={onStageClick}
      onTap={onStageTap}
      draggable={activeTool === "select"}
      ref={stageRef}
      className={cn(cursorClass)}
      style={{ cursor: cursorStyle }}
    >
      <Layer>
        <URLImage src={mapData.map_image_url} width={mapData.map_width} height={mapData.map_height} />
      </Layer>

      <Layer>
        {pois.map((poi) => {
          // Prefer the persistent server id when available
          let key: string | number;
          if (poi.id !== undefined && poi.id !== null) {
            key = poi.id;
          } else {
            // Assign or reuse a stable temporary id for this POI object
            if (!POI_TEMP_ID_MAP.has(poi)) {
              POI_TEMP_ID_MAP.set(poi, `temp-${++POI_NEXT_TEMP_ID}`);
            }
            key = POI_TEMP_ID_MAP.get(poi)!;
          }

          return (
            <Group
              key={key}
              x={poi.x_coordinate}
              y={poi.y_coordinate}
              onClick={(event) => onPoiClick(event, poi)}
              onTap={(event) => onPoiTap(event, poi)}
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
          );
        })}
      </Layer>
    </Stage>
  );
}
