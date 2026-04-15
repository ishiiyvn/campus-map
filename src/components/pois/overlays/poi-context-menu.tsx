"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { PointOfInterest } from "@/server/db/schema";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { deletePointOfInterest } from "@/server/actions/pois";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface PoiContextMenuProps {
  children: React.ReactNode;
  poi: PointOfInterest;
  onEdit: () => void;
  onDeleted?: (id: number) => void;
}

export function PoiContextMenu({
  children,
  poi,
  onEdit,
  onDeleted,
}: PoiContextMenuProps) {
  const t = useTranslations("poi");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleDelete() {
    try {
      await deletePointOfInterest(poi.id!);
      toast.success(t("deleteSuccess"));
      // Notify parent to update UI instead of reloading the page
      onDeleted?.(poi.id!);
    } catch (error) {
      console.error(error);
      toast.error(t("deleteError"));
    }
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            {t("edit")}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => setShowDeleteConfirm(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("delete")}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t("deleteConfirm")}
        onConfirm={handleDelete}
      />
    </>
  );
}
