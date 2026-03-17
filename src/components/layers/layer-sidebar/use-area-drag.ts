import { useState, useEffect } from "react";
import {
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
} from "@dnd-kit/sortable";
import { Area } from "@/server/db/schema";

interface UseAreaDragProps {
  areas: Area[];
  onMoveAreaToLayer?: (areaId: number, newLayerId: number | null) => void;
  onReorderAreasInLayer?: (layerId: number, oldIndex: number, newIndex: number) => void;
}

export function useAreaDrag({
  areas,
  onMoveAreaToLayer,
  onReorderAreasInLayer,
}: UseAreaDragProps) {
  const [activeArea, setActiveArea] = useState<Area | null>(null);
  const [localAreas, setLocalAreas] = useState(areas);

  useEffect(() => {
    setLocalAreas(areas);
  }, [areas]);

  const handleDragStart = (event: DragStartEvent) => {
    const areaId = event.active.id as number;
    const area = localAreas.find((a) => a.id === areaId) || null;
    setActiveArea(area);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const areaId = active.id as number;
    const overId = over.id as string;

    const draggedArea = localAreas.find((a) => a.id === areaId);
    if (!draggedArea) return;

    // Dragging over another area item
    if (!isNaN(Number(overId)) && overId !== String(areaId)) {
      const targetArea = localAreas.find((a) => a.id === Number(overId));
      if (!targetArea) return;

      // Same layer - update localAreas optimistically so SortableContext stays in sync
      if (draggedArea.layer_id === targetArea.layer_id) {
        const layerId = draggedArea.layer_id;
        const layerAreas = localAreas.filter((a) => a.layer_id === layerId);
        const oldIndex = layerAreas.findIndex((a) => a.id === areaId);
        const newIndex = layerAreas.findIndex((a) => a.id === Number(overId));
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reordered = arrayMove(layerAreas, oldIndex, newIndex);
          const others = localAreas.filter((a) => a.layer_id !== layerId);
          setLocalAreas([...others, ...reordered]);
        }
        return;
      }

      // Different layer - move immediately
      setLocalAreas((prev) =>
        prev.map((a) => (a.id === areaId ? { ...a, layer_id: targetArea.layer_id } : a))
      );
      return;
    }

    // Dragging over layer header
    if (overId.startsWith("layer-")) {
      const targetLayerId = parseInt(overId.replace("layer-", ""));
      if (draggedArea.layer_id !== targetLayerId) {
        setLocalAreas((prev) =>
          prev.map((a) => (a.id === areaId ? { ...a, layer_id: targetLayerId } : a))
        );
      }
    }
    // Dragging over unassigned
    else if (overId === "unassigned") {
      if (draggedArea.layer_id !== null) {
        setLocalAreas((prev) =>
          prev.map((a) => (a.id === areaId ? { ...a, layer_id: null } : a))
        );
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveArea(null);
    if (!over) return;

    const areaId = active.id as number;
    const overId = over.id as string;

    // Sorting within same layer
    if (!isNaN(Number(overId)) && overId !== String(areaId)) {
      const draggedArea = localAreas.find((a) => a.id === areaId);
      const targetArea = localAreas.find((a) => a.id === Number(overId));

      if (draggedArea && targetArea && draggedArea.layer_id === targetArea.layer_id) {
        const layerId = draggedArea.layer_id;
        const layerAreas = localAreas.filter((a) => a.layer_id === layerId);
        const oldIndex = layerAreas.findIndex((a) => a.id === areaId);
        const newIndex = layerAreas.findIndex((a) => a.id === Number(overId));
        // Already reordered optimistically in handleDragOver, just call the callback
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex && layerId !== null) {
          onReorderAreasInLayer?.(layerId, oldIndex, newIndex);
        }
        return;
      }
    }

    // Move between layers - persist
    const draggedArea = localAreas.find((a) => a.id === areaId);
    if (draggedArea) {
      if (overId.startsWith("layer-")) {
        const targetLayerId = parseInt(overId.replace("layer-", ""));
        onMoveAreaToLayer?.(areaId, targetLayerId);
      } else if (overId === "unassigned") {
        onMoveAreaToLayer?.(areaId, null);
      }
    }
  };

  return {
    activeArea,
    localAreas,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
