"use client";

// db
import { Area, Category, PointOfInterest, Layer as DbLayer } from "@/server/db/schema";

// zod validators
import { MapOutput } from "@/lib/validators/map";

// server actions
import { updateArea as updateAreaAction } from "@/server/actions/areas";

// components
import { PoiLayer } from "@/components/pois/layers/poi-layer";
import { PoiDialogs } from "@/components/pois/overlays/poi-dialogs";
import { AreasLayersGroup } from "@/components/areas/layers/areas-layers-group";
import { MapOverlays } from "@/components/maps/overlays/map-overlays";

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
import { useAreaDragHandlers } from "@/components/areas/hooks/use-area-drag-handlers";
import { useMapStage } from "@/components/maps/hooks/use-map-stage";
import { useMapInteractions } from "@/components/maps/hooks/use-map-interactions";
import { useStageInteractions } from "@/components/maps/hooks/use-stage-interactions";
import { buildAreaRenderData } from "@/components/areas/utils/area-mappers";
import { MapImageLayer } from "@/components/maps/layers/map-image-layer";
import { useMapOverlaysProps } from "@/components/maps/hooks/use-map-overlays-props";
import { DraftToolSwitchDialog } from "@/components/areas/dialogs/draft-tool-switch-dialog";
import { LayerSidebar } from "@/components/layers/layer-sidebar";


interface MapViewerProps {
  mapData: MapOutput;
  pois: PointOfInterest[];
  categories: Category[];
  areas: Area[];
  layers?: DbLayer[];
  readOnly?: boolean;
}


export default function MapViewer({ mapData, pois, categories, areas, layers = [], readOnly = true }: MapViewerProps) {
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
    beginDraftDrag,
    endDraftDrag,
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
    beginEditingDrag,
    endEditingDrag,
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
  const [isDraftGuardOpen, setIsDraftGuardOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    { type: "tool"; tool: "select" | "add_poi" | "add_area" } | { type: "editModeOff" } | null
  >(null);
  
  // Layer visibility state
  const [layerVisibility, setLayerVisibility] = useState<Record<number, boolean>>({});
  const [imageVisible, setImageVisible] = useState(true);
  const [imageOpacity, setImageOpacity] = useState(1);
  const [isLayerSidebarOpen, setIsLayerSidebarOpen] = useState(false);

  // Initialize layer visibility from layers prop
  useEffect(() => {
    const initialVisibility: Record<number, boolean> = {};
    layers.forEach((layer) => {
      initialVisibility[layer.id] = layer.is_visible;
    });
    setLayerVisibility(initialVisibility);
  }, [layers]);

  const toggleLayerVisibility = useCallback((layerId: number) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  }, []);

  const { mapAreas, addArea, updateArea: updateAreaState, removeArea } = useMapAreasState(areas);

  const handleMoveAreaToLayer = useCallback(async (areaId: number, newLayerId: number | null) => {
    try {
      await updateAreaAction(areaId, { layer_id: newLayerId });
      const updatedArea = mapAreas.find((a) => a.id === areaId);
      if (updatedArea) {
        updateAreaState({ ...updatedArea, layer_id: newLayerId });
      }
    } catch (error) {
      console.error("Error moving area to layer:", error);
    }
  }, [mapAreas]);

  // State for interaction
  const isMobile = useIsMobile();

  // State for edit mode and tools
  const addDraftPointHandler = useCallback((point: { x: number; y: number }) => {
    addDraftPoint(point);
  }, [addDraftPoint]);

  const poiInteractions = usePoiInteractions(stageRef, {
    onAreaPointAdd: addDraftPointHandler,
  });

  const isDraftActive = draftAreaPoints.length > 0;

  const requestToolChange = useCallback((tool: "select" | "add_poi" | "add_area") => {
    if (tool === poiInteractions.activeTool) return;
    if (isDraftActive && tool !== "add_area") {
      setPendingAction({ type: "tool", tool });
      setIsDraftGuardOpen(true);
      return;
    }
    poiInteractions.setActiveTool(tool);
  }, [isDraftActive, poiInteractions]);

  // Ensure edit mode is disabled on mobile
  useEffect(() => {
    if (isMobile) {
      poiInteractions.setIsEditMode(false);
    }
  }, [isMobile, poiInteractions]);

  const wasEditModeRef = useRef(poiInteractions.isEditMode);

  useEffect(() => {
    if (!isDraftActive || poiInteractions.activeTool === "add_area") return;
    setPendingAction({ type: "tool", tool: "add_area" });
    setIsDraftGuardOpen(true);
  }, [isDraftActive, poiInteractions.activeTool]);

  useEffect(() => {
    const wasEditMode = wasEditModeRef.current;
    if (wasEditMode && !poiInteractions.isEditMode && isDraftActive && !isDraftGuardOpen) {
      setPendingAction({ type: "editModeOff" });
      setIsDraftGuardOpen(true);
    }
    wasEditModeRef.current = poiInteractions.isEditMode;
  }, [isDraftActive, isDraftGuardOpen, poiInteractions.isEditMode]);

  const { onWheel } = useStageZoom({
    stageRef,
    viewportConfig: mapData.viewport_config,
    onScaleUpdate: updateScaleFromStage,
  });

  const areaLines = useMemo(() => buildAreaRenderData(mapAreas), [mapAreas]);

  const handleDraftFinish = () => {
    openDraftDialogIfValid(() => setIsAreaDialogOpen(true));
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

  const { toolbar, hints, areaUi, isMobile: overlayIsMobile } = useMapOverlaysProps({
    mapId: mapData.id!,
    isMobile,
    isEditMode: poiInteractions.isEditMode,
    activeTool: poiInteractions.activeTool,
    onEditModeChange: poiInteractions.setIsEditMode,
    onToolChange: requestToolChange,
    mapAreas,
    editingAreaId,
    editingAreaSnapshot,
    draftPoints: draftAreaPoints,
    editPoints: editingPoints,
    draftUndoStack,
    editingUndoStack,
    contextMenu,
    isCreateOpen: isAreaDialogOpen,
    isEditOpen: isEditAreaDialogOpen,
    isDeleteOpen: isDeleteDialogOpen,
    deleteTargetId: deleteTargetAreaId,
    setCreateOpen: setIsAreaDialogOpen,
    setEditOpen: setIsEditAreaDialogOpen,
    setDeleteOpen: setIsDeleteDialogOpen,
    setDeleteTargetId: setDeleteTargetAreaId,
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
    onAreaUpdated: updateAreaState,
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
  });

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

  const { handleDraftDragEnd, handleEditDragEnd } = useAreaDragHandlers({
    isDraggingRef,
    setCursor,
    moveDraftBy,
    moveEditingBy,
    endDraftDrag,
    endEditingDrag,
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
          visible={imageVisible}
          opacity={imageOpacity}
        />

        <AreasLayersGroup
          layers={layers}
          layerVisibility={layerVisibility}
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
            onEditGroupDragStart: () => {
              onEditDragStart();
              beginEditingDrag();
            },
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
              beginEditingDrag();
            },
            onEditPointDragEnd: () => {
              isDraggingRef.current = false;
              setCursor("crosshair");
              endEditingDrag();
            },
            onDraftGroupDragStart: () => {
              onDraftDragStart();
              beginDraftDrag();
            },
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
              beginDraftDrag();
            },
            onDraftPointDragEnd: () => {
              isDraggingRef.current = false;
              setCursor("crosshair");
              endDraftDrag();
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

      <PoiDialogs
        mapId={mapData.id!}
        categories={categories}
        activePoi={poiInteractions.activePoi}
        newPoiLocation={poiInteractions.newPoiLocation}
        onCloseNewPoi={() => poiInteractions.setNewPoiLocation(null)}
        onCloseEditPoi={() => poiInteractions.setActivePoi(null)}
      />

      <MapOverlays
        isMobile={overlayIsMobile}
        toolbar={toolbar}
        hints={hints}
        areaUi={areaUi}
        layers={layers}
        layerVisibility={layerVisibility}
        imageVisible={imageVisible}
        imageOpacity={imageOpacity}
        onToggleLayerVisibility={toggleLayerVisibility}
        onToggleImageVisibility={() => setImageVisible(!imageVisible)}
        onImageOpacityChange={setImageOpacity}
        onOpenLayerSidebar={() => setIsLayerSidebarOpen(true)}
      />

      <LayerSidebar
        mapId={mapData.id!}
        layers={layers}
        areas={mapAreas}
        isOpen={isLayerSidebarOpen}
        onClose={() => setIsLayerSidebarOpen(false)}
        onToggleLayerVisibility={toggleLayerVisibility}
        onMoveAreaToLayer={handleMoveAreaToLayer}
      />

      <DraftToolSwitchDialog
        open={isDraftGuardOpen}
        onOpenChange={setIsDraftGuardOpen}
        onKeepEditing={() => {
          setPendingAction(null);
          setIsDraftGuardOpen(false);
          if (!poiInteractions.isEditMode) {
            poiInteractions.setIsEditMode(true);
          }
          if (poiInteractions.activeTool !== "add_area") {
            poiInteractions.setActiveTool("add_area");
          }
        }}
        onDiscard={() => {
          resetDraft();
          if (pendingAction?.type === "tool") {
            poiInteractions.setActiveTool(pendingAction.tool);
          }
          setPendingAction(null);
          setIsDraftGuardOpen(false);
        }}
      />

    </div>
  );
}
