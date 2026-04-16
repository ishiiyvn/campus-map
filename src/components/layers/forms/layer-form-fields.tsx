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
import { Button } from "@/components/ui/button";

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

      <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Colores de la capa</p>
          {(!form.watch("fill_color") || !form.watch("stroke_color")) && (
            <p className="text-xs text-muted-foreground">
              Si no defines un color, las áreas usarán el color por defecto.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="fill_color"
            render={({ field }) => {
              const value = typeof field.value === "string" ? field.value : "";
              return (
                <FormItem>
                  <FormLabel>Relleno</FormLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={value || "#3b82f6"}
                      onChange={(event) => field.onChange(event.target.value)}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <FormControl>
                      <Input
                        value={value}
                        placeholder="#3b82f6"
                        autoComplete="off"
                        onChange={(event) => {
                          const next = event.target.value.trim();
                          field.onChange(next || null);
                        }}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="stroke_color"
            render={({ field }) => {
              const value = typeof field.value === "string" ? field.value : "";
              return (
                <FormItem>
                  <FormLabel>Borde</FormLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={value || "#3b82f6"}
                      onChange={(event) => field.onChange(event.target.value)}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <FormControl>
                      <Input
                        value={value}
                        placeholder="#3b82f6"
                        autoComplete="off"
                        onChange={(event) => {
                          const next = event.target.value.trim();
                          field.onChange(next || null);
                        }}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              form.setValue("fill_color", null, { shouldDirty: true });
              form.setValue("stroke_color", null, { shouldDirty: true });
              form.clearErrors(["fill_color", "stroke_color"]);
            }}
          >
            Reset to default colors
          </Button>
        </div>
      </div>
    </>
  );
}
