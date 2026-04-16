"use client";

import {
  Form,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"
import { Loader2 } from "lucide-react";

import { updateLayer } from "@/server/actions/layers";
import { LayerInput, layerSchema } from "@/lib/validators/layer";
import { LayerFormFields } from "./layer-form-fields";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";

import { Layer } from "@/server/db/schema";

export interface EditLayerFormProps {
  layer: Layer;
  onSubmitCallback?: () => void;
  onCancel?: () => void;
}

export function EditLayerForm({ layer, onSubmitCallback, onCancel }: EditLayerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LayerInput>({
    resolver: zodResolver(layerSchema),
    defaultValues: {
      map_id: layer.map_id,
      name: layer.name,
      display_order: layer.display_order,
      is_visible: layer.is_visible,
      fill_color: layer.fill_color,
      stroke_color: layer.stroke_color,
    }
  });

  async function onSubmit(values: LayerInput) {
    try {
      setIsLoading(true);
      await updateLayer(layer.id, { ...values, map_id: layer.map_id });
      toast.success("Capa actualizada");

      onSubmitCallback?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la capa");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
        <LayerFormFields form={form} isEdit />
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
