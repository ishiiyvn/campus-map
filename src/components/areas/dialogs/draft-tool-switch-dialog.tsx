"use client";

import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DraftToolSwitchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  onKeepEditing: () => void;
}

export function DraftToolSwitchDialog({
  open,
  onOpenChange,
  onDiscard,
  onKeepEditing,
}: DraftToolSwitchDialogProps) {
  const t = useTranslations("areas.draftGuard");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onKeepEditing}>
            {t("keep")}
          </Button>
          <Button type="button" variant="destructive" onClick={onDiscard}>
            {t("discard")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
