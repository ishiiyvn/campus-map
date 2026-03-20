"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Category, Level, Area } from "@/server/db/schema";
import { createPointOfInterest } from "@/server/actions/pois";
import { PointOfInterestInput, pointOfInterestSchema } from "@/lib/validators/poi";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import PoiFormFields from "./poi-form-fields";
import { useTranslations } from "next-intl";

interface AddPoiFormProps {
  mapId: number;
  areaId?: number | null;
  categories: Category[];
  areas: Area[];
  levels?: Level[];
  defaultCoordinates: { x: number; y: number };
  onSuccess?: () => void;
}

export default function AddPoiForm({
  mapId,
  areaId,
  categories,
  areas,
  levels = [],
  defaultCoordinates,
  onSuccess,
}: AddPoiFormProps) {
  const t = useTranslations("poi");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PointOfInterestInput>({
    resolver: zodResolver(pointOfInterestSchema),
    defaultValues: {
      name: "",
      description: "",
      map_id: mapId,
      area_id: areaId ?? undefined,
      x_coordinate: defaultCoordinates.x,
      y_coordinate: defaultCoordinates.y,
      category_id: undefined,
      icon_color: "#000000",
      is_visible: true,
      display_order: 0,
      level_ids: [],
    },
  });

  async function onSubmit(values: PointOfInterestInput) {
    try {
      setIsLoading(true);
      await createPointOfInterest(values);
      toast.success(t("createSuccess"));
      form.reset();
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(t("createError"));
    } finally {
      setIsLoading(false);
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("add")}
        </Button>
      </form>
    </Form>
  );
}
