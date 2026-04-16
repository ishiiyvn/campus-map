"use client";
import type { AreaUiProps } from "@/components/areas/overlays/area-ui";
import type { EditorTool } from "@/components/maps/editor-tools/map-editor-toolbar";
import { MapEditorToolbar } from "@/components/maps/editor-tools/map-editor-toolbar";
import { MapOverlayHints } from "@/components/maps/overlays/map-overlay-hints";
import { AreaUi } from "@/components/areas/overlays/area-ui";
import type { Layer } from "@/server/db/schema";

interface MapOverlaysProps {
  isMobile: boolean;
  showToolbar?: boolean;
  showAreaUi?: boolean;
  toolbar: {
    isEditMode: boolean;
    activeTool: EditorTool;
    onEditModeChange: (enabled: boolean) => void;
    onToolChange: (tool: EditorTool) => void;
  };
  hints: {
    isEditMode: boolean;
    activeTool: EditorTool;
    isMobile: boolean;
    sidebarCollapsed?: boolean;
  };
  areaUi: AreaUiProps;
  layers?: Layer[];
  layerVisibility?: Record<number, boolean>;
  imageVisible?: boolean;
  imageOpacity?: number;
  onToggleLayerVisibility?: (layerId: number) => void;
  onToggleImageVisibility?: () => void;
  onImageOpacityChange?: (opacity: number) => void;
  onOpenLayerSidebar?: () => void;
}

export function MapOverlays({
  isMobile,
  showToolbar = true,
  showAreaUi = true,
  toolbar,
  hints,
  areaUi,
  layers = [],
  layerVisibility = {},
  imageVisible = true,
  imageOpacity = 1,
  onToggleLayerVisibility,
  onToggleImageVisibility,
  onImageOpacityChange,
  onOpenLayerSidebar,
}: MapOverlaysProps) {
  return (
    <>
      {showToolbar && (
        <div className="fixed top-18 right-4 pointer-events-auto z-50">
          <MapEditorToolbar
            isEditMode={toolbar.isEditMode}
            onEditModeChange={toolbar.onEditModeChange}
            activeTool={toolbar.activeTool}
            onToolChange={toolbar.onToolChange}
            visible={!isMobile}
            layers={layers}
            layerVisibility={layerVisibility}
            imageVisible={imageVisible}
            imageOpacity={imageOpacity}
            onToggleLayerVisibility={onToggleLayerVisibility}
            onToggleImageVisibility={onToggleImageVisibility}
            onImageOpacityChange={onImageOpacityChange}
            onOpenLayerSidebar={onOpenLayerSidebar}
          />
        </div>
      )}

      {/* Full-canvas overlays */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        {showAreaUi && <AreaUi {...areaUi} />}
        <MapOverlayHints
          isEditMode={hints.isEditMode}
          activeTool={hints.activeTool}
          isMobile={hints.isMobile}
          showZoomHint
          sidebarCollapsed={hints.sidebarCollapsed}
        />
      </div>
    </>
  );
}
