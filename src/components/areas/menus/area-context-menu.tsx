"use client";

import { useEffect, useRef } from "react";
import { Pentagon, Pencil, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface AreaContextMenuProps {
  x: number;
  y: number;
  onEditPolygon: () => void;
  onEditInfo: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function AreaContextMenu({
  x,
  y,
  onEditPolygon,
  onEditInfo,
  onDelete,
  onClose,
}: AreaContextMenuProps) {
  const t = useTranslations("areas");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] bg-background border rounded-lg shadow-lg py-1 min-w-[180px]"
      style={{
        left: x,
        top: y,
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
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
      >
        <Trash2 className="h-4 w-4" />
        {t("menu.delete")}
      </button>
    </div>
  );
}
