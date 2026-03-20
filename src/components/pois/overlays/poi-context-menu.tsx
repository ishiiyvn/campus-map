"use client";

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

interface PoiContextMenuProps {
  children: React.ReactNode;
  poi: PointOfInterest;
  onEdit: () => void;
}

export function PoiContextMenu({ children, poi, onEdit }: PoiContextMenuProps) {
  const t = useTranslations("poi");

  async function handleDelete() {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      await deletePointOfInterest(poi.id!);
      toast.success(t("deleteSuccess"));
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error(t("deleteError"));
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          {t("edit")}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          {t("delete")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
