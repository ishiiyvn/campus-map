"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Category, Level, Area, PointOfInterest } from "@/server/db/schema";
import { updatePointOfInterest, deletePointOfInterest } from "@/server/actions/pois";
import { PointOfInterestInput, pointOfInterestSchema } from "@/lib/validators/poi";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import PoiFormFields from "./poi-form-fields";
import { useTranslations } from "next-intl";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface PoiWithLevels extends PointOfInterest {
  level_ids?: number[];
}

interface EditPoiFormProps {
  poi: PointOfInterest;
  poiLevelIds?: number[];
  categories: Category[];
  areas: Area[];
  levels?: Level[];
  onSuccess?: () => void;
}

export default function EditPoiForm({
  poi,
  poiLevelIds = [],
  categories,
  areas,
  levels = [],
  onSuccess,
}: EditPoiFormProps) {
  const t = useTranslations("poi");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const form = useForm<PointOfInterestInput>({
    resolver: zodResolver(pointOfInterestSchema),
    defaultValues: {
      id: poi.id,
      name: poi.name,
      description: poi.description,
      map_id: poi.map_id,
      area_id: poi.area_id,
      x_coordinate: poi.x_coordinate,
      y_coordinate: poi.y_coordinate,
      category_id: poi.category_id,
      icon: poi.icon,
      icon_color: poi.icon_color,
      is_visible: poi.is_visible,
      display_order: poi.display_order,
      level_ids: poiLevelIds,
    },
  });

  useEffect(() => {
    form.reset({
      id: poi.id,
      name: poi.name,
      description: poi.description,
      map_id: poi.map_id,
      area_id: poi.area_id,
      x_coordinate: poi.x_coordinate,
      y_coordinate: poi.y_coordinate,
      category_id: poi.category_id,
      icon: poi.icon,
      icon_color: poi.icon_color,
      is_visible: poi.is_visible,
      display_order: poi.display_order,
      level_ids: poiLevelIds,
    });
  }, [poi, form, poiLevelIds]);

  async function onSubmit(values: PointOfInterestInput) {
    try {
      setIsLoading(true);
      await updatePointOfInterest(poi.id, values);
      toast.success(t("updateSuccess"));
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(t("updateError"));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true);
      await deletePointOfInterest(poi.id);
      toast.success(t("deleteSuccess"));
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(t("deleteError"));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PoiFormFields
          form={form}
          categories={categories}
          areas={areas}
          levels={levels}
          areaReadOnly={true}
        />

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={isLoading || isDeleting}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("save")}
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading || isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t("deleteConfirm")}
        onConfirm={handleDelete}
      />
    </Form>
  );
}
