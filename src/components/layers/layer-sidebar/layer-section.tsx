import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaItem } from "./area-item";
import { Layer, Area } from "@/server/db/schema";

interface LayerSectionProps {
  layer: Layer;
  areas: Area[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onToggleVisibility: () => void;
}

export function LayerSection({
  layer,
  areas,
  isExpanded,
  onToggleExpanded,
  onToggleVisibility,
}: LayerSectionProps) {
  const { setNodeRef } = useDroppable({
    id: `layer-${layer.id}`,
  });

  return (
    <div ref={setNodeRef} className="border-b">
      <div
        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 -m-px"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="font-medium">{layer.name}</span>
          <span className="text-sm text-gray-500">({areas.length})</span>
        </div>
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

      {isExpanded && (
        <div className="p-2 flex flex-col gap-1 min-h-[60px]">
          <SortableContext items={areas.map((a) => a.id)} strategy={verticalListSortingStrategy}>
            {areas.map((area) => (
              <AreaItem key={area.id} area={area} />
            ))}
          </SortableContext>
          {areas.length === 0 && <p className="text-sm text-gray-400 p-2">Arrastra áreas aquí</p>}
        </div>
      )}
    </div>
  );
}
