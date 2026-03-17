import { useDroppable } from "@dnd-kit/core";
import { AreaItem } from "./area-item";
import { Area } from "@/server/db/schema";

interface UnassignedSectionProps {
  areas: Area[];
}

export function UnassignedSection({ areas }: UnassignedSectionProps) {
  const { setNodeRef } = useDroppable({ id: "unassigned" });

  return (
    <div ref={setNodeRef} className="border-t p-4">
      <h3 className="font-medium text-sm mb-2">Sin asignar ({areas.length})</h3>
      <div className="space-y-1 min-h-[40px]">
        {areas.map((area) => (
          <AreaItem key={area.id} area={area} />
        ))}
      </div>
    </div>
  );
}
