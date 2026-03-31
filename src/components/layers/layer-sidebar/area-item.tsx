import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Area } from "@/server/db/schema";

interface AreaItemProps {
  area: Area;
}

export function AreaItem({ area }: AreaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } =     useSortable({ id: `area-${area.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "h-10 bg-white border rounded flex items-center gap-2 px-2 cursor-grab active:cursor-grabbing",
        isDragging && "opacity-0"
      )}
    >
      <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />
      <span className="text-sm truncate">{area.name}</span>
    </div>
  );
}
