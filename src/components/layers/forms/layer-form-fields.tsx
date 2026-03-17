"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

import { createLayer, updateLayer, deleteLayer } from "@/server/actions/layers";
import { LayerInput, layerSchema } from "@/lib/validators/layer";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";

export interface LayerFormFieldsProps {
  form: any;
  isEdit?: boolean;
}

export function LayerFormFields({ form, isEdit = false }: LayerFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input placeholder="Nombre de la capa" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="display_order"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Orden de visualización</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="0"
                {...field}
                value={field.value ?? 0}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_visible"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Visible</FormLabel>
              <p className="text-sm text-muted-foreground">
                La capa será visible en el mapa
              </p>
            </div>
            <FormControl>
              <Switch
                checked={field.value ?? true}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}

export interface AddLayerFormProps {
  mapId?: number;
  onSubmitCallback?: () => void;
}

export default function AddLayerForm({ mapId, onSubmitCallback }: AddLayerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LayerInput>({
    resolver: zodResolver(layerSchema),
    defaultValues: {
      map_id: mapId ?? 0,
      name: "",
      display_order: 0,
      is_visible: true,
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
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar
        </Button>
      </form>
    </Form>
  )
}
