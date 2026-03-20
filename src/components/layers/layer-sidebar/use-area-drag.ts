import { useState, useEffect, useRef, useTransition } from "react";
import {
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
} from "@dnd-kit/sortable";
import { Area } from "@/server/db/schema";
import { reorderAreasInLayer } from "@/server/actions/areas";

interface UseAreaDragProps {
  areas: Area[];
  onMoveAreaToLayer?: (areaId: number, newLayerId: number | null) => void;
  onReorderAreasInLayer?: (layerId: number, orderedAreaIds: number[]) => void;
}

export function useAreaDrag({
  areas,
  onMoveAreaToLayer,
  onReorderAreasInLayer,
}: UseAreaDragProps) {
  const [activeArea, setActiveArea] = useState<Area | null>(null);
  const [localAreas, setLocalAreas] = useState(areas);
  const [isPending, startTransition] = useTransition();
  const originalLayerIdRef = useRef<number | null>(null);

  useEffect(() => {
    setLocalAreas(areas);
  }, [areas]);

  const handleDragStart = (event: DragStartEvent) => {
    const areaId = event.active.id as number;
    const area = localAreas.find((a) => a.id === areaId) || null;
    setActiveArea(area);
    originalLayerIdRef.current = area?.layer_id ?? null;
  };

  // Only handle cross-layer moves - let SortableContext handle same-layer reordering
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const areaId = active.id as number;
    const overId = String(over.id);

    const draggedArea = localAreas.find((a) => a.id === areaId);
    if (!draggedArea) return;

    // Dragging over another area item in a different layer
    if (/^\d+$/.test(overId) && overId !== String(areaId)) {
      const targetArea = localAreas.find((a) => a.id === Number(overId));
      if (!targetArea) return;

      if (draggedArea.layer_id !== targetArea.layer_id) {
        setLocalAreas((prev) =>
          prev.map((a) => (a.id === areaId ? { ...a, layer_id: targetArea.layer_id } : a))
        );
      }
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
      return;
    }

    // Dragging over unassigned
    if (overId === "unassigned") {
      if (draggedArea.layer_id !== null) {
        setLocalAreas((prev) =>
          prev.map((a) => (a.id === areaId ? { ...a, layer_id: null } : a))
        );
      }
      return;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveArea(null);
    if (!over) return;

    const areaId = active.id as number;
    const overId = String(over.id);
    const originalLayerId = originalLayerIdRef.current;

    // Dropped on another area item
    if (/^\d+$/.test(overId) && overId !== String(areaId)) {
      const draggedArea = localAreas.find((a) => a.id === areaId);
      const targetArea = localAreas.find((a) => a.id === Number(overId));

      if (!draggedArea || !targetArea) return;

      // Moved to a different layer
      if (draggedArea.layer_id !== originalLayerId) {
        onMoveAreaToLayer?.(areaId, draggedArea.layer_id);
        return;
      }

      // Same layer - reorder locally and persist
      if (draggedArea.layer_id !== null && draggedArea.layer_id === targetArea.layer_id) {
        const layerId = draggedArea.layer_id;
        const layerAreas = localAreas
          .filter((a) => a.layer_id === layerId)
          .sort((a, b) => a.display_order - b.display_order);

        const oldIndex = layerAreas.findIndex((a) => a.id === areaId);
        const newIndex = layerAreas.findIndex((a) => a.id === Number(overId));

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reordered = arrayMove(layerAreas, oldIndex, newIndex);
          const orderedAreaIds = reordered.map((a) => a.id);

          setLocalAreas((prev) =>
            prev.map((area) => {
              const newOrder = reordered.findIndex((a) => a.id === area.id);
              return newOrder !== -1 ? { ...area, display_order: newOrder } : area;
            })
          );

          startTransition(async () => {
            try {
              await reorderAreasInLayer(layerId, orderedAreaIds);
            } catch (error) {
              console.error("Error reordering areas:", error);
            }
          });
        }
        return;
      }
    }

    // Dropped on layer header or unassigned
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
