"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddPoiForm from "@/components/pois/forms/add-poi-form";
import { Category, Area, Level } from "@/server/db/schema";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getLevelsByArea } from "@/server/actions/levels";

interface AddPoiDialogProps {
  open: boolean;
  location: { x: number; y: number; areaId: number | null } | null;
  mapId: number;
  categories: Category[];
  areas: Area[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddPoiDialog({
  open,
  location,
  mapId,
  categories,
  areas,
  onClose,
  onSuccess,
}: AddPoiDialogProps) {
  const t = useTranslations("poi");
  const [levels, setLevels] = useState<Level[]>([]);

  useEffect(() => {
    if (location?.areaId) {
      getLevelsByArea(location.areaId)
        .then(setLevels)
        .catch(console.error);
    } else {
      // Defer clearing levels to avoid calling setState synchronously inside
      // the effect body which can trigger cascading renders.
      const id = setTimeout(() => setLevels([]), 0);
      return () => clearTimeout(id);
    }
  }, [location]);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addTitle")}</DialogTitle>
        </DialogHeader>
        {location && (
          <AddPoiForm
            mapId={mapId}
            categories={categories}
            areas={areas}
            areaId={location.areaId}
            levels={levels}
            defaultCoordinates={{ x: location.x, y: location.y }}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
