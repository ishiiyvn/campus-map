import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, Eye, EyeOff, GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaItem } from "./area-item";
import { Layer, Area } from "@/server/db/schema";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface LayerSectionProps {
  layer: Layer;
  areas: Area[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onToggleVisibility: () => void;
  onEdit: () => void;
  onDelete: () => void;
  editContent?: ReactNode;
}

export function LayerSection({
  layer,
  areas,
  isExpanded,
  onToggleExpanded,
  onToggleVisibility,
  onEdit,
  onDelete,
  editContent,
}: LayerSectionProps) {
  // Droppable zone for areas being dragged into this layer (only when expanded)
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `layer-drop-${layer.id}`,
    disabled: !isExpanded,
  });

  // Sortable for reordering layers (dragging by the header grip)
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `layer-${layer.id}` });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className={cn("border-b", isDragging && "opacity-50")}>
      {/* Sortable header - this is what you drag to reorder layers */}
      <div
        ref={setSortableRef}
        style={sortableStyle}
        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 -m-px"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="font-medium">{layer.name}</span>
          <span className="text-xs text-muted-foreground">({layer.display_order})</span>
          <span className="text-sm text-gray-500">({areas.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
          >
            {layer.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
          </Button>
        </div>
      </div>

      {/* Expanded content area */}
      {isExpanded && (
        editContent ? (
          <div className="p-2">
            {editContent}
          </div>
        ) : (
          <div ref={setDroppableRef} className="p-2 flex flex-col gap-1 min-h-[60px]">
            <SortableContext items={areas.map((a) => `area-${a.id}`)} strategy={verticalListSortingStrategy}>
              {areas.map((area) => (
                <AreaItem key={area.id} area={area} />
              ))}
            </SortableContext>
            {areas.length === 0 && <p className="text-sm text-gray-400 p-2">Arrastra áreas aquí</p>}
          </div>
        )
      )}
    </div>
  );
}
