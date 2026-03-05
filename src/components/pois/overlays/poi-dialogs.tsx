"use client";

import type { Category, PointOfInterest } from "@/server/db/schema";
import { AddPoiDialog } from "@/components/maps/dialogs/add-poi-dialog";
import { EditPoiDialog } from "@/components/maps/dialogs/edit-poi-dialog";

interface PoiDialogsProps {
  mapId: number;
  categories: Category[];
  activePoi: PointOfInterest | null;
  newPoiLocation: { x: number; y: number } | null;
  onCloseNewPoi: () => void;
  onCloseEditPoi: () => void;
}

export function PoiDialogs({
  mapId,
  categories,
  activePoi,
  newPoiLocation,
  onCloseNewPoi,
  onCloseEditPoi,
}: PoiDialogsProps) {
  return (
    <>
      <AddPoiDialog
        open={!!newPoiLocation}
        location={newPoiLocation}
        mapId={mapId}
        categories={categories}
        onClose={onCloseNewPoi}
      />

      <EditPoiDialog
        open={!!activePoi}
        poi={activePoi}
        categories={categories}
        onClose={onCloseEditPoi}
      />
    </>
  );
}
