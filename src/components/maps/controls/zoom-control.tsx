"use client";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;

interface ZoomControlProps {
  scale: number;
  onScaleChange: (scale: number) => void;
}

export function ZoomControl({ scale, onScaleChange }: ZoomControlProps) {
  const t = useTranslations("maps");

  const handleZoomIn = () => {
    const newScale = Math.min(scale * 1.2, MAX_ZOOM);
    onScaleChange(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale / 1.2, MIN_ZOOM);
    onScaleChange(newScale);
  };

  const handleReset = () => {
    onScaleChange(1);
  };

  const percentage = Math.round(scale * 100);

  return (
    <div className="flex flex-col gap-2 p-3 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg max-w-40 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleZoomOut}
          disabled={scale <= MIN_ZOOM}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <Slider
            value={[scale]}
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            onValueChange={([value]) => onScaleChange(value)}
            className="w-full"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleZoomIn}
          disabled={scale >= MAX_ZOOM}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground font-medium tabular-nums shrink-0">
          {percentage}%
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs shrink-0 border-dashed"
          onClick={handleReset}
        >
          {t("reset")}
        </Button>
      </div>
    </div>
  );
}
