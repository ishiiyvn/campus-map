"use client";

// db
import {
  Area,
  Category,
  PointOfInterest,
  Layer as DbLayer,
  Level,
} from "@/server/db/schema";

// zod validators
import { MapOutput } from "@/lib/validators/map";

// server actions
import {
  createArea,
  updateArea as updateAreaAction,
  reorderAreasInLayer,
} from "@/server/actions/areas";

// components
import { PoiLayer } from "@/components/pois/layers/poi-layer";
import { PoiDialogs } from "@/components/pois/overlays/poi-dialogs";
import { PoiIconLayer } from "@/components/pois/layers/poi-icon-layer";
import { AreasLayersGroup } from "@/components/areas/layers/areas-layers-group";
import { MapOverlays } from "@/components/maps/overlays/map-overlays";
import { PoiSidebar } from "@/components/pois/sidebar/poi-sidebar";

// konva components
import { Stage } from "react-konva";
import Konva from "konva";

// hooks
import { useCallback, useRef, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useStageZoom } from "@/components/maps/hooks/use-stage-zoom";
import { usePoiInteractions } from "@/components/maps/hooks/use-poi-interactions";
import { useStageSize } from "@/components/maps/hooks/use-stage-size";
import { useAreaDraft } from "@/components/areas/hooks/use-area-draft";
import { useCircleDraft } from "@/components/areas/hooks/use-circle-draft";
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
import { PoiActionMenu } from "@/components/pois/overlays/poi-action-menu";
import { AreaActionMenu } from "@/components/areas/overlays/area-action-menu";
import { Button } from "@/components/ui/button";
import { PanelRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapViewerProps {
  mapData: MapOutput;
  pois: PointOfInterest[];
  categories: Category[];
  areas: Area[];
  layers?: DbLayer[];
  readOnly?: boolean;
  levels?: Level[]; // provided by server wrapper
}

export default function MapViewer({
  mapData,
  pois,
  categories,
  areas,
  layers = [],
  readOnly = true,
  levels = [],
}: MapViewerProps) {
  // readOnly is currently unused but kept for interface compatibility
  void readOnly;

  const router = useRouter();

  // Suppress known non-critical Konva canvas error
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      const message = args[0];
      if (typeof message === "string" && message.includes("drawImage")) {
        return;
      }
      originalError(...args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageSize = useStageSize(containerRef);
  const {
    stageScale,
    isDraggingRef,
    updateScaleFromStage,
    updateScale,
    getPointerMapPosition,
  } = useMapStage(stageRef, {
    width: stageSize.width,
    height: stageSize.height,
  });
  const pointRadius = Math.max(2, 6 / stageScale);
  const dashArray: [number, number] = [
    8 / Math.sqrt(stageScale),
    6 / Math.sqrt(stageScale),
  ];
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

  const [drawMode, setDrawMode] = useState<"polygon" | "circle">("polygon");

  const {
    center: circleCenter,
    radius: circleRadius,
    hasCircle,
    circlePoints: circleDraftPoints,
    circlePointsFlat: circleDraftPointsFlat,
    startCircle,
    updateRadius,
    finishDragging: finishCircleDragging,
    moveCircleBy,
    resetCircle: resetCircleDraft,
    getCirclePoints,
    validate: validateCircle,
  } = useCircleDraft();
  const {
    editingAreaId,
    editingPoints,
    editingUndoStack,
    isEditAreaDialogOpen,
    editingAreaSnapshot,
    isEditing,
    setEditingAreaId,
    setIsEditAreaDialogOpen,
    setEditingAreaSnapshot,
    startEditingArea,
    openEditInfo,
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
    | { type: "tool"; tool: "select" | "add_poi" | "add_area" }
    | { type: "editModeOff" }
    | null
  >(null);

  // Layer visibility state
  const [layerVisibility, setLayerVisibility] = useState<
    Record<number, boolean>
  >({});
  const [imageVisible, setImageVisible] = useState(true);
  const [imageOpacity, setImageOpacity] = useState(1);
  const [isLayerSidebarOpen, setIsLayerSidebarOpen] = useState(false);

  // POI visibility state
  const [poiVisibility, setPoiVisibility] = useState<Record<number, boolean>>(
    {},
  );
  const [poiSidebarCollapsed, setPoiSidebarCollapsed] = useState(true);
  const [poiSearchQuery, setPoiSearchQuery] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [allLevels, setAllLevels] = useState<Level[]>(levels);
  const [activePoiMenu, setActivePoiMenu] = useState<{
    poi: PointOfInterest;
    position: { x: number; y: number };
  } | null>(null);
  const [activeAreaMenu, setActiveAreaMenu] = useState<{
    areaId: number;
    position: { x: number; y: number };
  } | null>(null);
  const [repositionPoiId, setRepositionPoiId] = useState<number | null>(null);
  const [repositioning, setRepositioning] = useState(false);
  const [poiCoords, setPoiCoords] = useState<
    Record<number, { x: number; y: number }>
  >({});

  // Local copy of POIs so we can update the UI immediately after a delete
  const [localPois, setLocalPois] = useState<PointOfInterest[]>(pois);
  useEffect(() => {
    // Keep localPois in sync if the parent props change
    setLocalPois(pois);
  }, [pois]);

  const handlePoiDeleted = useCallback((deletedId: number) => {
    setLocalPois((prev) => prev.filter((p) => p.id !== deletedId));
    // Close any open menus related to the deleted POI
    setActivePoiMenu(null);
  }, []);

  // If levels prop ever changes, sync local state
  useEffect(() => {
    setAllLevels(levels);
  }, [levels]);

  // Initialize POI visibility from categories
  useEffect(() => {
    const initialVisibility: Record<number, boolean> = {};
    categories.forEach((category) => {
      initialVisibility[category.id] = category.is_map_level_default;
    });
    setPoiVisibility(initialVisibility);
  }, [categories]);

  const togglePoiVisibility = useCallback((categoryId: number) => {
    setPoiVisibility((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  }, []);

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

  const {
    mapAreas,
    addArea,
    updateArea: updateAreaState,
    removeArea,
  } = useMapAreasState(areas);

  const [mapLayers, setMapLayers] = useState<DbLayer[]>(layers);

  useEffect(() => {
    setMapLayers(layers);
  }, [layers]);

  const handleReorderLayers = useCallback((orderedLayers: DbLayer[]) => {
    setMapLayers(orderedLayers);
  }, []);

  const handleMoveAreaToLayer = useCallback(
    async (areaId: number, newLayerId: number | null) => {
      try {
        const updatedArea = await updateAreaAction(areaId, {
          layer_id: newLayerId,
        });
        if (updatedArea) {
          updateAreaState(updatedArea);
        }
      } catch (error) {
        console.error("Error moving area to layer:", error);
      }
    },
    [updateAreaState],
  );

  const handleReorderAreasInLayer = useCallback(
    async (layerId: number, orderedAreaIds: number[]) => {
      try {
        await reorderAreasInLayer(layerId, orderedAreaIds);

        // Update local state with new display_order values
        orderedAreaIds.forEach((areaId, index) => {
          const area = mapAreas.find((a) => a.id === areaId);
          if (area) {
            updateAreaState({ ...area, display_order: index });
          }
        });
      } catch (error) {
        console.error("Error reordering areas in layer:", error);
      }
    },
    [mapAreas, updateAreaState],
  );

  // State for interaction
  const isMobile = useIsMobile();

  // State for edit mode and tools
  const addDraftPointHandler = useCallback(
    (point: { x: number; y: number }) => {
      if (drawMode === "circle") {
        startCircle(point);
      } else {
        addDraftPoint(point);
      }
    },
    [addDraftPoint, drawMode, startCircle],
  );

  const poiInteractions = usePoiInteractions(stageRef, {
    onAreaPointAdd: addDraftPointHandler,
  });

  const isDraftActive = draftAreaPoints.length > 0 || hasCircle;

  const requestToolChange = useCallback(
    (tool: "select" | "add_poi" | "add_area") => {
      if (tool === poiInteractions.activeTool) return;
      if (isDraftActive && tool !== "add_area") {
        setPendingAction({ type: "tool", tool });
        setIsDraftGuardOpen(true);
        return;
      }
      poiInteractions.setActiveTool(tool);
    },
    [isDraftActive, poiInteractions],
  );

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
    if (
      wasEditMode &&
      !poiInteractions.isEditMode &&
      isDraftActive &&
      !isDraftGuardOpen
    ) {
      setPendingAction({ type: "editModeOff" });
      setIsDraftGuardOpen(true);
    }
    wasEditModeRef.current = poiInteractions.isEditMode;
  }, [isDraftActive, isDraftGuardOpen, poiInteractions.isEditMode]);

  const {
    onWheel,
    setScale,
    zoomAt,
    minZoom,
    maxZoom,
    handleDragEnd: onStageDragEnd,
    stopInertia,
  } = useStageZoom({
    stageRef,
    viewportConfig: mapData.viewport_config,
    onScaleUpdate: updateScale,
  });

  const areaLines = useMemo(() => buildAreaRenderData(mapAreas), [mapAreas]);

  type PoiWithLevels = PointOfInterest & { level_ids?: number[] };
  const filteredPois = useMemo(() => {
    const basePois =
      selectedLevelId === null
        ? localPois
        : (localPois as PoiWithLevels[]).filter((poi) => {
            const poiLevels = poi.level_ids || [];
            return (
              poiLevels.length === 0 || poiLevels.includes(selectedLevelId)
            );
          });
    return basePois
      .filter((poi) => poiVisibility[poi.category_id] ?? true)
      .map((poi) => {
        const localCoords = poiCoords[poi.id];
        if (localCoords) {
          return {
            ...poi,
            x_coordinate: localCoords.x,
            y_coordinate: localCoords.y,
          };
        }
        return poi;
      });
  }, [localPois, selectedLevelId, poiCoords, poiVisibility]);

  const handleDraftFinish = () => {
    if (drawMode === "circle") {
      handleDraftFinishAuto();
    } else {
      openDraftDialogIfValid(() => setIsAreaDialogOpen(true));
    }
  };

  const handleEditUndo = () => {
    undoEditing();
  };

  const handleDraftUndo = () => {
    undoDraft();
  };

  const handleDraftCancel = () => {
    resetDraft();
    resetCircleDraft();
  };

  const handleEditCancel = () => {
    cancelEditing();
  };

  const handleDraftFinishAuto = useCallback(async () => {
    let polygonCoordinates;

    if (drawMode === "circle") {
      if (!validateCircle()) return;
      polygonCoordinates = getCirclePoints(36);
    } else {
      if (draftAreaPoints.length < 3) {
        toast.error("Agrega al menos 3 puntos para crear un área");
        return;
      }
      polygonCoordinates = draftAreaPoints;
    }

    try {
      const areaCount = mapAreas.length;
      const newArea = await createArea({
        name: `Área ${areaCount + 1}`,
        code: `area-${areaCount + 1}`,
        description: "",
        map_id: mapData.id!,
        polygon_coordinates: polygonCoordinates,
      });

      addArea(newArea as Area);
      resetDraft();
      resetCircleDraft();
      setDrawMode("polygon");
      poiInteractions.setActiveTool("select");
      toast.success("Área creada");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al crear el área");
    }
  }, [
    draftAreaPoints,
    drawMode,
    getCirclePoints,
    validateCircle,
    mapAreas,
    mapData.id,
    addArea,
    resetDraft,
    resetCircleDraft,
    poiInteractions,
    router,
  ]);

  const handleEditFinishAuto = useCallback(async () => {
    if (editingAreaId === null || editingPoints.length < 3) {
      toast.error("Agrega al menos 3 puntos para guardar el área");
      return;
    }

    const area = mapAreas.find((a) => a.id === editingAreaId);
    if (!area) return;

    try {
      const updated = await updateAreaAction(editingAreaId, {
        name: area.name,
        code: area.code,
        description: area.description,
        map_id: area.map_id,
        layer_id: area.layer_id,
        polygon_coordinates: editingPoints,
      });

      updateAreaState(updated as Area);
      cancelEditing();
      toast.success("Área actualizada");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el área");
    }
  }, [
    editingAreaId,
    editingPoints,
    mapAreas,
    updateAreaState,
    cancelEditing,
    router,
  ]);

  const {
    toolbar,
    hints,
    areaUi,
    isMobile: overlayIsMobile,
  } = useMapOverlaysProps({
    mapId: mapData.id!,
    isMobile,
    isEditMode: poiInteractions.isEditMode,
    activeTool: poiInteractions.activeTool,
    onEditModeChange: poiInteractions.setIsEditMode,
    onToolChange: requestToolChange,
    sidebarCollapsed: poiSidebarCollapsed,
    mapAreas,
    editingAreaId,
    editingAreaSnapshot,
    draftPoints: draftAreaPoints,
    editPoints: editingPoints,
    draftUndoStack,
    editingUndoStack,
    drawMode,
    onDrawModeChange: (mode) => {
      setDrawMode(mode);
      // Reset draft when switching modes
      if (mode === "circle") {
        resetDraft();
      } else {
        resetCircleDraft();
      }
    },
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
    onEditFinishAuto: handleEditFinishAuto,
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
    },
  });

  const { setCursor, stageProps } = useStageInteractions({
    stageRef,
    isDraggingRef,
    editingAreaId,
    editingPoints,
    insertEditingPointAtNearestEdge,
    getPointerMapPosition,
    poiInteractions,
    onDragEnd: onStageDragEnd,
  });

  const { handleDraftDragEnd, handleEditDragEnd } = useAreaDragHandlers({
    isDraggingRef,
    setCursor,
    moveDraftBy,
    moveEditingBy,
    endDraftDrag,
    endEditingDrag,
  });

  const handleCircleDragEnd = useCallback(
    (event: Konva.KonvaEventObject<DragEvent>) => {
      const node = event.target;
      const dx = node.x();
      const dy = node.y();
      if (dx !== 0 || dy !== 0) {
        moveCircleBy(dx, dy);
        node.position({ x: 0, y: 0 });
      }
      isDraggingRef.current = false;
      setCursor("crosshair");
      endDraftDrag();
    },
    [moveCircleBy, setCursor, endDraftDrag, isDraggingRef],
  );

  const { onDraftDragStart, onEditDragStart } = useMapInteractions({
    isDraggingRef,
    updateCursor: setCursor,
  });

  // Pinch-to-zoom and single-finger pan support
  const isPinchingRef = useRef(false);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const initialPinchScaleRef = useRef<number>(1);
  const lastPinchCenterRef = useRef<{ x: number; y: number } | null>(null);
  const lastPinchScaleRef = useRef<number | null>(null);

  const getTouchDistance = (t0: any, t1: any) => Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
  const getTouchMidpoint = (t0: any, t1: any) => ({ x: (t0.clientX + t1.clientX) / 2, y: (t0.clientY + t1.clientY) / 2 });

  const handleTouchStart = useCallback((e: any) => {
    if (e.touches.length >= 2) {
      // start pinch
      stopInertia();
      isPinchingRef.current = true;
      const stage = stageRef.current;
      if (stage) {
        stage.stopDrag();
        stage.draggable(false);
      }
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const distance = getTouchDistance(t0, t1);
      initialPinchDistanceRef.current = distance;
      initialPinchScaleRef.current = stage ? stage.scaleX() : 1;
      const mid = getTouchMidpoint(t0, t1);
      if (stage) {
        const rect = stage.container().getBoundingClientRect();
        lastPinchCenterRef.current = {
          x: mid.x - rect.left,
          y: mid.y - rect.top,
        };
      } else {
        lastPinchCenterRef.current = null;
      }
      lastPinchScaleRef.current = initialPinchScaleRef.current;
    }
    // allow single-finger gestures (pan) to be handled by Konva
  }, [stopInertia, stageRef]);

  const handleTouchMove = useCallback((e: any) => {
    if (!isPinchingRef.current) return;
    if (e.touches.length < 2) return;
    e.preventDefault();
    const t0 = e.touches[0];
    const t1 = e.touches[1];
    const distance = getTouchDistance(t0, t1);
    const initial = initialPinchDistanceRef.current;
    if (!initial) return;
    const scaleFactor = distance / initial;
    const targetScale = Math.min(Math.max(initialPinchScaleRef.current * scaleFactor, minZoom), maxZoom);
    const stage = stageRef.current;
    if (!stage) return;
    const centerScreen = getTouchMidpoint(t0, t1);
    const rect = stage.container().getBoundingClientRect();
    const center = {
      x: centerScreen.x - rect.left,
      y: centerScreen.y - rect.top,
    };
    const oldScale = stage.scaleX();
    const clampedScale = Math.min(Math.max(targetScale, minZoom), maxZoom);
    const pointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };
    const lastCenter = lastPinchCenterRef.current;
    const delta = lastCenter
      ? {
          x: center.x - lastCenter.x,
          y: center.y - lastCenter.y,
        }
      : { x: 0, y: 0 };

    stage.scale({ x: clampedScale, y: clampedScale });
    stage.position({
      x: center.x - pointTo.x * clampedScale + delta.x,
      y: center.y - pointTo.y * clampedScale + delta.y,
    });
    stage.batchDraw();

    updateScale(clampedScale);
    lastPinchCenterRef.current = center;
    lastPinchScaleRef.current = targetScale;
  }, [maxZoom, minZoom, stageRef, updateScale]);

  const handleTouchEnd = useCallback((e: any) => {
    if (!isPinchingRef.current) return;
    if (e.touches.length >= 2) return; // still pinching
    e.preventDefault();
    isPinchingRef.current = false;
    const stage = stageRef.current;
    if (stage) {
      stage.draggable(
        poiInteractions.activeTool === "select" ||
          poiInteractions.activeTool === "add_area",
      );
    }
    const finalScale = lastPinchScaleRef.current ?? initialPinchScaleRef.current;
    if (lastPinchCenterRef.current && stage) {
      if (zoomAt) zoomAt(lastPinchCenterRef.current, finalScale ?? 1, true);
    } else if (finalScale != null && stage) {
      const centerX = stage.width() / 2;
      const centerY = stage.height() / 2;
      if (zoomAt) zoomAt({ x: centerX, y: centerY }, finalScale, true);
    }
    initialPinchDistanceRef.current = null;
    lastPinchCenterRef.current = null;
    lastPinchScaleRef.current = null;
  }, [zoomAt, stageRef, poiInteractions.activeTool]);

  return (
    <div className="flex w-full h-full">
      <div
        className={cn(
          "relative flex-shrink-0 h-full transition-all duration-200",
          poiSidebarCollapsed ? "w-0" : "w-72",
        )}
      >
        <PoiSidebar
          categories={categories}
          levels={allLevels}
          visibility={poiVisibility}
          onVisibilityChange={togglePoiVisibility}
          onSearch={setPoiSearchQuery}
          searchQuery={poiSearchQuery}
          selectedLevelId={selectedLevelId}
          onSelectLevel={setSelectedLevelId}
          collapsed={poiSidebarCollapsed}
          onCollapseChange={setPoiSidebarCollapsed}
        />
        {poiSidebarCollapsed && !isMobile && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 left-3 z-40 h-9 w-9"
            onClick={() => setPoiSidebarCollapsed(false)}
          >
            <PanelRightIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex-1 relative bg-slate-100 overflow-hidden touch-none"
        style={{
          willChange: "transform",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden" as const,
        }}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
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
            layers={mapLayers}
            layerVisibility={layerVisibility}
            data={{
              areaLines,
              editingAreaId,
              editingPoints,
              draftPoints: draftAreaPoints,
              draftPointsFlat: draftAreaPointsFlat,
              pointRadius,
              dashArray,
              circleCenter,
              circleRadius,
              circlePointsFlat: circleDraftPointsFlat,
              drawMode,
            }}
            flags={{
              isEditMode: poiInteractions.isEditMode,
              activeTool: poiInteractions.activeTool,
            }}
            handlers={{
              onAreaContextMenu: (areaId, screenPos) => {
                if (!containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                setActiveAreaMenu({
                  areaId,
                  position: {
                    x: screenPos.x - rect.left,
                    y: screenPos.y - rect.top,
                  },
                });
              },
              onAreaClick: (areaId, event) => {
                if (poiInteractions.activeTool !== "add_poi") return;
                event.cancelBubble = true;
                const stage = event.target.getStage();
                if (!stage) return;
                const pointer = stage.getPointerPosition();
                if (!pointer) return;
                const point = getPointerMapPosition();
                if (!point) return;
                poiInteractions.setNewPoiLocation({
                  x: point.x,
                  y: point.y,
                  areaId,
                });
                poiInteractions.setActiveTool("select");
              },
              onEditGroupDragStart: () => {
                onEditDragStart();
                beginEditingDrag();
              },
              onEditGroupDragEnd: handleEditDragEnd,
              onEditInsertPoint: (event) => {
                if (!poiInteractions.isEditMode) return;
                if (isDraggingRef.current) return;
                if (event.evt instanceof MouseEvent && event.evt.button !== 0)
                  return;
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
                if (
                  !poiInteractions.isEditMode ||
                  poiInteractions.activeTool !== "add_area"
                )
                  return;
                if (isDraggingRef.current) return;
                if (event.evt instanceof MouseEvent && event.evt.button !== 0)
                  return;
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
              onCircleRadiusHandleDrag: (point) => {
                updateRadius(point);
              },
              onCircleRadiusHandleDragEnd: () => {
                finishCircleDragging();
              },
              onCircleGroupDragStart: () => {
                onDraftDragStart();
                beginDraftDrag();
              },
              onCircleGroupDragEnd: handleCircleDragEnd,
              onCircleGroupDragMove: () => {
                setCursor("grabbing");
              },
              onSetCursor: setCursor,
            }}
          />

          <PoiLayer
            pois={filteredPois}
            categories={categories}
            isEditMode={poiInteractions.isEditMode}
            onPoiContextMenu={(poi, screenPos) => {
              if (!containerRef.current) return;
              const rect = containerRef.current.getBoundingClientRect();
              setActivePoiMenu({
                poi,
                position: {
                  x: screenPos.x - rect.left,
                  y: screenPos.y - rect.top,
                },
              });
            }}
            onPoiMouseEnter={poiInteractions.handlePoiMouseEnter}
            onPoiMouseLeave={poiInteractions.handlePoiMouseLeave}
          />

          <PoiIconLayer
            pois={filteredPois}
            categories={categories}
            isEditMode={poiInteractions.isEditMode}
            repositioning={repositioning}
            repositionPoiId={repositionPoiId}
            onPoiContextMenu={(poi, screenPos) => {
              if (!containerRef.current) return;
              const rect = containerRef.current.getBoundingClientRect();
              setActivePoiMenu({
                poi,
                position: {
                  x: screenPos.x - rect.left,
                  y: screenPos.y - rect.top,
                },
              });
            }}
            onPoiMove={async (poiId, x, y) => {
              const poi = pois.find((p) => p.id === poiId);
              if (!poi) return;
              try {
                const { updatePoiCoordinates } =
                  await import("@/server/actions/pois");
                await updatePoiCoordinates(poiId, x, y);
                setPoiCoords((prev) => ({ ...prev, [poiId]: { x, y } }));
                setRepositioning(false);
                setRepositionPoiId(null);
                poiInteractions.setActivePoiForEdit({
                  ...poi,
                  x_coordinate: x,
                  y_coordinate: y,
                });
              } catch (error) {
                console.error("Error updating POI coordinates:", error);
              }
            }}
            onDragStart={() => {}}
            onDragEnd={() => {}}
          />
        </Stage>

        <PoiDialogs
          mapId={mapData.id!}
          categories={categories}
          areas={mapAreas}
          activePoi={poiInteractions.activePoi}
          activePoiForEdit={poiInteractions.activePoiForEdit}
          newPoiLocation={poiInteractions.newPoiLocation}
          onCloseNewPoi={() => poiInteractions.setNewPoiLocation(null)}
          onCloseEditPoi={() => poiInteractions.setActivePoi(null)}
          onCloseEditPoiFromContext={() =>
            poiInteractions.setActivePoiForEdit(null)
          }
          onDeleted={handlePoiDeleted}
        />

        <PoiActionMenu
          poi={activePoiMenu?.poi ?? null}
          position={activePoiMenu?.position ?? null}
          onClose={() => setActivePoiMenu(null)}
          onEdit={() => {
            if (activePoiMenu?.poi) {
              poiInteractions.setActivePoiForEdit(activePoiMenu.poi);
            }
          }}
          onReposition={() => {
            if (activePoiMenu?.poi) {
              setRepositionPoiId(activePoiMenu.poi.id);
              setRepositioning(true);
            }
          }}
          onDeleted={handlePoiDeleted}
        />

        <AreaActionMenu
          area={
            activeAreaMenu
              ? (mapAreas.find((a) => a.id === activeAreaMenu.areaId) ?? null)
              : null
          }
          position={activeAreaMenu?.position ?? null}
          onClose={() => setActiveAreaMenu(null)}
          onEditPolygon={() => {
            if (activeAreaMenu) {
              const area = mapAreas.find((a) => a.id === activeAreaMenu.areaId);
              if (area) {
                startEditingArea(area);
              }
            }
          }}
          onEditInfo={() => {
            if (activeAreaMenu) {
              const area = mapAreas.find((a) => a.id === activeAreaMenu.areaId);
              if (area) {
                openEditInfo(area);
              }
            }
          }}
          onDelete={() => {
            if (activeAreaMenu) {
              setDeleteTargetAreaId(activeAreaMenu.areaId);
              setIsDeleteDialogOpen(true);
            }
          }}
        />

        <LayerSidebar
          mapId={mapData.id!}
          layers={mapLayers}
          areas={mapAreas}
          isOpen={isLayerSidebarOpen}
          onClose={() => setIsLayerSidebarOpen(false)}
          onToggleLayerVisibility={toggleLayerVisibility}
          onMoveAreaToLayer={handleMoveAreaToLayer}
          onReorderAreasInLayer={handleReorderAreasInLayer}
          onReorderLayers={handleReorderLayers}
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

      {/* LayerSidebar is rendered inside the main map container; no duplicate here */}

      <MapOverlays
        isMobile={overlayIsMobile}
        toolbar={toolbar}
        hints={hints}
        areaUi={areaUi}
        layers={mapLayers}
        layerVisibility={layerVisibility}
        imageVisible={imageVisible}
        imageOpacity={imageOpacity}
        onToggleLayerVisibility={toggleLayerVisibility}
        onToggleImageVisibility={() => setImageVisible(!imageVisible)}
        onImageOpacityChange={setImageOpacity}
        onOpenLayerSidebar={() => setIsLayerSidebarOpen(true)}
      />
    </div>
  );
}
