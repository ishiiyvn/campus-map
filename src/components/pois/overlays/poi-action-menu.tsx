"use client";

import { useState, useEffect, useRef } from "react";
import { Move, Pencil, Trash2 } from "lucide-react";
import { PointOfInterest } from "@/server/db/schema";
import { deletePointOfInterest } from "@/server/actions/pois";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface PoiActionMenuProps {
  poi: PointOfInterest | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onEdit: () => void;
  onReposition: () => void;
  onDeleted?: (id: number) => void;
}

export function PoiActionMenu({
  poi,
  position,
  onClose,
  onEdit,
  onReposition,
  onDeleted
}: PoiActionMenuProps) {
  const t = useTranslations("poi");
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

    if (poi) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [poi, onClose, showDeleteConfirm]);

  async function handleDelete() {
    if (!poi) return;
    try {
      await deletePointOfInterest(poi.id!);
      toast.success(t("deleteSuccess"));
      // Notify parent to update UI without a full reload
      onDeleted?.(poi.id!);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(t("deleteError"));
    }
  }

  if (!poi || !position) return null;

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
            onEdit();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <Pencil className="h-4 w-4" />
          {t("edit")}
        </button>
        <button
          onClick={() => {
            onReposition();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <Move className="h-4 w-4" />
          {t("reposition")}
        </button>
        <div className="h-px bg-border my-1" />
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          {t("delete")}
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t("deleteConfirm")}
        onConfirm={handleDelete}
      />
    </>
  );
}
