"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditPoiForm from "@/components/pois/forms/edit-poi-form";
import { Category, PointOfInterest } from "@/server/db/schema";

interface EditPoiDialogProps {
  open: boolean;
  poi: PointOfInterest | null;
  categories: Category[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditPoiDialog({
  open,
  poi,
  categories,
  onClose,
  onSuccess,
}: EditPoiDialogProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Marker</DialogTitle>
        </DialogHeader>
        {poi && (
          <EditPoiForm
            poi={poi}
            categories={categories}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
