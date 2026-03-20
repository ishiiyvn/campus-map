"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createArea } from "@/server/actions/areas";
import { AreaInput, areaSchema } from "@/lib/validators";
import { Area, Layer } from "@/server/db/schema";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import AreaFormFields from "./area-form-fields";
import { LevelManagement } from "@/components/areas/level-management";
import { useTranslations } from "next-intl";

interface AddAreaFormProps {
  mapId: number;
  polygonCoordinates?: { x: number; y: number }[];
  onSuccess?: (area: Area) => void;
  refreshOnSuccess?: boolean;
  layers?: Layer[];
}

export default function AddAreaForm({ 
  mapId, 
  polygonCoordinates = [], 
  onSuccess,
  refreshOnSuccess = true,
  layers = [],
}: AddAreaFormProps) {
  const t = useTranslations("areas");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [createdArea, setCreatedArea] = useState<Area | null>(null);

  const form = useForm<AreaInput>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      map_id: mapId,
      polygon_coordinates: polygonCoordinates,
    },
  });

  useEffect(() => {
    form.setValue("map_id", mapId);
    form.setValue("polygon_coordinates", polygonCoordinates);
  }, [form, mapId, polygonCoordinates]);

  async function onSubmit(values: AreaInput) {
    try {
      setIsLoading(true);
      const newArea = await createArea({
        ...values,
        map_id: mapId,
        polygon_coordinates: polygonCoordinates,
      });
      toast.success("Area created successfully");
      setCreatedArea(newArea as Area);
      onSuccess?.(newArea as Area);
      if (refreshOnSuccess) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.includes("código")) {
        form.setError("code", {
          type: "validate",
          message: error.message,
        });
        return;
      }
      toast.error("Failed to create area");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <AreaFormFields form={form} layers={layers} />
        
        {createdArea ? (
          <LevelManagement areaId={createdArea.id!} />
        ) : (
          <p className="text-xs text-muted-foreground/70">
            {t("addForm.levelsHint")}
          </p>
        )}
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {createdArea ? "Área creada" : "Crear área"}
        </Button>

        {/* Hidden fields for required data */}
        <input type="hidden" {...form.register("map_id", { valueAsNumber: true })} />
      </form>
    </Form>
  );
}
