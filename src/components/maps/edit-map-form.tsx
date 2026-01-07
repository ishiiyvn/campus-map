"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { updateMap } from "@/server/actions/maps";
import { mapSchema, MapInput } from "@/lib/validators/map";
import { MapFormFields } from "./map-form-fields";
import { Map } from "@/server/db/schema";

interface EditMapFormProps {
  map: Map;
  onSubmitCallback?: () => void;
}

export default function EditMapForm({ map, onSubmitCallback }: EditMapFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MapInput>({
    resolver: zodResolver(mapSchema),
    defaultValues: {
      name: map.name,
      description: map.description,
      map_image_url: map.map_image_url,
      map_width: map.map_width,
      map_height: map.map_height,
      viewport_config: map.viewport_config as any, // Cast because JSON type from DB might differ slightly
    },
  });

  async function onSubmit(values: MapInput) {
    try {
      setIsLoading(true);
      await updateMap(map.id, values);
      toast.success("Mapa actualizado exitosamente");
      onSubmitCallback?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el mapa");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form as any}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <MapFormFields form={form as unknown as any} />
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Form>
  );
}
