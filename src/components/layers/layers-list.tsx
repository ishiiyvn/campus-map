"use client";

import { useState } from "react";
import { Layer } from "@/server/db/schema";
import { deleteLayer } from "@/server/actions/layers";
import { toast } from "sonner";
import { Loader2, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTranslations } from "next-intl";

interface LayersListProps {
  layers: Layer[];
  onEdit?: (layer: Layer) => void;
  onDeleted?: () => void;
}

export function LayersList({ layers, onEdit, onDeleted }: LayersListProps) {
  const t = useTranslations("layers");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ layerId: number; name: string } | null>(null);

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setDeletingId(deleteConfirm.layerId);
      await deleteLayer(deleteConfirm.layerId);
      toast.success(t("deleteSuccess"));
      onDeleted?.();
    } catch (error) {
      console.error(error);
      toast.error(t("deleteError"));
    } finally {
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  if (layers.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-4">
        {t("noLayers")} {t("noLayersHint")}
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
              onClick={() => setDeleteConfirm({ layerId: layer.id, name: layer.name })}
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

      <ConfirmDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title={t("deleteTitle")}
        description={deleteConfirm ? t("deleteConfirm", { name: deleteConfirm.name }) : undefined}
        onConfirm={handleDelete}
      />
    </div>
  );
}
