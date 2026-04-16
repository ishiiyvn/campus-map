"use client";

import {
  Form,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"
import { Loader2 } from "lucide-react";

import { createLayer } from "@/server/actions/layers";
import { LayerInput, layerSchema } from "@/lib/validators/layer";
import { LayerFormFields } from "./layer-form-fields";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";

export interface AddLayerFormProps {
  mapId?: number;
  onSubmitCallback?: () => void;
  onCancel?: () => void;
}

export default function AddLayerForm({ mapId, onSubmitCallback, onCancel }: AddLayerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LayerInput>({
    resolver: zodResolver(layerSchema),
    defaultValues: {
      map_id: mapId ?? 0,
      name: "",
      display_order: 0,
      is_visible: true,
      fill_color: null,
      stroke_color: null,
    }
  });

  async function onSubmit(values: LayerInput) {
    try {
      setIsLoading(true);
      const finalMapId = mapId ?? (values.map_id ?? 0);
      await createLayer({ ...values, map_id: finalMapId });
      toast.success("Capa creada exitosamente");

      form.reset();
      onSubmitCallback?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al crear la capa");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <LayerFormFields form={form} />
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
