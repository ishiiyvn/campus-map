"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

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
