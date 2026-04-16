"use client";

import { memo, useMemo } from "react";
import { Layer, Group, Text } from "react-konva";
import Konva from "konva";
import { PointOfInterest, Category } from "@/server/db/schema";

interface PoiLayerProps {
  pois: PointOfInterest[];
  categories: Category[];
  isEditMode: boolean;
  readOnly?: boolean;
  onPoiSelect?: (poi: PointOfInterest) => void;
  onPoiContextMenu: (
    poi: PointOfInterest,
    screenPos: { x: number; y: number },
  ) => void;
  onPoiMouseEnter: (event: Konva.KonvaEventObject<MouseEvent>) => void;
  onPoiMouseLeave: (event: Konva.KonvaEventObject<MouseEvent>) => void;
}

function measureTextWidth(
  text: string,
  fontSize: number,
  fontFamily = '-apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial',
): number {
  if (typeof document === "undefined") {
    // Fallback for server - shouldn't run because this is a client component
    return Math.ceil(text.length * (fontSize * 0.6));
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return Math.ceil(text.length * (fontSize * 0.6));
  ctx.font = `${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text);
  return Math.ceil(metrics.width);
}

function truncateToFit(
  text: string,
  fontSize: number,
  maxWidth: number,
  fontFamily?: string,
): string {
  if (measureTextWidth(text, fontSize, fontFamily) <= maxWidth) return text;
  // Binary-like search for the longest substring that fits (with ellipsis)
  let lo = 0;
  let hi = text.length;
  let best = "";
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const candidate = text.substring(0, mid) + (mid < text.length ? "…" : "");
    if (measureTextWidth(candidate, fontSize, fontFamily) <= maxWidth) {
      best = candidate;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best || text.substring(0, 1) + "…";
}

export const PoiLayer = memo(function PoiLayer({
  pois,
  categories,
  isEditMode,
  readOnly = false,
  onPoiSelect,
  onPoiContextMenu,
  onPoiMouseEnter,
  onPoiMouseLeave,
}: PoiLayerProps) {
  const categoryMap = useMemo(() => {
    const map = new Map<number, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const textPois = useMemo(() => {
    return pois.filter((poi) => {
      const category = categoryMap.get(poi.category_id);
      return category?.display_type === "text";
    });
  }, [pois, categoryMap]);

  return (
    <Layer>
      {textPois.map((poi) => {
        const category = categoryMap.get(poi.category_id);
        // color retained for possible future use; text is black with white stroke per request
        const color = poi.icon_color || category?.color || "#3b82f6";

        // Typography & sizing
        const fontSize = 12;
        const fontFamily =
          '-apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial';
        const paddingX = 8; // small horizontal padding to avoid touching exact text bounds
        const maxWidth = 220;

        const rawText = String(poi.name ?? "");
        const measuredRaw = measureTextWidth(rawText, fontSize, fontFamily);
        const textToRender =
          measuredRaw <= maxWidth
            ? rawText
            : truncateToFit(rawText, fontSize, maxWidth, fontFamily);

        const textWidth = measureTextWidth(textToRender, fontSize, fontFamily);
        const availableWidth = Math.min(maxWidth, textWidth + paddingX);

        // Center text on POI coordinate
        const textX = -textWidth / 2;
        // Konva Text y is top; approximate vertical centering by shifting up by half fontSize
        const textY = -fontSize / 2 - 1;

        return (
          <Group
            key={poi.id}
            x={poi.x_coordinate}
            y={poi.y_coordinate}
            onMouseEnter={onPoiMouseEnter}
            onMouseLeave={onPoiMouseLeave}
            onClick={(event) => {
              if (!isEditMode) {
                if (readOnly) {
                  event.cancelBubble = true;
                  onPoiSelect?.(poi);
                }
                return;
              }
              event.cancelBubble = true;
              onPoiContextMenu(poi, {
                x: (event as Konva.KonvaEventObject<MouseEvent>).evt.clientX,
                y: (event as Konva.KonvaEventObject<MouseEvent>).evt.clientY,
              });
            }}
            onContextMenu={(event) => {
              event.cancelBubble = true;
              if (!isEditMode) {
                (
                  event as Konva.KonvaEventObject<MouseEvent>
                ).evt.preventDefault();
                return;
              }
              (
                event as Konva.KonvaEventObject<MouseEvent>
              ).evt.preventDefault();
              onPoiContextMenu(poi, {
                x: (event as Konva.KonvaEventObject<MouseEvent>).evt.clientX,
                y: (event as Konva.KonvaEventObject<MouseEvent>).evt.clientY,
              });
            }}
          >
            <Text
              text={textToRender}
              x={textX}
              y={textY}
              width={availableWidth}
              align="center"
              fontSize={fontSize}
              fontStyle="bold"
              fontFamily={fontFamily}
              fill="#ffffff" // slim white outline
              stroke="#000000" // black body
              strokeWidth={0.15}
              listening={true}
              // keep shadows off; stroke should be sufficient for contrast
              shadowColor="black"
              shadowBlur={0}
              shadowOpacity={0}
            />
          </Group>
        );
      })}
    </Layer>
  );
});
