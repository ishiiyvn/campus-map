"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "destructive",
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = useCallback(() => {
    setIsLoading(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleConfirm = useCallback(() => {
    setIsLoading(true);
    try {
      const result = onConfirm();
      if (result instanceof Promise) {
        result.then(handleClose).catch(handleClose);
      } else {
        handleClose();
      }
    } catch (error) {
      handleClose();
    }
  }, [onConfirm, handleClose]);

  return (
    <Dialog open={open} onOpenChange={(newOpen) => { if (!newOpen) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
