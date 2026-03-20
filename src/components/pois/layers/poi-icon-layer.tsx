"use client";

import { useState, useEffect, useRef } from "react";
import { Layer, Group, Circle, Image as KonvaImage, Text } from "react-konva";
import Konva from "konva";
import { PointOfInterest, Category } from "@/server/db/schema";
import { getIconSvgDataUrl } from "@/lib/icon-utils";

interface PoiIconLayerProps {
  pois: PointOfInterest[];
  categories: Category[];
  isEditMode: boolean;
  repositioning: boolean;
  repositionPoiId: number | null;
  onPoiContextMenu: (poi: PointOfInterest, screenPos: { x: number; y: number }) => void;
  onPoiMove: (poiId: number, x: number, y: number) => void;
  onDragStart: (poiId: number) => void;
  onDragEnd: (poiId: number) => void;
}

function useIconImage(iconName: string | null | undefined, color: string): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!iconName) {
      setImage(null);
      return;
    }

    const dataUrl = getIconSvgDataUrl(iconName, color);
    if (!dataUrl) {
      setImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
    img.onerror = () => setImage(null);
    img.src = dataUrl;
  }, [iconName, color]);

  return image;
}

function PoiIconGroup({
  poi,
  category,
  isEditMode,
  isRepositioningThis,
  onPoiContextMenu,
  onPoiMove,
  onDragStart,
  onDragEnd,
}: {
  poi: PointOfInterest;
  category: { color?: string | null; icon?: string | null } | null;
  isEditMode: boolean;
  isRepositioningThis: boolean;
  onPoiContextMenu: (poi: PointOfInterest, screenPos: { x: number; y: number }) => void;
  onPoiMove: (poiId: number, x: number, y: number) => void;
  onDragStart: (poiId: number) => void;
  onDragEnd: (poiId: number) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const color = poi.icon_color || category?.color || "#3b82f6";
  const iconName = poi.icon || category?.icon;
  const iconImage = useIconImage(iconName, color);
  const size = 32;
  const radius = size / 2;

  const handleContextMenu = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isEditMode || isRepositioningThis) return;
    e.cancelBubble = true;
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    onPoiContextMenu(poi, { x: pointer.x, y: pointer.y });
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isEditMode || isRepositioningThis) return;
    e.cancelBubble = true;
    const stage = e.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    onPoiContextMenu(poi, { x: pointer.x, y: pointer.y });
  };

  return (
    <Group
      x={poi.x_coordinate}
      y={poi.y_coordinate}
      draggable={isRepositioningThis}
      onDragStart={() => {
        setIsDragging(true);
        onDragStart(poi.id);
      }}
      onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
        setIsDragging(false);
        onDragEnd(poi.id);
        onPoiMove(poi.id, e.target.x(), e.target.y());
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <Circle
        radius={radius}
        fill={iconImage ? "#ffffff" : color}
        stroke={isDragging ? "#3b82f6" : "#ffffff"}
        strokeWidth={2}
        shadowColor="black"
        shadowBlur={isDragging ? 12 : 5}
        shadowOpacity={0.3}
        shadowOffsetY={2}
        scaleX={isDragging ? 1.25 : 1}
        scaleY={isDragging ? 1.25 : 1}
      />
      {iconImage ? (
        <KonvaImage
          image={iconImage}
          x={-radius + 4}
          y={-radius + 4}
          width={size - 8}
          height={size - 8}
        />
      ) : (
        <Text
          text={poi.name.charAt(0).toUpperCase()}
          x={-radius}
          y={-7}
          width={size}
          height={size}
          align="center"
          fontSize={14}
          fontStyle="bold"
          fill={color}
        />
      )}
    </Group>
  );
}

export function PoiIconLayer({
  pois,
  categories,
  isEditMode,
  repositioning,
  repositionPoiId,
  onPoiContextMenu,
  onPoiMove,
  onDragStart,
  onDragEnd,
}: PoiIconLayerProps) {
  const getCategoryById = (categoryId: number | null) => {
    if (!categoryId) return null;
    return categories.find((c) => c.id === categoryId) || null;
  };

  const iconPois = pois.filter((poi) => {
    const category = getCategoryById(poi.category_id);
    return category?.display_type !== "text";
  });

  return (
    <Layer>
      {iconPois.map((poi) => {
        const category = getCategoryById(poi.category_id);
        const isRepositioningThis = repositioning && repositionPoiId === poi.id;

        return (
          <PoiIconGroup
            key={poi.id}
            poi={poi}
            category={category}
            isEditMode={isEditMode}
            isRepositioningThis={isRepositioningThis}
            onPoiContextMenu={onPoiContextMenu}
            onPoiMove={onPoiMove}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        );
      })}
    </Layer>
  );
}
