"use client";

import Konva from "konva";
import { Layer } from "react-konva";
import { AreaLayer } from "@/components/areas/layers/area-layer";
import { DraftAreaLayer } from "@/components/areas/layers/draft-area-layer";
import { EditAreaLayer } from "@/components/areas/layers/edit-area-layer";
import type { AreaPoint } from "@/components/areas/utils/types";

interface AreaRenderData {
  id: number;
  points: number[];
  fill: string;
  stroke: string;
}

interface AreasLayersGroupProps {
  data: {
    areaLines: AreaRenderData[];
    editingAreaId: number | null;
    editingPoints: AreaPoint[];
    draftPoints: AreaPoint[];
    draftPointsFlat: number[];
    pointRadius: number;
  };
  flags: {
    isEditMode: boolean;
    activeTool: string;
  };
  handlers: {
    onAreaMenu: (areaId: number, event: Konva.KonvaEventObject<MouseEvent>) => void;
    onEditGroupDragStart: () => void;
    onEditGroupDragEnd: (event: Konva.KonvaEventObject<DragEvent>) => void;
    onEditInsertPoint: (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
    onEditPointMove: (index: number, point: AreaPoint) => void;
    onEditPointRemove: (index: number) => void;
    onEditPointDragStart: () => void;
    onEditPointDragEnd: () => void;
    onDraftGroupDragStart: () => void;
    onDraftGroupDragEnd: (event: Konva.KonvaEventObject<DragEvent>) => void;
    onDraftInsertPoint: (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
    onDraftPointMove: (index: number, point: AreaPoint) => void;
    onDraftPointRemove: (index: number) => void;
    onDraftPointDragStart: () => void;
    onDraftPointDragEnd: () => void;
    onSetCursor: (cursor: string) => void;
  };
}

export function AreasLayersGroup({ data, flags, handlers }: AreasLayersGroupProps) {
  const { areaLines, editingAreaId, editingPoints, draftPoints, draftPointsFlat, pointRadius } = data;
  const { isEditMode, activeTool } = flags;
  const {
    onAreaMenu,
    onEditGroupDragStart,
    onEditGroupDragEnd,
    onEditInsertPoint,
    onEditPointMove,
    onEditPointRemove,
    onEditPointDragStart,
    onEditPointDragEnd,
    onDraftGroupDragStart,
    onDraftGroupDragEnd,
    onDraftInsertPoint,
    onDraftPointMove,
    onDraftPointRemove,
    onDraftPointDragStart,
    onDraftPointDragEnd,
    onSetCursor,
  } = handlers;

  return (
    <>
      <Layer>
        <AreaLayer
          areas={areaLines}
          hiddenAreaId={editingAreaId}
          onAreaMenu={onAreaMenu}
        />
      </Layer>

      {editingAreaId !== null && (
        <Layer>
          <EditAreaLayer
            points={editingPoints}
            pointRadius={pointRadius}
            canDrag={isEditMode}
            onGroupDragStart={onEditGroupDragStart}
            onGroupDragEnd={onEditGroupDragEnd}
            onGroupMouseEnter={() => onSetCursor("grab")}
            onGroupMouseLeave={() => onSetCursor("crosshair")}
            onGroupDragMove={() => onSetCursor("grabbing")}
            onInsertPoint={onEditInsertPoint}
            onPointMove={onEditPointMove}
            onPointRemove={onEditPointRemove}
            onPointDragStart={onEditPointDragStart}
            onPointDragEnd={onEditPointDragEnd}
          />
        </Layer>
      )}

      {draftPoints.length > 0 && (
        <Layer>
          <DraftAreaLayer
            points={draftPoints}
            flatPoints={draftPointsFlat}
            pointRadius={pointRadius}
            canDrag={isEditMode && activeTool === "add_area"}
            onGroupDragStart={onDraftGroupDragStart}
            onGroupDragEnd={onDraftGroupDragEnd}
            onGroupMouseEnter={() => {
              if (activeTool === "add_area") {
                onSetCursor("grab");
              }
            }}
            onGroupMouseLeave={() => {
              if (activeTool === "add_area") {
                onSetCursor("crosshair");
              }
            }}
            onGroupDragMove={() => {
              if (activeTool === "add_area") {
                onSetCursor("grabbing");
              }
            }}
            onInsertPoint={onDraftInsertPoint}
            onPointMove={onDraftPointMove}
            onPointRemove={onDraftPointRemove}
            onPointDragStart={onDraftPointDragStart}
            onPointDragEnd={onDraftPointDragEnd}
            onPointHoverEnter={() => {
              if (activeTool === "add_area") {
                onSetCursor("grab");
              }
            }}
            onPointHoverLeave={() => {
              if (activeTool === "add_area") {
                onSetCursor("crosshair");
              }
            }}
          />
        </Layer>
      )}
    </>
  );
}
