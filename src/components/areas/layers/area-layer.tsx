import { memo, useState } from "react";
import { Group, Line, Text } from "react-konva";
import Konva from "konva";

interface AreaItem {
  id: number;
  name: string;
  points: number[];
  fill: string;
  stroke: string;
  labelX: number;
  labelY: number;
}

interface AreaLayerProps {
  areas: AreaItem[];
  hiddenAreaId?: number | null;
  focusedAreaId?: number | null;
  isEditMode?: boolean;
  activeTool?: string;
  onAreaContextMenu: (areaId: number, screenPos: { x: number; y: number }) => void;
  onAreaClick?: (areaId: number, event: Konva.KonvaEventObject<MouseEvent>) => void;
  onAreaSelect?: (areaId: number) => void;
}

function AreaLine({
  area,
  focusedAreaId,
  isEditMode,
  activeTool,
  onAreaContextMenu,
  onAreaClick,
  onAreaSelect,
}: {
  area: AreaItem;
  focusedAreaId?: number | null;
  isEditMode?: boolean;
  activeTool?: string;
  onAreaContextMenu: (areaId: number, screenPos: { x: number; y: number }) => void;
  onAreaClick?: (areaId: number, event: Konva.KonvaEventObject<MouseEvent>) => void;
  onAreaSelect?: (areaId: number) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  const updateHoverPosition = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) return;
    const scale = stage.scaleX() || 1;
    setHoverPosition({
      x: (pointer.x - stage.x()) / scale,
      y: (pointer.y - stage.y()) / scale,
    });
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isEditMode) {
      e.cancelBubble = true;
      onAreaSelect?.(area.id);
      return;
    }
    if (activeTool === "add_poi" && onAreaClick) {
      onAreaClick(area.id, e);
      return;
    }
    e.cancelBubble = true;
    onAreaContextMenu(area.id, { x: e.evt.clientX, y: e.evt.clientY });
  };

  const handleContextMenu = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isEditMode) return;
    e.cancelBubble = true;
    e.evt.preventDefault();
    onAreaContextMenu(area.id, { x: e.evt.clientX, y: e.evt.clientY });
  };

  const hasFocus = focusedAreaId !== null && focusedAreaId !== undefined;
  const isFocused = focusedAreaId === area.id;

  return (
    <Group>
      <Line
        points={area.points}
        closed
        fill={area.fill}
        stroke={area.stroke}
        strokeWidth={hasFocus ? (isFocused ? 3 : 1.5) : 2}
        opacity={hasFocus ? (isFocused ? 1 : 0.25) : 1}
        onMouseEnter={(e) => {
          setIsHovered(true);
          updateHoverPosition(e);
        }}
        onMouseMove={updateHoverPosition}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoverPosition(null);
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      />
      {isHovered && hoverPosition && (
        <Text
          x={hoverPosition.x + 6}
          y={hoverPosition.y - 14}
          text={area.name}
          fontSize={14}
          fontStyle="bold"
          fill="#0f172a"
          listening={false}
        />
      )}
    </Group>
  );
}

export const AreaLayer = memo(function AreaLayer({
  areas,
  hiddenAreaId,
  focusedAreaId,
  isEditMode,
  activeTool,
  onAreaContextMenu,
  onAreaClick,
  onAreaSelect,
}: AreaLayerProps) {
  return (
    <>
      {areas
        .filter((area) => area.id !== hiddenAreaId)
        .map((area) => (
          <AreaLine
            key={area.id}
            area={area}
            focusedAreaId={focusedAreaId}
            isEditMode={isEditMode}
            activeTool={activeTool}
            onAreaContextMenu={onAreaContextMenu}
            onAreaClick={onAreaClick}
            onAreaSelect={onAreaSelect}
          />
        ))}
    </>
  );
});
