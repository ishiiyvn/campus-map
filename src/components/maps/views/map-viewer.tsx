"use client";

// db
import { Area, Category, PointOfInterest, Layer as DbLayer, Level } from "@/server/db/schema";

// zod validators
import { MapOutput } from "@/lib/validators/map";

// server actions
import { updateArea as updateAreaAction, reorderAreasInLayer } from "@/server/actions/areas";

// components
import { PoiLayer } from "@/components/pois/layers/poi-layer";
import { PoiDialogs } from "@/components/pois/overlays/poi-dialogs";
import { PoiIconLayer } from "@/components/pois/layers/poi-icon-layer";
import { AreasLayersGroup } from "@/components/areas/layers/areas-layers-group";
import { MapOverlays } from "@/components/maps/overlays/map-overlays";
import { PoiSidebar } from "@/components/pois/sidebar/poi-sidebar";

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
}


export default function MapViewer({ mapData, pois, categories, areas, layers = [], readOnly = true }: MapViewerProps) {
  // readOnly is currently unused but kept for interface compatibility
  void readOnly;

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
    { type: "tool"; tool: "select" | "add_poi" | "add_area" } | { type: "editModeOff" } | null
  >(null);

  // Layer visibility state
  const [layerVisibility, setLayerVisibility] = useState<Record<number, boolean>>({});
  const [imageVisible, setImageVisible] = useState(true);
  const [imageOpacity, setImageOpacity] = useState(1);
  const [isLayerSidebarOpen, setIsLayerSidebarOpen] = useState(false);

  // POI visibility state
  const [poiVisibility, setPoiVisibility] = useState<Record<number, boolean>>({});
  const [poiSidebarCollapsed, setPoiSidebarCollapsed] = useState(true);
  const [poiSearchQuery, setPoiSearchQuery] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [allLevels, setAllLevels] = useState<Level[]>([]);
  const [activePoiMenu, setActivePoiMenu] = useState<{ poi: PointOfInterest; position: { x: number; y: number } } | null>(null);
  const [activeAreaMenu, setActiveAreaMenu] = useState<{ areaId: number; position: { x: number; y: number } } | null>(null);
  const [repositionPoiId, setRepositionPoiId] = useState<number | null>(null);
  const [repositioning, setRepositioning] = useState(false);
  const [poiCoords, setPoiCoords] = useState<Record<number, { x: number; y: number }>>({});

  // Fetch all levels for level selector
  useEffect(() => {
    import("@/server/actions/levels").then(({ getAllLevels }) => {
      getAllLevels()
        .then(setAllLevels)
        .catch(console.error);
    });
  }, []);

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

  const { mapAreas, addArea, updateArea: updateAreaState, removeArea } = useMapAreasState(areas);

  const [mapLayers, setMapLayers] = useState<DbLayer[]>(layers);

  useEffect(() => {
    setMapLayers(layers);
  }, [layers]);

  const handleReorderLayers = useCallback((orderedLayers: DbLayer[]) => {
    setMapLayers(orderedLayers);
  }, []);

  const handleMoveAreaToLayer = useCallback(async (areaId: number, newLayerId: number | null) => {
    try {
      const updatedArea = await updateAreaAction(areaId, { layer_id: newLayerId });
      if (updatedArea) {
        updateAreaState(updatedArea);
      }
    } catch (error) {
      console.error("Error moving area to layer:", error);
    }
  }, []);

  const handleReorderAreasInLayer = useCallback(async (layerId: number, orderedAreaIds: number[]) => {
    try {
      await reorderAreasInLayer(layerId, orderedAreaIds);

      // Update local state with new display_order values
      orderedAreaIds.forEach((areaId, index) => {
        const area = mapAreas.find(a => a.id === areaId);
        if (area) {
          updateAreaState({ ...area, display_order: index });
        }
      });
    } catch (error) {
      console.error("Error reordering areas in layer:", error);
    }
  }, [mapAreas, updateAreaState]);

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

  const { onWheel, setScale, minZoom, maxZoom, handleDragEnd: onStageDragEnd } = useStageZoom({
    stageRef,
    viewportConfig: mapData.viewport_config,
    onScaleUpdate: updateScaleFromStage,
  });

  const areaLines = useMemo(() => buildAreaRenderData(mapAreas), [mapAreas]);

  type PoiWithLevels = PointOfInterest & { level_ids?: number[] };
  const filteredPois = useMemo(() => {
    const basePois = selectedLevelId === null ? pois : (pois as PoiWithLevels[]).filter((poi) => {
      const poiLevels = poi.level_ids || [];
      return poiLevels.length === 0 || poiLevels.includes(selectedLevelId);
    });
    return basePois
      .filter((poi) => poiVisibility[poi.category_id] ?? true)
      .map((poi) => {
        const localCoords = poiCoords[poi.id];
        if (localCoords) {
          return { ...poi, x_coordinate: localCoords.x, y_coordinate: localCoords.y };
        }
        return poi;
      });
  }, [pois, selectedLevelId, poiCoords, poiVisibility]);

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
    sidebarCollapsed: poiSidebarCollapsed,
    mapAreas,
    editingAreaId,
    editingAreaSnapshot,
    draftPoints: draftAreaPoints,
    editPoints: editingPoints,
    draftUndoStack,
    editingUndoStack,
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

  const { onDraftDragStart, onEditDragStart } = useMapInteractions({
    isDraggingRef,
    updateCursor: setCursor,
  });

  return (
    <div className="flex w-full h-full">
      <div className={cn(
        "relative flex-shrink-0 h-full transition-all duration-200",
        poiSidebarCollapsed ? "w-0" : "w-72"
      )}>
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
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden' as const,
        }}
        onContextMenu={(event) => {
          event.preventDefault();
        }}
        onTouchStart={(event) => {
          event.preventDefault();
        }}
        onTouchMove={(event) => {
          event.preventDefault();
        }}
        onTouchEnd={(event) => {
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
            layers={mapLayers}
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
              onAreaContextMenu: (areaId, screenPos) => {
                if (!containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                setActiveAreaMenu({ 
                  areaId, 
                  position: { x: screenPos.x - rect.left, y: screenPos.y - rect.top } 
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
                poiInteractions.setNewPoiLocation({ x: point.x, y: point.y, areaId });
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
            pois={filteredPois}
            categories={categories}
            isEditMode={poiInteractions.isEditMode}
            onPoiContextMenu={(poi, screenPos) => {
              if (!containerRef.current) return;
              const rect = containerRef.current.getBoundingClientRect();
              setActivePoiMenu({
                poi,
                position: { x: screenPos.x - rect.left, y: screenPos.y - rect.top },
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
              setActivePoiMenu({ poi, position: { x: screenPos.x - rect.left, y: screenPos.y - rect.top } });
            }}
            onPoiMove={async (poiId, x, y) => {
              const poi = pois.find((p) => p.id === poiId);
              if (!poi) return;
              try {
                const { updatePoiCoordinates } = await import("@/server/actions/pois");
                await updatePoiCoordinates(poiId, x, y);
                setPoiCoords((prev) => ({ ...prev, [poiId]: { x, y } }));
                setRepositioning(false);
                setRepositionPoiId(null);
                poiInteractions.setActivePoiForEdit({ ...poi, x_coordinate: x, y_coordinate: y });
              } catch (error) {
                console.error("Error updating POI coordinates:", error);
              }
            }}
            onDragStart={() => { }}
            onDragEnd={() => { }}
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
          onCloseEditPoiFromContext={() => poiInteractions.setActivePoiForEdit(null)}
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
        />

        <AreaActionMenu
          area={activeAreaMenu ? mapAreas.find((a) => a.id === activeAreaMenu.areaId) ?? null : null}
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
