import { memo } from "react";
import { Line } from "react-konva";
import Konva from "konva";

interface AreaItem {
  id: number;
  points: number[];
  fill: string;
  stroke: string;
}

interface AreaLayerProps {
  areas: AreaItem[];
  hiddenAreaId?: number | null;
  isEditMode?: boolean;
  activeTool?: string;
  onAreaContextMenu: (areaId: number, screenPos: { x: number; y: number }) => void;
  onAreaClick?: (areaId: number, event: Konva.KonvaEventObject<MouseEvent>) => void;
}

function AreaLine({
  area,
  isEditMode,
  activeTool,
  onAreaContextMenu,
  onAreaClick,
}: {
  area: AreaItem;
  isEditMode?: boolean;
  activeTool?: string;
  onAreaContextMenu: (areaId: number, screenPos: { x: number; y: number }) => void;
  onAreaClick?: (areaId: number, event: Konva.KonvaEventObject<MouseEvent>) => void;
}) {
  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isEditMode) return;
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

  return (
    <Line
      points={area.points}
      closed
      fill={area.fill}
      stroke={area.stroke}
      strokeWidth={2}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    />
  );
}

export const AreaLayer = memo(function AreaLayer({
  areas,
  hiddenAreaId,
  isEditMode,
  activeTool,
  onAreaContextMenu,
  onAreaClick,
}: AreaLayerProps) {
  return (
    <>
      {areas
        .filter((area) => area.id !== hiddenAreaId)
        .map((area) => (
          <AreaLine
            key={area.id}
            area={area}
            isEditMode={isEditMode}
            activeTool={activeTool}
            onAreaContextMenu={onAreaContextMenu}
            onAreaClick={onAreaClick}
          />
        ))}
    </>
  );
});
