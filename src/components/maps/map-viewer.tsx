"use client";

import { useRef, useEffect, useState } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { MapOutput } from "@/lib/validators/map";

interface MapViewerProps {
  mapData: MapOutput;
  readOnly?: boolean;
}

// Background image component
const URLImage = ({ src, width, height }: { src: string; width: number; height: number }) => {
  const [image] = useImage(src);
  return <KonvaImage image={image} width={width} height={height} />;
};

export default function MapViewer({ mapData, readOnly = true }: MapViewerProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

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

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-100 overflow-hidden relative">
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        draggable
        ref={stageRef}
        className="cursor-move"
      >
        <Layer>
          <URLImage 
            src={mapData.map_image_url} 
            width={mapData.map_width} 
            height={mapData.map_height} 
          />
        </Layer>
      </Stage>
      
      {/* Zoom Controls Overlay (Optional but helpful) */}
      <div className="absolute bottom-4 right-4 bg-white/80 p-2 rounded shadow backdrop-blur-sm text-xs pointer-events-none">
        Scroll to Zoom • Drag to Pan
      </div>
    </div>
  );
}
