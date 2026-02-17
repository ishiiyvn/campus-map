"use client";

// db
import { Category, PointOfInterest } from "@/server/db/schema";

// utils
import { cn } from "@/lib/utils";

// zod validators
import { MapOutput } from "@/lib/validators/map";

// components
import { AddPoiDialog } from "@/components/maps/dialogs/add-poi-dialog";
import { EditPoiDialog } from "@/components/maps/dialogs/edit-poi-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapEditorToolbar } from "../editor-tools/map-editor-toolbar";

// konva components
import { Stage, Layer, Image as KonvaImage, Group, Circle } from "react-konva";
import Konva from "konva";

// hooks
import { useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMapZoom } from "@/hooks/use-map-zoom";
import { usePoiInteractions } from "@/hooks/use-poi-interactions";
import { useStageSize } from "@/hooks/use-stage-size";
import useImage from "use-image";


interface MapViewerProps {
  mapData: MapOutput;
  pois: PointOfInterest[];
  categories: Category[];
  readOnly?: boolean;
}

// Background image component
const URLImage = ({ src, width, height }: { src: string; width: number; height: number }) => {
  const [image] = useImage(src);
  return <KonvaImage image={image} width={width} height={height} />;
};

export default function MapViewer({ mapData, pois, categories, readOnly = true }: MapViewerProps) {
  // readOnly is currently unused but kept for interface compatibility
  void readOnly;
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageSize = useStageSize(containerRef);

  // State for interaction
  const isMobile = useIsMobile();

  // State for edit mode and tools
  const poiInteractions = usePoiInteractions(stageRef);

  // Ensure edit mode is disabled on mobile
  useEffect(() => {
    if (isMobile) {
      poiInteractions.setIsEditMode(false);
    }
  }, [isMobile]);

  // Zoom Logic
  const { handleWheel } = useMapZoom(stageRef, mapData.viewport_config);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-100 overflow-hidden relative">
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        onClick={poiInteractions.handleStageClick}
        onTap={poiInteractions.handleStageClick} // Support touch (though disabled for edit)
        draggable={poiInteractions.activeTool === "select"} // Only drag when selecting/viewing
        ref={stageRef}
        className={cn(
          poiInteractions.activeTool === "add_poi" ? "cursor-crosshair" : "cursor-move"
        )}
        style={{
          cursor: poiInteractions.activeTool === "add_poi" ? "crosshair" : "move"
        }}
      >
        <Layer>
          <URLImage
            src={mapData.map_image_url}
            width={mapData.map_width}
            height={mapData.map_height}
          />
        </Layer>

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

    </div>
  );
}
