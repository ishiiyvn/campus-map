"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { Area, Category, Layer } from "@/server/db/schema";
import { updateArea, deleteArea } from "@/server/actions/areas";
import { AreaInput, areaSchema } from "@/lib/validators";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import AreaFormFields from "./area-form-fields";
import { isAreaCodeAvailable } from "@/server/actions/areas";

interface EditAreaFormProps {
  area: Area;
  polygonCoordinates?: { x: number; y: number }[];
  onSuccess?: (updated: Area) => void;
  refreshOnSuccess?: boolean;
  categories?: Category[];
  layers?: Layer[];
}

type PolygonCoordinate = { x: number; y: number } | Record<string, unknown>;

export default function EditAreaForm({
  area,
  polygonCoordinates,
  onSuccess,
  refreshOnSuccess = true,
  categories = [],
  layers = [],
}: EditAreaFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AreaInput>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      name: area.name,
      code: area.code,
      description: area.description || "",
      map_id: area.map_id,
      category_id: area.category_id ?? undefined,
      layer_id: area.layer_id ?? undefined,
      polygon_coordinates: polygonCoordinates ?? ((area.polygon_coordinates as PolygonCoordinate[]) || []),
    },
  });

  useEffect(() => {
    form.reset({
      name: area.name,
      code: area.code,
      description: area.description || "",
      map_id: area.map_id,
      category_id: area.category_id ?? undefined,
      layer_id: area.layer_id ?? undefined,
      polygon_coordinates: polygonCoordinates ?? (area.polygon_coordinates as PolygonCoordinate[]),
    });
  }, [area, form, polygonCoordinates]);

  async function onSubmit(values: AreaInput) {
    try {
      setIsLoading(true);
      if (values.code !== area.code) {
        const result = await isAreaCodeAvailable(values.code);
        if (!result.available) {
          form.setError("code", {
            type: "validate",
            message: "El código ya existe. Usa otro.",
          });
          setIsLoading(false);
          return;
        }
      }
      const updatedArea = await updateArea(area.id!, {
        ...values,
        polygon_coordinates: polygonCoordinates ?? values.polygon_coordinates,
      });
      toast.success("Area updated successfully");
      onSuccess?.(updatedArea as Area);
      if (refreshOnSuccess) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update area");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (window.confirm("Are you sure you want to delete this area?")) {
      try {
        setIsLoading(true);
        await deleteArea(area.id!);
        toast.success("Area deleted successfully");
        if (onSuccess) {
          onSuccess(area);
        }
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete area");
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <AreaFormFields form={form} initialCode={area.code} categories={categories} layers={layers} />
        
        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Hidden fields for required data */}
        <input type="hidden" {...form.register("map_id", { valueAsNumber: true })} />
      </form>
    </Form>
  );
}
