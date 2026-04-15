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
  // Parent can supply this to be notified when a POI is deleted/updated so it can update UI without reload
  onDeleted?: (id: number) => void;
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
  onDeleted,
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

      {activePoi && (
        <EditPoiDialog
          open={!!activePoi}
          poi={activePoi}
          categories={categories}
          areas={areas}
          onClose={onCloseEditPoi}
          // When EditPoiDialog signals success (update or delete), notify parent with this POI id
          onSuccess={() => {
            onDeleted?.(activePoi.id);
          }}
        />
      )}

      {activePoiForEdit && (
        <EditPoiDialog
          open={!!activePoiForEdit}
          poi={activePoiForEdit}
          categories={categories}
          areas={areas}
          onClose={onCloseEditPoiFromContext}
          // When EditPoiDialog signals success (update or delete), notify parent with this POI id
          onSuccess={() => {
            onDeleted?.(activePoiForEdit.id);
          }}
        />
      )}
    </>
  );
}
