"use client";

import { useMemo } from "react";
import { Category, PointOfInterest, Area } from "@/server/db/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface MapViewDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMobile: boolean;
  poi: PointOfInterest | null;
  area: Area | null;
  categories: Category[];
}

export function MapViewDetails({
  open,
  onOpenChange,
  isMobile,
  poi,
  area,
  categories,
}: MapViewDetailsProps) {
  const category = useMemo(() => {
    if (!poi) return null;
    return categories.find((entry) => entry.id === poi.category_id) ?? null;
  }, [categories, poi]);

  const title = poi ? poi.name : area?.name ?? "Detalle";
  const description = poi ? poi.description : area?.description ?? "";

  const details = (
    <div className="space-y-4">
      {poi && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">POI</Badge>
            {category && <Badge variant="outline">{category.name}</Badge>}
          </div>
          {description && (
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {description}
            </p>
          )}
        </>
      )}

      {area && !poi && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Area</Badge>
            {area.code && <Badge variant="outline">{area.code}</Badge>}
          </div>
          {description && (
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {description}
            </p>
          )}
        </>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>
              {poi ? "Punto de interes" : "Area"}
            </SheetDescription>
          </SheetHeader>
          {details}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {details}
      </DialogContent>
    </Dialog>
  );
}
