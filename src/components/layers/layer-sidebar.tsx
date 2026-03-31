"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTranslations } from "next-intl";
import AddLayerForm from "@/components/layers/forms/add-layer-form";
import { EditLayerForm } from "@/components/layers/forms/edit-layer-form";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  CollisionDetection,
  Active,
  Over,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { LayerSidebarProps } from "./layer-sidebar/types";
import { LayerSection } from "./layer-sidebar/layer-section";
import { UnassignedSection } from "./layer-sidebar/unassigned-section";
import { useAreaDrag } from "./layer-sidebar/use-area-drag";
import { reorderLayers, deleteLayer } from "@/server/actions/layers";
import { Layer } from "@/server/db/schema";

function createLayerCollisionDetection(layerIds: number[], activeLayerId: number | null): CollisionDetection {
  const areaIdRegex = /^area-\d+$/;
  const layerSortRegex = /^layer-\d+$/;
  const layerDropRegex = /^layer-drop-\d+$/;

  return (args) => {
    if (activeLayerId !== null) {
      // Layer is being dragged - use closestCorners, filter out droppable zones and area items
      const result = closestCorners(args);
      return result.filter((collision) => {
        const id = String(collision.id);
        return !layerDropRegex.test(id) && !areaIdRegex.test(id);
      });
    }

    // Area is being dragged - use rectIntersection, filter out layer items
    const result = rectIntersection(args);
    return result.filter((collision) => {
      const id = String(collision.id);
      return !layerSortRegex.test(id);
    });
  };
}

export function LayerSidebar({
  mapId,
  layers,
  areas,
  isOpen,
  onClose,
  onToggleLayerVisibility,
  onMoveAreaToLayer,
  onReorderAreasInLayer,
  onReorderLayers,
}: LayerSidebarProps) {
  const [expandedLayers, setExpandedLayers] = useState<Set<number>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLayerId, setEditingLayerId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ layerId: number; name: string } | null>(null);
  const [localLayers, setLocalLayers] = useState(layers);
  const [activeLayer, setActiveLayer] = useState<Layer | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("layers");

  // Sync with parent prop only when dragged layer is not active
  useEffect(() => {
    if (!activeLayer) {
      setLocalLayers(layers);
    }
  }, [layers, activeLayer]);

  const handleSetLocalLayers = (newLayers: Layer[]) => {
    setLocalLayers(newLayers);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { activeArea, localAreas, handleDragStart: handleAreaDragStart, handleDragOver: handleAreaDragOver, handleDragEnd: handleAreaDragEnd } = useAreaDrag({
    areas,
    onMoveAreaToLayer,
    onReorderAreasInLayer,
  });

  const toggleExpanded = (layerId: number) => {
    setExpandedLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) next.delete(layerId);
      else next.add(layerId);
      return next;
    });
  };

  const unassignedAreas = localAreas
    .filter((a) => !a.layer_id)
    .sort((a, b) => a.display_order - b.display_order);
  // Visual order follows array order (set by drag-drop). display_order is for DB consistency.
  const sortedLayers = localLayers;

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);

    if (activeId.startsWith("layer-")) {
      // Layer drag
      const layerId = Number(activeId.replace("layer-", ""));
      const layer = localLayers.find((l) => l.id === layerId);
      if (layer) {
        setActiveLayer(layer);
      }
    } else {
      // Area drag - pass event to area drag handler
      setActiveLayer(null);
      handleAreaDragStart(event);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    // For layer dragging, let SortableContext handle visual feedback
    // Don't update localLayers during drag-over - only on drop
    if (activeLayer && over) {
      return;
    }

    handleAreaDragOver(event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const draggedLayer = activeLayer;
    setActiveLayer(null);

    if (!over) {
      handleAreaDragEnd(event);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    // Layer drag end
    if (draggedLayer && activeId.startsWith("layer-") && overId.startsWith("layer-")) {
      const targetLayerId = Number(overId.replace("layer-", ""));

      // Find the original indices from the layers prop (before any drag-over updates)
      const originalLayers = layers;
      const oldIndex = originalLayers.findIndex((l) => l.id === draggedLayer.id);
      const newIndex = originalLayers.findIndex((l) => l.id === targetLayerId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(originalLayers, oldIndex, newIndex);

        // Update display_order values to reflect the swap
        const reorderedWithOrder = reordered.map((layer, index) => ({
          ...layer,
          display_order: index,
        }));

        const orderedIds = reorderedWithOrder.map((l) => l.id);

        handleSetLocalLayers(reorderedWithOrder);
        onReorderLayers?.(reorderedWithOrder);

        startTransition(async () => {
          try {
            await reorderLayers(orderedIds);
          } catch (error) {
            console.error("Error reordering layers:", error);
          }
        });
      }
      return;
    }

    // Area drag end - pass to area drag handler
    handleAreaDragEnd(event);
  };

  const measuring = {
    droppable: {
      strategy: MeasuringStrategy.BeforeDragging,
    }
  };
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/20 z-[70]" onClick={onClose} />}

      <DndContext
        sensors={sensors}
        measuring={measuring}
        collisionDetection={createLayerCollisionDetection(localLayers.map(l => l.id), activeLayer?.id ?? null)}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          className={cn(
            "fixed right-0 top-0 h-full w-[26rem] bg-white shadow-lg z-[70] flex flex-col overflow-visible",
            isOpen ? "translate-x-0" : "translate-x-full",
            "transition-transform duration-200 ease-in-out"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-lg">Capas</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* New Layer Button/Form */}
          <div className="p-4 border-b">
            {isCreateDialogOpen ? (
              <AddLayerForm mapId={mapId} onSubmitCallback={() => setIsCreateDialogOpen(false)} onCancel={() => setIsCreateDialogOpen(false)} />
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Capa
              </Button>
            )}
          </div>

          {/* Layers */}
          <div className="flex-1 overflow-y-auto">
            <SortableContext items={sortedLayers.map((l) => `layer-${l.id}`)} strategy={verticalListSortingStrategy}>
              {sortedLayers.map((layer) => (
                <LayerSection
                  key={layer.id}
                  layer={layer}
                  areas={localAreas
                    .filter((a) => a.layer_id === layer.id)
                    .sort((a, b) => a.display_order - b.display_order)}
                  isExpanded={expandedLayers.has(layer.id)}
                  onToggleExpanded={() => toggleExpanded(layer.id)}
                  onToggleVisibility={() => onToggleLayerVisibility?.(layer.id)}
                  onEdit={() => {
                    setEditingLayerId(layer.id);
                    setExpandedLayers((prev) => new Set(prev).add(layer.id));
                  }}
                  onDelete={() => setDeleteConfirm({ layerId: layer.id, name: layer.name })}
                  editContent={editingLayerId === layer.id ? (
                    <EditLayerForm
                      layer={layer}
                      onSubmitCallback={() => setEditingLayerId(null)}
                      onCancel={() => setEditingLayerId(null)}
                    />
                  ) : undefined}
                />
              ))}
            </SortableContext>
            {localLayers.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <p>No hay capas todavía.</p>
                <p className="text-sm">Crea una para comenzar.</p>
              </div>
            )}
          </div>

          {/* Unassigned */}
          <UnassignedSection areas={unassignedAreas} />
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeLayer ? (
            <div className="p-3 bg-white border rounded flex items-center gap-2 cursor-grabbing shadow-lg scale-105">
              <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{activeLayer.name}</span>
            </div>
          ) : activeArea ? (
            <div className="p-2 bg-white border rounded flex items-center gap-2 cursor-grabbing shadow-lg scale-105">
              <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />
              <span className="text-sm truncate">{activeArea.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ConfirmDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title={t("deleteTitle")}
        description={deleteConfirm ? t("deleteConfirm", { name: deleteConfirm.name }) : undefined}
        onConfirm={async () => {
          if (deleteConfirm) {
            try {
              await deleteLayer(deleteConfirm.layerId);
              router.refresh();
            } catch (error) {
              console.error("Error deleting layer:", error);
            }
          }
        }}
      />
    </>
  );
}
