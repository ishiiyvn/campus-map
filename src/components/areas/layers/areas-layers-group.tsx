"use client";

import { memo, useMemo } from "react";
import Konva from "konva";
import { Layer } from "react-konva";
import { AreaLayer } from "@/components/areas/layers/area-layer";
import { DraftAreaLayer } from "@/components/areas/layers/draft-area-layer";
import { DraftCircleLayer } from "@/components/areas/layers/draft-circle-layer";
import { EditAreaLayer } from "@/components/areas/layers/edit-area-layer";
import type { AreaPoint } from "@/components/areas/utils/types";
import type { Layer as LayerType } from "@/server/db/schema";

interface AreaRenderData {
  id: number;
  name: string;
  layer_id: number | null;
  points: number[];
  fill: string;
  stroke: string;
  labelX: number;
  labelY: number;
}

interface AreasLayersGroupProps {
  layers: LayerType[];
  layerVisibility: Record<number, boolean>;
  focusedAreaId?: number | null;
  data: {
    areaLines: AreaRenderData[];
    editingAreaId: number | null;
    editingPoints: AreaPoint[];
    draftPoints: AreaPoint[];
    draftPointsFlat: number[];
    pointRadius: number;
    dashArray: [number, number];
    circleCenter: AreaPoint | null;
    circleRadius: number;
    circlePointsFlat: number[];
    drawMode: "polygon" | "circle";
  };
  flags: {
    isEditMode: boolean;
    activeTool: string;
  };
  handlers: {
    onAreaContextMenu: (areaId: number, screenPos: { x: number; y: number }) => void;
    onAreaClick?: (areaId: number, event: Konva.KonvaEventObject<MouseEvent>) => void;
    onAreaSelect?: (areaId: number) => void;
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
    onCircleRadiusHandleDrag: (point: AreaPoint) => void;
    onCircleRadiusHandleDragEnd: () => void;
    onCircleGroupDragStart: () => void;
    onCircleGroupDragEnd: (event: Konva.KonvaEventObject<DragEvent>) => void;
    onCircleGroupDragMove: () => void;
    onSetCursor: (cursor: string) => void;
  };
}

export const AreasLayersGroup = memo(function AreasLayersGroup({ layers, layerVisibility, focusedAreaId, data, flags, handlers }: AreasLayersGroupProps) {
  const { areaLines, editingAreaId, editingPoints, draftPoints, draftPointsFlat, pointRadius, dashArray, circleCenter, circleRadius, circlePointsFlat, drawMode } = data;
  const { isEditMode, activeTool } = flags;
  const {
    onAreaContextMenu,
    onAreaClick,
    onAreaSelect,
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
    onCircleRadiusHandleDrag,
    onCircleRadiusHandleDragEnd,
    onCircleGroupDragStart,
    onCircleGroupDragEnd,
    onCircleGroupDragMove,
    onSetCursor,
  } = handlers;

  const sortedLayers = useMemo(() => 
    [...layers].sort((a, b) => a.display_order - b.display_order), 
    [layers]
  );

  const areasByLayer = useMemo(() => {
    return areaLines.reduce((acc, area) => {
      const layerId = area.layer_id ?? "unassigned";
      if (!acc[layerId]) {
        acc[layerId] = [];
      }
      acc[layerId].push(area);
      return acc;
    }, {} as Record<string | number, AreaRenderData[]>);
  }, [areaLines]);

  const getLayerName = (layerId: number | null) => {
    if (layerId === null) return "Sin capa";
    const layer = layers.find((l) => l.id === layerId);
    return layer?.name ?? "Capa desconocida";
  };

  return (
    <>
      {sortedLayers.map((layer) => {
        const isVisible = layerVisibility[layer.id] ?? true;
        const layerAreas = areasByLayer[layer.id] ?? [];

        if (!isVisible || layerAreas.length === 0) {
          return null;
        }

        return (
          <Layer key={layer.id} name={layer.name}>
            <AreaLayer
              areas={layerAreas}
              hiddenAreaId={editingAreaId}
              focusedAreaId={focusedAreaId}
              isEditMode={isEditMode}
              activeTool={activeTool}
              onAreaContextMenu={onAreaContextMenu}
              onAreaClick={onAreaClick}
              onAreaSelect={onAreaSelect}
            />
          </Layer>
        );
      })}

      {areasByLayer["unassigned"] && areasByLayer["unassigned"].length > 0 && (
        <Layer name="Sin capa">
          <AreaLayer
            areas={areasByLayer["unassigned"]}
            hiddenAreaId={editingAreaId}
            focusedAreaId={focusedAreaId}
            isEditMode={isEditMode}
            activeTool={activeTool}
            onAreaContextMenu={onAreaContextMenu}
            onAreaClick={onAreaClick}
            onAreaSelect={onAreaSelect}
          />
        </Layer>
      )}

      {editingAreaId !== null && (
        <Layer>
          <EditAreaLayer
            points={editingPoints}
            pointRadius={pointRadius}
            dashArray={dashArray}
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

      {draftPoints.length > 0 && drawMode === "polygon" && (
        <Layer>
          <DraftAreaLayer
            points={draftPoints}
            flatPoints={draftPointsFlat}
            pointRadius={pointRadius}
            dashArray={dashArray}
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

      {drawMode === "circle" && circleCenter && (
        <Layer>
          <DraftCircleLayer
            center={circleCenter}
            radius={circleRadius}
            circlePointsFlat={circlePointsFlat}
            dashArray={dashArray}
            canDrag={isEditMode && activeTool === "add_area"}
            onGroupDragStart={onCircleGroupDragStart}
            onGroupDragEnd={onCircleGroupDragEnd}
            onGroupDragMove={onCircleGroupDragMove}
            onGroupMouseEnter={() => onSetCursor("grab")}
            onGroupMouseLeave={() => onSetCursor("crosshair")}
            onRadiusHandleDrag={onCircleRadiusHandleDrag}
            onRadiusHandleDragEnd={onCircleRadiusHandleDragEnd}
          />
        </Layer>
      )}
    </>
  );
});
