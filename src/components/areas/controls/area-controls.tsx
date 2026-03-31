import { Button } from "@/components/ui/button";
import { Check, Circle, Undo2, VectorSquare, X } from "lucide-react";
import { useTranslations } from "next-intl";

export type DrawMode = "polygon" | "circle";

interface AreaControlsProps {
  isEditing: boolean;
  canUndo: boolean;
  drawMode?: DrawMode;
  onDrawModeChange?: (mode: DrawMode) => void;
  onFinish: () => void;
  onUndo: () => void;
  onCancel: () => void;
  showCancel?: boolean;
  isFinishDisabled?: boolean;
}

export function AreaControls({
  isEditing,
  canUndo,
  drawMode,
  onDrawModeChange,
  onFinish,
  onUndo,
  onCancel,
  showCancel = true,
  isFinishDisabled = false,
}: AreaControlsProps) {
  const t = useTranslations("areas.controls");

  return (
    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur shadow-md p-2 rounded-lg flex items-center gap-2 pointer-events-auto">
      {!isEditing && drawMode && onDrawModeChange && (
        <>
          <Button
            type="button"
            size="sm"
            variant={drawMode === "polygon" ? "default" : "outline"}
            className="gap-1.5 text-xs"
            onClick={() => onDrawModeChange("polygon")}
          >
            <VectorSquare className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={drawMode === "circle" ? "default" : "outline"}
            className="gap-1.5 text-xs"
            onClick={() => onDrawModeChange("circle")}
          >
            <Circle className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-border mx-1" />
        </>
      )}
      <Button
        type="button"
        size="sm"
        className="gap-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500/40"
        onClick={onFinish}
        disabled={isFinishDisabled}
      >
        <Check className="h-4 w-4" />
        {t("finish")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-1.5 text-xs border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-40 disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent"
        onClick={onUndo}
        disabled={!canUndo}
      >
        <Undo2 className="h-4 w-4" />
        {t("undo")}
      </Button>
      {showCancel && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
          {t("cancel")}
        </Button>
      )}
    </div>
  );
}
