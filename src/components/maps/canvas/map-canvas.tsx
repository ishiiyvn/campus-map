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

const URLImage = ({ src, width, height }: { src: string; width: number; height: number }) => {
  const [image] = useImage(src);
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
        <URLImage
          src={mapData.map_image_url}
          width={mapData.map_width}
          height={mapData.map_height}
        />
      </Layer>
      <Layer>
        {pois.map((poi) => (
          <Group
            key={poi.id ?? `temp-${Math.random()}`}
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
        ))}
      </Layer>
    </Stage>
  );
}
