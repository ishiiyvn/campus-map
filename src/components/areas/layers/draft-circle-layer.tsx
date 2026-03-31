import { Circle, Group, Line } from "react-konva";
import Konva from "konva";
import type { AreaPoint } from "../utils/types";

interface DraftCircleLayerProps {
  center: AreaPoint;
  radius: number;
  circlePointsFlat: number[];
  dashArray: [number, number];
  canDrag: boolean;
  onGroupDragStart: () => void;
  onGroupDragEnd: (event: Konva.KonvaEventObject<DragEvent>) => void;
  onGroupDragMove: () => void;
  onGroupMouseEnter: () => void;
  onGroupMouseLeave: () => void;
  onRadiusHandleDrag: (point: AreaPoint) => void;
  onRadiusHandleDragEnd: () => void;
}

export function DraftCircleLayer({
  center,
  radius,
  circlePointsFlat,
  dashArray,
  canDrag,
  onGroupDragStart,
  onGroupDragEnd,
  onGroupDragMove,
  onGroupMouseEnter,
  onGroupMouseLeave,
  onRadiusHandleDrag,
  onRadiusHandleDragEnd,
}: DraftCircleLayerProps) {
  return (
    <Group
      draggable={canDrag}
      onDragStart={onGroupDragStart}
      onDragEnd={onGroupDragEnd}
      onMouseEnter={onGroupMouseEnter}
      onMouseLeave={onGroupMouseLeave}
      onDragMove={onGroupDragMove}
    >
      {radius > 0 && (
        <Line
          points={circlePointsFlat}
          closed
          fill="rgba(59,130,246,0.2)"
          stroke="#3b82f6"
          strokeWidth={2}
          dash={dashArray}
          hitStrokeWidth={15}
        />
      )}
      {/* Radius handle */}
      <Circle
        x={center.x + (radius || 10)}
        y={center.y}
        radius={6}
        fill="#3b82f6"
        stroke="#ffffff"
        strokeWidth={2}
        draggable
        onDragStart={(event) => {
          event.cancelBubble = true;
        }}
        onDragMove={(event) => {
          event.cancelBubble = true;
          const { x, y } = event.target.position();
          onRadiusHandleDrag({ x, y });
        }}
        onDragEnd={(event) => {
          event.cancelBubble = true;
          const { x, y } = event.target.position();
          onRadiusHandleDrag({ x, y });
          onRadiusHandleDragEnd();
        }}
      />
    </Group>
  );
}
