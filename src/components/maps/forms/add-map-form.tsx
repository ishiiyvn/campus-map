"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { createMap } from "@/server/actions/maps";
import { mapSchema, MapInput } from "@/lib/validators/map";
import { MapFormFields } from "./map-form-fields";

interface AddMapFormProps {
  onSubmitCallback?: () => void;
}

export default function AddMapForm({ onSubmitCallback }: AddMapFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Use MapInput for the form values type as it handles the input shape
  const form = useForm<MapInput>({
    resolver: zodResolver(mapSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      map_image_url: "",
      map_width: 0,
      map_height: 0,
      viewport_config: {
        zoom: 1,
        center: [0, 0],
        minzoom: 0.1,
        maxzoom: 5,
      },
    },
  });

  async function onSubmit(values: MapInput) {
    try {
      setIsLoading(true);
      await createMap(values);
      toast.success("Mapa creado exitosamente");
      form.reset();
      onSubmitCallback?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al crear el mapa");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <MapFormFields form={form} />
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Mapa
          </Button>
        </div>
      </form>
    </Form>
  );
}
