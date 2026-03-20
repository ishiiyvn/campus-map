"use client";

import type { Category, PointOfInterest, Area } from "@/server/db/schema";
import { AddPoiDialog } from "@/components/maps/dialogs/add-poi-dialog";
import { EditPoiDialog } from "@/components/maps/dialogs/edit-poi-dialog";

interface PoiDialogsProps {
  mapId: number;
  categories: Category[];
  areas: Area[];
  activePoi: PointOfInterest | null;
  activePoiForEdit: PointOfInterest | null;
  newPoiLocation: { x: number; y: number; areaId: number | null } | null;
  onCloseNewPoi: () => void;
  onCloseEditPoi: () => void;
  onCloseEditPoiFromContext: () => void;
}

export function PoiDialogs({
  mapId,
  categories,
  areas,
  activePoi,
  activePoiForEdit,
  newPoiLocation,
  onCloseNewPoi,
  onCloseEditPoi,
  onCloseEditPoiFromContext,
}: PoiDialogsProps) {
  return (
    <>
      <AddPoiDialog
        open={!!newPoiLocation}
        location={newPoiLocation}
        mapId={mapId}
        categories={categories}
        areas={areas}
        onClose={onCloseNewPoi}
      />

      <EditPoiDialog
        open={!!activePoi}
        poi={activePoi}
        categories={categories}
        areas={areas}
        onClose={onCloseEditPoi}
      />

      <EditPoiDialog
        open={!!activePoiForEdit}
        poi={activePoiForEdit}
        categories={categories}
        areas={areas}
        onClose={onCloseEditPoiFromContext}
      />
    </>
  );
}
