"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import AddLayerForm from "@/components/layers/forms/layer-form-fields";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from "@dnd-kit/core";
import { Plus, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { LayerSidebarProps } from "./layer-sidebar/types";
import { LayerSection } from "./layer-sidebar/layer-section";
import { UnassignedSection } from "./layer-sidebar/unassigned-section";
import { useAreaDrag } from "./layer-sidebar/use-area-drag";

export function LayerSidebar({
  mapId,
  layers,
  areas,
  isOpen,
  onClose,
  onToggleLayerVisibility,
  onMoveAreaToLayer,
  onReorderAreasInLayer,
}: LayerSidebarProps) {
  const [expandedLayers, setExpandedLayers] = useState<Set<number>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const { activeArea, localAreas, handleDragStart, handleDragOver, handleDragEnd } = useAreaDrag({
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

  const unassignedAreas = localAreas.filter((a) => !a.layer_id);
  const sortedLayers = [...layers].sort((a, b) => a.display_order - b.display_order);

  const measuring = {
    droppable: {
      strategy: MeasuringStrategy.BeforeDragging,
    }
  }
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />}

      <DndContext
        sensors={sensors}
        measuring={measuring}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          className={cn(
            "fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 flex flex-col overflow-visible",
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
              <AddLayerForm mapId={mapId} onSubmitCallback={() => setIsCreateDialogOpen(false)} />
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Capa
              </Button>
            )}
          </div>

          {/* Layers */}
          <div className="flex-1 overflow-y-auto">
            {sortedLayers.map((layer) => (
              <LayerSection
                key={layer.id}
                layer={layer}
                areas={localAreas.filter((a) => a.layer_id === layer.id)}
                isExpanded={expandedLayers.has(layer.id)}
                onToggleExpanded={() => toggleExpanded(layer.id)}
                onToggleVisibility={() => onToggleLayerVisibility?.(layer.id)}
              />
            ))}
            {layers.length === 0 && (
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
          {activeArea ? (
            <div className="p-2 bg-white border rounded flex items-center gap-2 cursor-grabbing shadow-lg scale-105">
              <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />
              <span className="text-sm truncate">{activeArea.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
