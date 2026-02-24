"use client";

// db
import { Area, Category, PointOfInterest } from "@/server/db/schema";

// utils
import { cn } from "@/lib/utils";

// zod validators
import { MapOutput } from "@/lib/validators/map";

// components
import { AddPoiDialog } from "@/components/maps/dialogs/add-poi-dialog";
import { EditPoiDialog } from "@/components/maps/dialogs/edit-poi-dialog";
import { MapEditorToolbar } from "../editor-tools/map-editor-toolbar";
import { AreaLayer } from "@/components/areas/map/area-layer";
import { DraftAreaLayer } from "@/components/areas/map/draft-area-layer";
import { EditAreaLayer } from "@/components/areas/map/edit-area-layer";
import { AreaContextMenu } from "@/components/areas/map/area-context-menu";
import { AreaControls } from "@/components/areas/map/area-controls";
import { AreaDialogs } from "@/components/areas/map/area-dialogs";

// konva components
import { Stage, Layer, Image as KonvaImage, Group, Circle } from "react-konva";
import Konva from "konva";

// hooks
import { useCallback, useRef, useEffect, useMemo, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMapZoom } from "@/hooks/maps/use-map-zoom";
import { usePoiInteractions } from "@/hooks/maps/use-poi-interactions";
import { useStageSize } from "@/hooks/maps/use-stage-size";
import useImage from "use-image";
import { toast } from "sonner";
import { useAreaDraft } from "@/hooks/areas/use-area-draft";
import { useAreaEdit } from "@/hooks/areas/use-area-edit";
import { useAreaActions } from "@/hooks/areas/use-area-actions";
import { useMapStage } from "@/hooks/maps/use-map-stage";


interface MapViewerProps {
  mapData: MapOutput;
  pois: PointOfInterest[];
  categories: Category[];
  areas: Area[];
  readOnly?: boolean;
}


// Background image component
const URLImage = ({ src, width, height }: { src: string; width: number; height: number }) => {
  const [image] = useImage(src);
  return <KonvaImage image={image} width={width} height={height} listening={false} />;
};

export default function MapViewer({ mapData, pois, categories, areas, readOnly = true }: MapViewerProps) {
  // readOnly is currently unused but kept for interface compatibility
  void readOnly;
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageSize = useStageSize(containerRef);
  const { stageScale, isDraggingRef, updateScaleFromStage, getPointerMapPosition } = useMapStage(stageRef, {
    width: stageSize.width,
    height: stageSize.height,
  });
  const pointRadius = Math.max(4, 6 / stageScale);
  const {
    draftAreaPoints,
    draftAreaPointsFlat,
    draftUndoStack,
    addDraftPoint,
    insertDraftPointAtNearestEdge,
    updateDraftPoint,
    removeDraftPointAt,
    moveDraftBy,
    resetDraft,
    undoDraft,
  } = useAreaDraft();
  const {
    editingAreaId,
    editingPoints,
    editingUndoStack,
    isEditAreaDialogOpen,
    editingAreaSnapshot,
    contextMenu,
    isEditing,
    setIsEditAreaDialogOpen,
    setEditingAreaSnapshot,
    startEditingArea,
    openEditInfo,
    openContextMenu,
    closeContextMenu,
    updateEditingPoint,
    removeEditingPointAt,
    insertEditingPointAtNearestEdge,
    moveEditingBy,
    resetEditing,
    undoEdit,
    setEditingOriginalPoints,
  } = useAreaEdit();
  const {
    isDeleteDialogOpen,
    deleteTargetAreaId,
    setIsDeleteDialogOpen,
    setDeleteTargetAreaId,
    handleDeleteArea,
    handleEditFormSuccess,
    handleEditSave,
    handleAreaCreated,
  } = useAreaActions();
  const [isAreaDialogOpen, setIsAreaDialogOpen] = useState(false);
  const [mapAreas, setMapAreas] = useState<Area[]>(areas);

  useEffect(() => {
    setMapAreas(areas);
  }, [areas]);

  // State for interaction
  const isMobile = useIsMobile();

  // State for edit mode and tools
  const addDraftPointHandler = useCallback((point: { x: number; y: number }) => {
    addDraftPoint(point);
  }, [addDraftPoint]);

  const poiInteractions = usePoiInteractions(stageRef, {
    onAreaPointAdd: addDraftPointHandler,
  });

  // Ensure edit mode is disabled on mobile
  useEffect(() => {
    if (isMobile) {
      poiInteractions.setIsEditMode(false);
    }
  }, [isMobile, poiInteractions]);

  // Zoom Logic
  const { handleWheel } = useMapZoom(stageRef, mapData.viewport_config);
  const handleWheelZoom = (e: Konva.KonvaEventObject<WheelEvent>) => {
    handleWheel(e);
    updateScaleFromStage();
  };

  const areaLines = useMemo(
    () =>
      mapAreas.map((area) => {
        const points = (area.polygon_coordinates ?? []) as { x: number; y: number }[];
        return {
          id: area.id,
          points: points.flatMap((point) => [point.x, point.y]),
          fill: area.fill_color || "rgba(59,130,246,0.2)",
          stroke: area.stroke_color || "#3b82f6",
        };
      }),
    [mapAreas],
  );

  const handleFinishArea = () => {
    if (draftAreaPoints.length < 3) {
      toast.error("Agrega al menos 3 puntos para crear un área");
      return;
    }
    setIsAreaDialogOpen(true);
  };

  const handleDraftGroupDragStart = () => {
    isDraggingRef.current = true;
    updateCursor("grabbing");
  };

  const handleDraftGroupDragEnd = (event: Konva.KonvaEventObject<DragEvent>) => {
    const node = event.target;
    const dx = node.x();
    const dy = node.y();
    if (dx !== 0 || dy !== 0) {
      moveDraftBy(dx, dy);
      node.position({ x: 0, y: 0 });
    }
    isDraggingRef.current = false;
    updateCursor("crosshair");
  };

  const handleEditGroupDragStart = () => {
    isDraggingRef.current = true;
    updateCursor("grabbing");
  };

  const handleEditGroupDragEnd = (event: Konva.KonvaEventObject<DragEvent>) => {
    const node = event.target;
    const dx = node.x();
    const dy = node.y();
    if (dx !== 0 || dy !== 0) {
      moveEditingBy(dx, dy);
      node.position({ x: 0, y: 0 });
    }
    isDraggingRef.current = false;
    updateCursor("crosshair");
  };

  const handleEditUndoPoint = () => {
    undoEdit();
  };

  const handleUndoPoint = () => {
    undoDraft();
  };

  const handleCancelArea = () => {
    resetDraft();
  };

  const handleEditCancel = () => {
    resetEditing();
  };

  const updateCursor = (cursor: string) => {
    const container = stageRef.current?.container();
    if (container) {
      container.style.cursor = cursor;
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-slate-100 overflow-hidden relative"
      onContextMenu={(event) => {
        event.preventDefault();
      }}
    >
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheelZoom}
        onClick={(e) => {
          if (!isDraggingRef.current) {
            if (contextMenu && e.target === e.target.getStage()) {
              closeContextMenu();
            }
            if (editingAreaId !== null) {
              if (poiInteractions.isEditMode && e.target === e.target.getStage()) {
                if (editingPoints.length >= 3 && e.evt.button === 0) {
                  const point = getPointerMapPosition();
                  if (point) {
                    insertEditingPointAtNearestEdge(point);
                  }
                }
              }
              return;
            }
            poiInteractions.handleStageClick(e);
          }
        }}
        onTap={(e) => {
          if (!isDraggingRef.current) {
            if (editingAreaId !== null) {
              if (poiInteractions.isEditMode && e.target === e.target.getStage()) {
                if (editingPoints.length >= 3) {
                  const point = getPointerMapPosition();
                  if (point) {
                    insertEditingPointAtNearestEdge(point);
                  }
                }
              }
              return;
            }
            poiInteractions.handleStageClick(e);
          }
        }}
        draggable={poiInteractions.activeTool === "select" || poiInteractions.activeTool === "add_area"}
        onDragStart={() => {
          isDraggingRef.current = true;
          if (contextMenu) {
            closeContextMenu();
          }
        }}
        onDragEnd={() => {
          isDraggingRef.current = false;
        }}
        ref={stageRef}
        className={cn(
          poiInteractions.activeTool === "add_poi" || poiInteractions.activeTool === "add_area"
            ? "cursor-crosshair"
            : "cursor-move"
        )}
        style={{
          cursor:
            poiInteractions.activeTool === "add_poi" || poiInteractions.activeTool === "add_area"
              ? "crosshair"
              : "move"
        }}
      >
        <Layer>
          <URLImage
            src={mapData.map_image_url}
            width={mapData.map_width}
            height={mapData.map_height}
          />
        </Layer>

        {/* Areas Layer */}
        <Layer>
          <AreaLayer
            areas={areaLines}
            hiddenAreaId={editingAreaId}
            onAreaMenu={(areaId, event) => {
              if (!poiInteractions.isEditMode) return;
              event.evt.preventDefault();
              event.cancelBubble = true;
              const container = stageRef.current?.container();
              if (!container) return;
              const rect = container.getBoundingClientRect();
              openContextMenu(areaId, event.evt.clientX - rect.left, event.evt.clientY - rect.top);
            }}
          />
        </Layer>

        {editingAreaId !== null && (
          <Layer>
            <EditAreaLayer
              points={editingPoints}
              pointRadius={pointRadius}
              canDrag={poiInteractions.isEditMode}
              onGroupDragStart={handleEditGroupDragStart}
              onGroupDragEnd={handleEditGroupDragEnd}
              onGroupMouseEnter={() => updateCursor("grab")}
              onGroupMouseLeave={() => updateCursor("crosshair")}
              onGroupDragMove={() => updateCursor("grabbing")}
              onInsertPoint={(event) => {
                if (!poiInteractions.isEditMode) return;
                if (isDraggingRef.current) return;
                if (event.evt instanceof MouseEvent && event.evt.button !== 0) return;
                if (editingPoints.length < 3) return;
                event.cancelBubble = true;
                const point = getPointerMapPosition();
                if (!point) return;
                insertEditingPointAtNearestEdge(point);
              }}
              onPointMove={updateEditingPoint}
              onPointRemove={removeEditingPointAt}
              onPointDragStart={() => {
                isDraggingRef.current = true;
                updateCursor("grabbing");
              }}
              onPointDragEnd={() => {
                isDraggingRef.current = false;
                updateCursor("crosshair");
              }}
            />
          </Layer>
        )}

        {/* Draft Area Layer */}
        {draftAreaPoints.length > 0 && (
          <Layer>
            <DraftAreaLayer
              points={draftAreaPoints}
              flatPoints={draftAreaPointsFlat}
              pointRadius={pointRadius}
              canDrag={poiInteractions.isEditMode && poiInteractions.activeTool === "add_area"}
              onGroupDragStart={handleDraftGroupDragStart}
              onGroupDragEnd={handleDraftGroupDragEnd}
              onGroupMouseEnter={() => {
                if (poiInteractions.activeTool === "add_area") {
                  updateCursor("grab");
                }
              }}
              onGroupMouseLeave={() => {
                if (poiInteractions.activeTool === "add_area") {
                  updateCursor("crosshair");
                }
              }}
              onGroupDragMove={() => {
                if (poiInteractions.activeTool === "add_area") {
                  updateCursor("grabbing");
                }
              }}
              onInsertPoint={(event) => {
                if (!poiInteractions.isEditMode || poiInteractions.activeTool !== "add_area") return;
                if (isDraggingRef.current) return;
                if (event.evt instanceof MouseEvent && event.evt.button !== 0) return;
                if (draftAreaPoints.length < 3) return;
                event.cancelBubble = true;
                const point = getPointerMapPosition();
                if (!point) return;
                insertDraftPointAtNearestEdge(point);
              }}
              onPointMove={updateDraftPoint}
              onPointRemove={removeDraftPointAt}
              onPointDragStart={() => {
                isDraggingRef.current = true;
                updateCursor("grabbing");
              }}
              onPointDragEnd={() => {
                isDraggingRef.current = false;
                updateCursor("crosshair");
              }}
              onPointHoverEnter={() => {
                if (poiInteractions.activeTool === "add_area") {
                  updateCursor("grab");
                }
              }}
              onPointHoverLeave={() => {
                if (poiInteractions.activeTool === "add_area") {
                  updateCursor("crosshair");
                }
              }}
            />
          </Layer>
        )}

        {/* Markers Layer */}
        <Layer>
          {pois.map((poi) => (
            <Group
              key={poi.id ?? `temp-${Math.random()}`}
              x={poi.x_coordinate}
              y={poi.y_coordinate}
              onClick={(e) => poiInteractions.handlePoiClick(e, poi)}
              onTap={(e) => poiInteractions.handlePoiClick(e, poi)}
              onMouseEnter={poiInteractions.handlePoiMouseEnter}
              onMouseLeave={poiInteractions.handlePoiMouseLeave}
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

      {/* Edit Mode Toggle & Toolbar */}
      <MapEditorToolbar
        isEditMode={poiInteractions.isEditMode}
        onEditModeChange={poiInteractions.setIsEditMode}
        activeTool={poiInteractions.activeTool}
        onToolChange={poiInteractions.setActiveTool}
        visible={!isMobile}
      />

      {poiInteractions.isEditMode && poiInteractions.activeTool === "add_area" && editingAreaId === null && (
        <AreaControls
          isEditing={false}
          canUndo={draftUndoStack.length > 0}
          onFinish={handleFinishArea}
          onUndo={handleUndoPoint}
          onCancel={handleCancelArea}
        />
      )}

      {poiInteractions.isEditMode && editingAreaId !== null && (
        <AreaControls
          isEditing
          canUndo={editingUndoStack.length > 0}
          onFinish={() =>
            handleEditSave(editingAreaId, editingPoints, mapAreas, (area) => {
              setEditingAreaSnapshot(area);
              setIsEditAreaDialogOpen(true);
            })
          }
          onUndo={handleEditUndoPoint}
          onCancel={handleEditCancel}
        />
      )}

      {contextMenu && editingAreaId === null && poiInteractions.isEditMode && (
        <AreaContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onEditPolygon={() => {
            const area = mapAreas.find((item) => item.id === contextMenu.areaId);
            if (area) {
              startEditingArea(area);
              closeContextMenu();
            }
          }}
          onEditInfo={() => {
            const area = mapAreas.find((item) => item.id === contextMenu.areaId);
            if (area) {
              openEditInfo(area);
              closeContextMenu();
            }
          }}
          onDelete={() => {
            setDeleteTargetAreaId(contextMenu.areaId);
            setIsDeleteDialogOpen(true);
            closeContextMenu();
          }}
          onClose={closeContextMenu}
        />
      )}

      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-4 right-4 bg-white/80 p-2 rounded shadow backdrop-blur-sm text-xs pointer-events-none">
        Scroll to Zoom • Drag to Pan
      </div>

      <AddPoiDialog
        open={!!poiInteractions.newPoiLocation}
        location={poiInteractions.newPoiLocation}
        mapId={mapData.id!}
        categories={categories}
        onClose={() => poiInteractions.setNewPoiLocation(null)}
      />

      <EditPoiDialog
        open={!!poiInteractions.activePoi}
        poi={poiInteractions.activePoi}
        categories={categories}
        onClose={() => poiInteractions.setActivePoi(null)}
      />

      <AreaDialogs
        mapId={mapData.id!}
        draftPoints={draftAreaPoints}
        editPoints={editingPoints}
        editSnapshot={editingAreaSnapshot}
        isCreateOpen={isAreaDialogOpen}
        isEditOpen={isEditAreaDialogOpen}
        isDeleteOpen={isDeleteDialogOpen}
        onCreateOpenChange={setIsAreaDialogOpen}
        onEditOpenChange={setIsEditAreaDialogOpen}
        onDeleteOpenChange={setIsDeleteDialogOpen}
        onCreateSuccess={(area) =>
          handleAreaCreated(area, {
            onCreated: (created) => setMapAreas((prev) => [...prev, created]),
            onResetDraft: resetDraft,
            onCloseCreate: () => setIsAreaDialogOpen(false),
            onResetTool: () => poiInteractions.setActiveTool("select"),
          })
        }
        onEditSuccess={(area) =>
          handleEditFormSuccess(area, {
            onUpdated: (updated) =>
              setMapAreas((prev) => prev.map((item) => (item.id === updated.id ? updated : item))),
            onResetEdit: resetEditing,
            onCloseEdit: () => setIsEditAreaDialogOpen(false),
          })
        }
        onDeleteConfirm={() => {
          if (deleteTargetAreaId !== null) {
            handleDeleteArea(deleteTargetAreaId, {
              onDeleted: (deletedId) =>
                setMapAreas((prev) => prev.filter((item) => item.id !== deletedId)),
              onResetEdit: resetEditing,
              onCloseDialogs: () => {
                setIsEditAreaDialogOpen(false);
                setIsDeleteDialogOpen(false);
                setDeleteTargetAreaId(null);
                closeContextMenu();
              },
            });
          }
        }}
      />

    </div>
  );
}
