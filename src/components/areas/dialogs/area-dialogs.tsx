import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddAreaForm from "@/components/areas/forms/add-area-form";
import EditAreaForm from "@/components/areas/forms/edit-area-form";
import type { Area } from "@/server/db/schema";
import type { AreaPoint } from "../utils/types";

interface AreaDialogsProps {
  mapId: number;
  draftPoints: AreaPoint[];
  editPoints: AreaPoint[];
  editSnapshot: Area | null;
  isCreateOpen: boolean;
  isEditOpen: boolean;
  isDeleteOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
  onEditOpenChange: (open: boolean) => void;
  onDeleteOpenChange: (open: boolean) => void;
  onCreateSuccess: (area: Area) => void;
  onEditSuccess: (area: Area) => void;
  onDeleteConfirm: () => void;
}

export function AreaDialogs({
  mapId,
  draftPoints,
  editPoints,
  editSnapshot,
  isCreateOpen,
  isEditOpen,
  isDeleteOpen,
  onCreateOpenChange,
  onEditOpenChange,
  onDeleteOpenChange,
  onCreateSuccess,
  onEditSuccess,
  onDeleteConfirm,
}: AreaDialogsProps) {
  return (
    <>
      <Dialog open={isCreateOpen} onOpenChange={onCreateOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva área</DialogTitle>
          </DialogHeader>
          <AddAreaForm
            mapId={mapId}
            polygonCoordinates={draftPoints}
            onSuccess={onCreateSuccess}
            refreshOnSuccess={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={onEditOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar área</DialogTitle>
          </DialogHeader>
          {editSnapshot && (
            <EditAreaForm
              area={editSnapshot}
              polygonCoordinates={editPoints}
              onSuccess={onEditSuccess}
              refreshOnSuccess={false}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar área</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará el área y su polígono.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onDeleteOpenChange(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={onDeleteConfirm}>
              Eliminar área
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
