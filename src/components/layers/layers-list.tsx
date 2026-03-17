"use client";

import { useState } from "react";
import { Layer } from "@/server/db/schema";
import { deleteLayer } from "@/server/actions/layers";
import { toast } from "sonner";
import { Loader2, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayersListProps {
  layers: Layer[];
  onEdit?: (layer: Layer) => void;
  onDeleted?: () => void;
}

export function LayersList({ layers, onEdit, onDeleted }: LayersListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta capa?")) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteLayer(id);
      toast.success("Capa eliminada exitosamente");
      onDeleted?.();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar la capa");
    } finally {
      setDeletingId(null);
    }
  };

  if (layers.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-4">
        No hay capas todavía. Crea una para comenzar.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {layers.map((layer) => (
        <div
          key={layer.id}
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="flex-1">
            <p className="font-medium">{layer.name}</p>
            <p className="text-sm text-muted-foreground">
              Orden: {layer.display_order} •{" "}
              {layer.is_visible ? (
                <span className="text-green-600">Visible</span>
              ) : (
                <span className="text-red-600">Oculto</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(layer)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(layer.id)}
              disabled={deletingId === layer.id}
            >
              {deletingId === layer.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 text-red-500" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
