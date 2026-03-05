"use client";

// db
import { Area, Category, PointOfInterest } from "@/server/db/schema";

// zod validators
import { MapOutput } from "@/lib/validators/map";

// components
import { PoiDialogs } from "@/components/pois/overlays/poi-dialogs";
import { MapEditorToolbar } from "../editor-tools/map-editor-toolbar";
import { AreasLayersGroup } from "@/components/areas/layers/areas-layers-group";
import { AreaUi } from "@/components/areas/overlays/area-ui";

// konva components
import { Stage, Layer } from "react-konva";
import Konva from "konva";

// hooks
import { useCallback, useRef, useMemo, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStageZoom } from "@/components/maps/hooks/use-stage-zoom";
import { usePoiInteractions } from "@/components/maps/hooks/use-poi-interactions";
import { useStageSize } from "@/components/maps/hooks/use-stage-size";
import { useAreaDraft } from "@/components/areas/hooks/use-area-draft";
import { useAreaEdit } from "@/components/areas/hooks/use-area-edit";
import { useAreaActions } from "@/components/areas/hooks/use-area-actions";
import { useMapAreasState } from "@/components/areas/hooks/use-map-areas-state";
import { useMapStage } from "@/components/maps/hooks/use-map-stage";
import { useMapInteractions } from "@/components/maps/hooks/use-map-interactions";
import { useStageInteractions } from "@/components/maps/hooks/use-stage-interactions";
import { buildAreaRenderData } from "@/components/areas/utils/area-mappers";
import { PoiLayer } from "@/components/pois/layers/poi-layer";
import { MapImageLayer } from "@/components/maps/layers/map-image-layer";
import { MapOverlayHints } from "@/components/maps/overlays/map-overlay-hints";


interface MapViewerProps {
  mapData: MapOutput;
  pois: PointOfInterest[];
  categories: Category[];
  areas: Area[];
  readOnly?: boolean;
}


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
    updateDraftPoint,
    removeDraftPointAt,
    moveDraftBy,
    resetDraft,
    openDraftDialogIfValid,
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
    cancelEditing,
    undoEditing,
    setEditingOriginalPoints,
  } = useAreaEdit();
  const {
    isDeleteDialogOpen,
    deleteTargetAreaId,
    setIsDeleteDialogOpen,
    setDeleteTargetAreaId,
    handleDeleteArea,
    applyEditResult,
    openEditDialogIfValid,
    applyDraftCreate,
  } = useAreaActions();
  const [isAreaDialogOpen, setIsAreaDialogOpen] = useState(false);
  const { mapAreas, addArea, updateArea, removeArea } = useMapAreasState(areas);

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

  const { onWheel } = useStageZoom({
    stageRef,
    viewportConfig: mapData.viewport_config,
    onScaleUpdate: updateScaleFromStage,
  });

  const areaLines = useMemo(() => buildAreaRenderData(mapAreas), [mapAreas]);

  const handleDraftFinish = () => {
    openDraftDialogIfValid(() => setIsAreaDialogOpen(true));
  };

  const handleDraftDragEnd = (event: Konva.KonvaEventObject<DragEvent>) => {
    const node = event.target;
    const dx = node.x();
    const dy = node.y();
    if (dx !== 0 || dy !== 0) {
      moveDraftBy(dx, dy);
      node.position({ x: 0, y: 0 });
    }
    isDraggingRef.current = false;
    setCursor("crosshair");
  };

  const handleEditDragEnd = (event: Konva.KonvaEventObject<DragEvent>) => {
    const node = event.target;
    const dx = node.x();
    const dy = node.y();
    if (dx !== 0 || dy !== 0) {
      moveEditingBy(dx, dy);
      node.position({ x: 0, y: 0 });
    }
    isDraggingRef.current = false;
    setCursor("crosshair");
  };

  const handleEditUndo = () => {
    undoEditing();
  };

  const handleDraftUndo = () => {
    undoDraft();
  };

  const handleDraftCancel = () => {
    resetDraft();
  };

  const handleEditCancel = () => {
    cancelEditing();
  };

  const { setCursor, stageProps } = useStageInteractions({
    stageRef,
    isDraggingRef,
    contextMenu,
    closeContextMenu,
    editingAreaId,
    editingPoints,
    insertEditingPointAtNearestEdge,
    getPointerMapPosition,
    poiInteractions,
  });

  const { onDraftDragStart, onEditDragStart } = useMapInteractions({
    isDraggingRef,
    updateCursor: setCursor,
  });

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
        onWheel={onWheel}
        ref={stageRef}
        {...stageProps}
      >
        <MapImageLayer
          src={mapData.map_image_url}
          width={mapData.map_width}
          height={mapData.map_height}
        />

        <AreasLayersGroup
          data={{
            areaLines,
            editingAreaId,
            editingPoints,
            draftPoints: draftAreaPoints,
            draftPointsFlat: draftAreaPointsFlat,
            pointRadius,
          }}
          flags={{
            isEditMode: poiInteractions.isEditMode,
            activeTool: poiInteractions.activeTool,
          }}
          handlers={{
            onAreaMenu: (areaId, event) => {
              if (!poiInteractions.isEditMode) return;
              event.evt.preventDefault();
              event.cancelBubble = true;
              const container = stageRef.current?.container();
              if (!container) return;
              const rect = container.getBoundingClientRect();
              openContextMenu(areaId, event.evt.clientX - rect.left, event.evt.clientY - rect.top);
            },
            onEditGroupDragStart: onEditDragStart,
            onEditGroupDragEnd: handleEditDragEnd,
            onEditInsertPoint: (event) => {
              if (!poiInteractions.isEditMode) return;
              if (isDraggingRef.current) return;
              if (event.evt instanceof MouseEvent && event.evt.button !== 0) return;
              if (editingPoints.length < 3) return;
              event.cancelBubble = true;
              const point = getPointerMapPosition();
              if (!point) return;
              insertEditingPointAtNearestEdge(point);
            },
            onEditPointMove: updateEditingPoint,
            onEditPointRemove: removeEditingPointAt,
            onEditPointDragStart: () => {
              isDraggingRef.current = true;
              setCursor("grabbing");
            },
            onEditPointDragEnd: () => {
              isDraggingRef.current = false;
              setCursor("crosshair");
            },
            onDraftGroupDragStart: onDraftDragStart,
            onDraftGroupDragEnd: handleDraftDragEnd,
            onDraftInsertPoint: (event) => {
              if (!poiInteractions.isEditMode || poiInteractions.activeTool !== "add_area") return;
              if (isDraggingRef.current) return;
              if (event.evt instanceof MouseEvent && event.evt.button !== 0) return;
              if (draftAreaPoints.length < 3) return;
              event.cancelBubble = true;
              const point = getPointerMapPosition();
              if (!point) return;
              addDraftPoint(point);
            },
            onDraftPointMove: updateDraftPoint,
            onDraftPointRemove: removeDraftPointAt,
            onDraftPointDragStart: () => {
              isDraggingRef.current = true;
              setCursor("grabbing");
            },
            onDraftPointDragEnd: () => {
              isDraggingRef.current = false;
              setCursor("crosshair");
            },
            onSetCursor: setCursor,
          }}
        />

        <PoiLayer
          pois={pois}
          onPoiClick={poiInteractions.handlePoiClick}
          onPoiMouseEnter={poiInteractions.handlePoiMouseEnter}
          onPoiMouseLeave={poiInteractions.handlePoiMouseLeave}
        />
      </Stage>

      {/* Edit Mode Toggle & Toolbar */}
      <MapEditorToolbar
        isEditMode={poiInteractions.isEditMode}
        onEditModeChange={poiInteractions.setIsEditMode}
        activeTool={poiInteractions.activeTool}
        onToolChange={poiInteractions.setActiveTool}
        visible={!isMobile}
      />

      <AreaUi
        mapId={mapData.id!}
        areas={{
          list: mapAreas,
          editingId: editingAreaId,
          editSnapshot: editingAreaSnapshot,
          draftPoints: draftAreaPoints,
          editPoints: editingPoints,
        }}
        undo={{
          draft: draftUndoStack,
          edit: editingUndoStack,
        }}
        ui={{
          isEditMode: poiInteractions.isEditMode,
          activeTool: poiInteractions.activeTool,
          contextMenu: contextMenu,
        }}
        dialogs={{
          createOpen: isAreaDialogOpen,
          editOpen: isEditAreaDialogOpen,
          deleteOpen: isDeleteDialogOpen,
          deleteTargetId: deleteTargetAreaId,
        }}
        onDialogToggles={{
          setCreateOpen: setIsAreaDialogOpen,
          setEditOpen: setIsEditAreaDialogOpen,
          setDeleteOpen: setIsDeleteDialogOpen,
          setDeleteTargetId: setDeleteTargetAreaId,
        }}
        actions={{
          onDraftFinish: handleDraftFinish,
          onDraftUndo: handleDraftUndo,
          onDraftCancel: handleDraftCancel,
          onEditUndo: handleEditUndo,
          onEditCancel: handleEditCancel,
          onCloseContextMenu: closeContextMenu,
          onStartEditingArea: startEditingArea,
          onOpenEditInfo: openEditInfo,
          onSetEditSnapshot: setEditingAreaSnapshot,
          onRequestEditDialog: openEditDialogIfValid,
          onCreateSuccess: applyDraftCreate,
          onEditSuccess: applyEditResult,
          onDeleteConfirm: handleDeleteArea,
          onAreaCreated: addArea,
          onAreaUpdated: updateArea,
          onAreaDeleted: removeArea,
          onResetDraft: resetDraft,
          onResetEdit: cancelEditing,
          onResetTool: () => poiInteractions.setActiveTool("select"),
          onCloseDialogs: () => {
            setIsEditAreaDialogOpen(false);
            setIsDeleteDialogOpen(false);
            setDeleteTargetAreaId(null);
            closeContextMenu();
          },
        }}
      />

      <MapOverlayHints
        isEditMode={poiInteractions.isEditMode}
        activeTool={poiInteractions.activeTool}
        isMobile={isMobile}
        showZoomHint
      />

      <PoiDialogs
        mapId={mapData.id!}
        categories={categories}
        activePoi={poiInteractions.activePoi}
        newPoiLocation={poiInteractions.newPoiLocation}
        onCloseNewPoi={() => poiInteractions.setNewPoiLocation(null)}
        onCloseEditPoi={() => poiInteractions.setActivePoi(null)}
      />

    </div>
  );
}
