import { Layer, Area } from "@/server/db/schema";

export interface LayerSidebarProps {
  mapId: number;
  layers: Layer[];
  areas: Area[];
  isOpen: boolean;
  onClose: () => void;
  onToggleLayerVisibility?: (layerId: number) => void;
  onMoveAreaToLayer?: (areaId: number, newLayerId: number | null) => void;
  onReorderAreasInLayer?: (layerId: number, orderedAreaIds: number[]) => void;
  onReorderLayers?: (orderedLayers: Layer[]) => void;
  onCreateLayer?: (data: { name: string; map_id: number }) => void;
  onDeleteLayer?: (id: number) => void;
}
