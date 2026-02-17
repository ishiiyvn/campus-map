"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPinPlus, MousePointer2, VectorSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export type EditorTool = "select" | "add_poi" | "add_area";

interface MapEditorToolbarProps {
  isEditMode: boolean;
  onEditModeChange: (enabled: boolean) => void;
  activeTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  className?: string;
  visible?: boolean;
}

export function MapEditorToolbar({
  isEditMode,
  onEditModeChange,
  activeTool,
  onToolChange,
  className,
  visible = true,
}: MapEditorToolbarProps) {
  if (!visible) return null;

  return (
    <div className={cn("absolute top-4 right-4 flex flex-col gap-4 items-end", className)}>
      {/* Edit Mode Toggle */}
      <div className="bg-white/90 backdrop-blur shadow-md p-2 rounded-lg flex items-center gap-2">
        <Switch
          id="edit-mode"
          checked={isEditMode}
          onCheckedChange={onEditModeChange}
        />
        <Label htmlFor="edit-mode" className="text-sm font-medium cursor-pointer">
          Edit Mode
        </Label>
      </div>

      {/* Toolbar Controls */}
      {isEditMode && (
        <div className="bg-white/90 backdrop-blur shadow-md p-1 rounded-lg flex flex-col gap-1">
          <Button
            variant={activeTool === "select" ? "default" : "ghost"}
            size="icon"
            onClick={() => onToolChange("select")}
            title="Select / Move"
          >
            <MousePointer2 className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTool === "add_poi" ? "default" : "ghost"}
            size="icon"
            onClick={() => onToolChange("add_poi")}
            title="Add Marker"
          >
            <MapPinPlus className="h-4 w-4" />
          </Button>
          <Button
            variant={activeTool === "add_area" ? "default" : "ghost"}
            size="icon"
            onClick={() => onToolChange("add_area")}
            title="Add Area"
          >
            <VectorSquare className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
