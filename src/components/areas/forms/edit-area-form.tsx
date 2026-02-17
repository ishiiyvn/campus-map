"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { Area } from "@/server/db/schema";
import { updateArea, deleteArea } from "@/server/actions/areas";
import { AreaInput, areaSchema } from "@/lib/validators";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import AreaFormFields from "./area-form-fields";

interface EditAreaFormProps {
  area: Area;
  onSuccess?: () => void;
}

type PolygonCoordinate = { x: number; y: number } | Record<string, unknown>;

export default function EditAreaForm({ area, onSuccess }: EditAreaFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AreaInput>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      name: area.name,
      code: area.code,
      description: area.description || "",
      map_id: area.map_id,
      polygon_coordinates: (area.polygon_coordinates as PolygonCoordinate[]) || [],
    },
  });

  useEffect(() => {
    form.reset({
      name: area.name,
      code: area.code,
      description: area.description || "",
      map_id: area.map_id,
      polygon_coordinates: (area.polygon_coordinates as PolygonCoordinate[]),
    });
  }, [area, form]);

  async function onSubmit(values: AreaInput) {
    try {
      setIsLoading(true);
      await updateArea(area.id!, values);
      toast.success("Area updated successfully");
      onSuccess?.();
      router.refresh();
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
        onSuccess?.();
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
        <AreaFormFields form={form} />
        
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
        {/*
           TODO: Polygon coordinates are currently defaulted to empty array.
           In the future, this should be handled by a map drawing tool.
        */}
        <input type="hidden" {...form.register("polygon_coordinates")} value={JSON.stringify(form.watch("polygon_coordinates"))} />
      </form>
    </Form>
  );
}
