"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditPoiForm from "@/components/pois/forms/edit-poi-form";
import { Category, PointOfInterest, Area, Level } from "@/server/db/schema";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getLevelsByArea } from "@/server/actions/levels";

interface EditPoiDialogProps {
  open: boolean;
  poi: PointOfInterest | null;
  categories: Category[];
  areas: Area[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditPoiDialog({
  open,
  poi,
  categories,
  areas,
  onClose,
  onSuccess,
}: EditPoiDialogProps) {
  const t = useTranslations("poi");
  const [levels, setLevels] = useState<Level[]>([]);
  const [poiLevelIds, setPoiLevelIds] = useState<number[]>([]);

  useEffect(() => {
    if (poi && poi.area_id) {
      getLevelsByArea(poi.area_id)
        .then(setLevels)
        .catch(console.error);
    } else {
      setLevels([]);
    }
  }, [poi]);

  useEffect(() => {
    if (poi && (poi as PointOfInterest & { level_ids?: number[] }).level_ids) {
      setPoiLevelIds((poi as PointOfInterest & { level_ids?: number[] }).level_ids || []);
    } else {
      setPoiLevelIds([]);
    }
  }, [poi]);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editTitle")}</DialogTitle>
        </DialogHeader>
        {poi && (
          <EditPoiForm
            poi={poi}
            poiLevelIds={poiLevelIds}
            categories={categories}
            areas={areas}
            levels={levels}
            onSuccess={() => {
              onSuccess?.();
              onClose();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
