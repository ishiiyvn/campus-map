"use client";

import { useRef, useEffect, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Group, Circle } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { MapOutput } from "@/lib/validators/map";
import { Category, PointOfInterest } from "@/server/db/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddPoiForm from "../pois/add-poi-form";
import EditPoiForm from "../pois/edit-poi-form";
import { MapEditorToolbar, EditorTool } from "./map-editor-toolbar";

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
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  // State for interaction
  const isMobile = useIsMobile();
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTool, setActiveTool] = useState<EditorTool>("select");
  
  // Modal State
  const [newPoiLocation, setNewPoiLocation] = useState<{ x: number; y: number } | null>(null);
  const [activePoi, setActivePoi] = useState<PointOfInterest | null>(null);

  // Handle window resize to keep stage responsive
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Ensure edit mode is disabled on mobile
  useEffect(() => {
    if (isMobile) {
      setIsEditMode(false);
    }
  }, [isMobile]);

  // Zoom Logic
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    // Apply limits from config
    const minZoom = mapData.viewport_config.minzoom || 0.1;
    const maxZoom = mapData.viewport_config.maxzoom || 5;
    
    // Clamp scale
    if (newScale < minZoom) newScale = minZoom;
    if (newScale > maxZoom) newScale = maxZoom;

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    stage.position(newPos);
    stage.scale({ x: newScale, y: newScale });
    stage.batchDraw();
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isEditMode) return;

    // If we are in "Add POI" mode, capture the click
    if (activeTool === "add_poi") {
        const stage = e.target.getStage();
        if (!stage) return;

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        // Convert pointer (screen pixels) to map coordinates (image pixels)
        // We need to account for stage position (panning) and scale (zoom)
        const transform = stage.getAbsoluteTransform().copy();
        transform.invert();
        const clickPos = transform.point(pointer);

        setNewPoiLocation({ x: clickPos.x, y: clickPos.y });
        
        // Reset tool after click (optional, but good UX)
        setActiveTool("select");
    }
  };

  const handlePoiClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, poi: PointOfInterest) => {
    // Stop propagation so we don't trigger stage click
    e.cancelBubble = true;

    if (isEditMode && activeTool === "select") {
        setActivePoi(poi);
    } else {
        console.log("Viewing POI:", poi.name);
        // TODO: Show a read-only tooltip or info card here for normal users
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-100 overflow-hidden relative">
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={handleStageClick} // Support touch (though disabled for edit)
        draggable={activeTool === "select"} // Only drag when selecting/viewing
        ref={stageRef}
        className={cn(
            activeTool === "add_poi" ? "cursor-crosshair" : "cursor-move"
        )}
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
                    onClick={(e) => handlePoiClick(e, poi)}
                    onTap={(e) => handlePoiClick(e, poi)}
                    onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = "pointer";
                    }}
                    onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = activeTool === "add_poi" ? "crosshair" : "move";
                    }}
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
        isEditMode={isEditMode}
        onEditModeChange={setIsEditMode}
        activeTool={activeTool}
        onToolChange={setActiveTool}
        visible={!isMobile}
      />
      
      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-4 right-4 bg-white/80 p-2 rounded shadow backdrop-blur-sm text-xs pointer-events-none">
        Scroll to Zoom • Drag to Pan
      </div>

      {/* Modals */}
      <Dialog open={!!newPoiLocation} onOpenChange={(open) => !open && setNewPoiLocation(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Marker</DialogTitle>
            </DialogHeader>
            {newPoiLocation && (
                <AddPoiForm 
                    mapId={mapData.id!} // mapData.id should be present
                    categories={categories}
                    defaultCoordinates={newPoiLocation}
                    onSuccess={() => setNewPoiLocation(null)}
                />
            )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!activePoi} onOpenChange={(open) => !open && setActivePoi(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Marker</DialogTitle>
            </DialogHeader>
            {activePoi && (
                <EditPoiForm 
                    poi={activePoi} 
                    categories={categories}
                    onSuccess={() => setActivePoi(null)}
                />
            )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
