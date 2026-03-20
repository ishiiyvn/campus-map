import { Line } from "react-konva";
import Konva from "konva";

interface AreaLayerProps {
  areas: {
    id: number;
    points: number[];
    fill: string;
    stroke: string;
  }[];
  hiddenAreaId?: number | null;
  activeTool?: string;
  onAreaMenu: (areaId: number, event: Konva.KonvaEventObject<MouseEvent>) => void;
  onAreaClick?: (areaId: number, event: Konva.KonvaEventObject<MouseEvent>) => void;
}

export function AreaLayer({ areas, hiddenAreaId, activeTool, onAreaMenu, onAreaClick }: AreaLayerProps) {
  const handleClick = (areaId: number, event: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool === "add_poi" && onAreaClick) {
      onAreaClick(areaId, event);
      return;
    }
    if (activeTool === "select" || activeTool === undefined) {
      onAreaMenu(areaId, event);
    }
  };

  return (
    <>
      {areas
        .filter((area) => area.id !== hiddenAreaId)
        .map((area) => (
          <Line
            key={area.id}
            points={area.points}
            closed
            fill={area.fill}
            stroke={area.stroke}
            strokeWidth={2}
            onClick={(event) => handleClick(area.id, event)}
            onContextMenu={(event) => onAreaMenu(area.id, event)}
          />
        ))}
    </>
  );
}
