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
  onAreaMenu: (areaId: number, event: Konva.KonvaEventObject<MouseEvent>) => void;
}

export function AreaLayer({ areas, hiddenAreaId, onAreaMenu }: AreaLayerProps) {
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
            onClick={(event) => onAreaMenu(area.id, event)}
            onContextMenu={(event) => onAreaMenu(area.id, event)}
          />
        ))}
    </>
  );
}
