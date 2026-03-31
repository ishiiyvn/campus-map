"use client";

import { useState, useEffect, useRef } from "react";
import { Pentagon, Pencil, Trash2 } from "lucide-react";
import { Area } from "@/server/db/schema";
import { deleteArea } from "@/server/actions/areas";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface AreaActionMenuProps {
  area: Area | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onEditPolygon: () => void;
  onEditInfo: () => void;
  onDelete: () => void;
}

export function AreaActionMenu({
  area,
  position,
  onClose,
  onEditPolygon,
  onEditInfo,
  onDelete,
}: AreaActionMenuProps) {
  const t = useTranslations("areas");
  const menuRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if the delete confirmation dialog is open
      if (showDeleteConfirm) return;
      
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (area) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [area, onClose, showDeleteConfirm]);

  async function handleDelete() {
    if (!area) return;
    try {
      await deleteArea(area.id!);
      toast.success(t("deleteSuccess"));
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error(t("deleteError"));
    }
  }

  if (!area || !position) return null;

  return (
    <>
      <div
        ref={menuRef}
        className="fixed z-[100] bg-background border rounded-lg shadow-lg py-1 min-w-[180px]"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <button
          onClick={() => {
            onEditPolygon();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <Pentagon className="h-4 w-4" />
          {t("menu.editPolygon")}
        </button>
        <button
          onClick={() => {
            onEditInfo();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <Pencil className="h-4 w-4" />
          {t("menu.editInfo")}
        </button>
        <div className="h-px bg-border my-1" />
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          {t("menu.delete")}
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t("deleteTitle")}
        description={t("menu.deleteConfirm")}
        onConfirm={handleDelete}
      />
    </>
  );
}
