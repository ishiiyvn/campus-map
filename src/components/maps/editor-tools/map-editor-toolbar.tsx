"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPinPlus, MousePointer2, VectorSquare, Eye, EyeOff, Layers, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { Layer } from "@/server/db/schema";

export type EditorTool = "select" | "add_poi" | "add_area";

interface MapEditorToolbarProps {
  isEditMode: boolean;
  onEditModeChange: (enabled: boolean) => void;
  activeTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  className?: string;
  visible?: boolean;
  layers?: Layer[];
  layerVisibility?: Record<number, boolean>;
  imageVisible?: boolean;
  imageOpacity?: number;
  onToggleLayerVisibility?: (layerId: number) => void;
  onToggleImageVisibility?: () => void;
  onImageOpacityChange?: (opacity: number) => void;
  onOpenLayerSidebar?: () => void;
}

export function MapEditorToolbar({
  isEditMode,
  onEditModeChange,
  activeTool,
  onToolChange,
  className,
  visible = true,
  layers = [],
  layerVisibility = {},
  imageVisible = true,
  imageOpacity = 1,
  onToggleLayerVisibility,
  onToggleImageVisibility,
  onImageOpacityChange,
  onOpenLayerSidebar,
}: MapEditorToolbarProps) {
  const [showOpacityPanel, setShowOpacityPanel] = useState(false);

  if (!visible) return null;
  const t = useTranslations("toolbar");

  return (
    <div className={cn("absolute top-4 right-4 flex flex-col gap-4 items-end z-50", className)}>
      {/* Edit Mode Toggle */}
      <div className="bg-white/90 backdrop-blur shadow-md px-3 py-2 rounded-lg flex items-center gap-2">
        <Switch
          id="edit-mode"
          checked={isEditMode}
          onCheckedChange={onEditModeChange}
        />
        <Label htmlFor="edit-mode" className="text-sm font-medium cursor-pointer">
          {t("editModeLabel")}
        </Label>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {isEditMode ? t("editModeOn") : t("editModeOff")}
        </span>
      </div>

      {/* Toolbar Controls */}
      {isEditMode && (
        <div className="bg-white/90 backdrop-blur shadow-md p-1 rounded-lg flex flex-col gap-1">
          <Button
            variant={activeTool === "select" ? "default" : "ghost"}
            size="icon"
            onClick={() => onToolChange("select")}
            title={t("toolSelect")}
          >
            <MousePointer2 className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTool === "add_poi" ? "default" : "ghost"}
            size="icon"
            onClick={() => onToolChange("add_poi")}
            title={t("toolAddPoi")}
          >
            <MapPinPlus className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTool === "add_area" ? "default" : "ghost"}
            size="icon"
            onClick={() => onToolChange("add_area")}
            title={t("toolAddArea")}
          >
            <VectorSquare className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Image and Layer Controls - only show in edit mode */}
      {isEditMode && (
        <div className="bg-white/90 backdrop-blur shadow-md p-1 rounded-lg flex flex-col gap-1">
          {/* Image Visibility Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleImageVisibility}
            title={imageVisible ? "Ocultar imagen de referencia" : "Mostrar imagen de referencia"}
          >
            {imageVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>

          {/* Image Opacity Control */}
          {imageVisible && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowOpacityPanel(!showOpacityPanel)}
                title={`Opacidad: ${Math.round(imageOpacity * 100)}%`}
              >
                <Image className="h-4 w-4" />
              </Button>
              {/* Opacity Slider Popup - aligned with visibility toggle */}
              {showOpacityPanel && (
                <div className="absolute right-full mr-2 -top-11 flex flex-col bg-white border rounded-md shadow-lg p-2 z-50 items-center gap-1">
                  <span className="text-xs font-medium">{Math.round(imageOpacity * 100)}%</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={imageOpacity * 100}
                    onChange={(e) => onImageOpacityChange?.(parseInt(e.target.value) / 100)}
                    className="h-16 w-1"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Layer Sidebar Toggle */}
          {onOpenLayerSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenLayerSidebar}
              title="Gestionar capas"
            >
              <Layers className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
