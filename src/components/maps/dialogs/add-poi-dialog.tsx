"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddPoiForm from "@/components/pois/forms/add-poi-form";
import { Category } from "@/server/db/schema";

interface AddPoiDialogProps {
  open: boolean;
  location: { x: number; y: number } | null;
  mapId: number;
  categories: Category[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddPoiDialog({
  open,
  location,
  mapId,
  categories,
  onClose,
  onSuccess,
}: AddPoiDialogProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Marker</DialogTitle>
        </DialogHeader>
        {location && (
          <AddPoiForm
            mapId={mapId}
            categories={categories}
            defaultCoordinates={location}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
