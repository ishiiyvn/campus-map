import { Circle, Group, Line } from "react-konva";
import Konva from "konva";
import type { AreaPoint } from "../utils/types";

interface DraftAreaLayerProps {
  points: AreaPoint[];
  flatPoints: number[];
  pointRadius: number;
  canDrag: boolean;
  onGroupDragStart: () => void;
  onGroupDragEnd: (event: Konva.KonvaEventObject<DragEvent>) => void;
  onGroupMouseEnter: () => void;
  onGroupMouseLeave: () => void;
  onGroupDragMove: () => void;
  onInsertPoint: (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onPointMove: (index: number, point: AreaPoint) => void;
  onPointRemove: (index: number) => void;
  onPointDragStart: () => void;
  onPointDragEnd: () => void;
  onPointHoverEnter: () => void;
  onPointHoverLeave: () => void;
}

export function DraftAreaLayer({
  points,
  flatPoints,
  pointRadius,
  canDrag,
  onGroupDragStart,
  onGroupDragEnd,
  onGroupMouseEnter,
  onGroupMouseLeave,
  onGroupDragMove,
  onInsertPoint,
  onPointMove,
  onPointRemove,
  onPointDragStart,
  onPointDragEnd,
  onPointHoverEnter,
  onPointHoverLeave,
}: DraftAreaLayerProps) {
  if (points.length === 0) return null;

  return (
    <Group
      draggable={canDrag}
      onDragStart={onGroupDragStart}
      onDragEnd={onGroupDragEnd}
      onMouseEnter={onGroupMouseEnter}
      onMouseLeave={onGroupMouseLeave}
      onDragMove={onGroupDragMove}
    >
      <Line
        name="draft-line"
        points={flatPoints}
        closed={points.length >= 3}
        fill="rgba(59,130,246,0.2)"
        stroke="#3b82f6"
        strokeWidth={2}
        dash={[8, 6]}
        hitStrokeWidth={15}
        onClick={onInsertPoint}
        onTap={onInsertPoint}
      />
      {points.map((point, index) => (
        <Circle
          key={`draft-point-${index}`}
          x={point.x}
          y={point.y}
          radius={pointRadius}
          fill="#3b82f6"
          stroke="#ffffff"
          strokeWidth={2}
          draggable={canDrag}
          onDragStart={(event) => {
            event.cancelBubble = true;
            onPointDragStart();
          }}
          onDragMove={(event) => {
            event.cancelBubble = true;
            const { x, y } = event.target.position();
            onPointMove(index, { x, y });
          }}
          onDragEnd={(event) => {
            event.cancelBubble = true;
            const { x, y } = event.target.position();
            onPointMove(index, { x, y });
            onPointDragEnd();
          }}
          onMouseDown={(event) => {
            event.cancelBubble = true;
            if (event.evt.shiftKey) {
              onPointRemove(index);
            }
          }}
          onTap={(event) => {
            event.cancelBubble = true;
          }}
          onContextMenu={(event) => {
            event.evt.preventDefault();
            event.cancelBubble = true;
            onPointRemove(index);
          }}
          onMouseEnter={onPointHoverEnter}
          onMouseLeave={onPointHoverLeave}
        />
      ))}
    </Group>
  );
}
