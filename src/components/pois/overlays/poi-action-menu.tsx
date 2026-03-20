"use client";

import { useEffect, useRef } from "react";
import { Move, Pencil, Trash2 } from "lucide-react";
import { PointOfInterest } from "@/server/db/schema";
import { deletePointOfInterest } from "@/server/actions/pois";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface PoiActionMenuProps {
  poi: PointOfInterest | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onEdit: () => void;
  onReposition: () => void;
}

export function PoiActionMenu({
  poi,
  position,
  onClose,
  onEdit,
  onReposition,
}: PoiActionMenuProps) {
  const t = useTranslations("poi");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
  }, [poi, onClose]);

  async function handleDelete() {
    if (!poi || !confirm(t("deleteConfirm"))) return;
    try {
      await deletePointOfInterest(poi.id!);
      toast.success(t("deleteSuccess"));
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error(t("deleteError"));
    }
  }

  if (!poi || !position) return null;

  return (
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
        onClick={handleDelete}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
      >
        <Trash2 className="h-4 w-4" />
        {t("delete")}
      </button>
    </div>
  );
}
