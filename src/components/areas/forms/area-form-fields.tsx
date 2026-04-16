"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { AreaInput } from "@/lib/validators";
import { isAreaCodeAvailable } from "@/server/actions/areas";
import slugify from "slugify";
import { useRef, useState } from "react";
import { Layer } from "@/server/db/schema";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AreaFormFieldsProps {
  form: UseFormReturn<AreaInput>;
  initialCode?: string;
  layers?: Layer[];
}

export default function AreaFormFields({ form, initialCode, layers = [] }: AreaFormFieldsProps) {
  // Initialize touched state from the passed initialCode or the form's current value.
  // Use a lazy initializer so getValues is only called once during initial render.
  const [codeTouched, setCodeTouched] = useState<boolean>(() => {
    if (typeof initialCode === "string" && initialCode.length > 0) return true;
    const fromForm = form.getValues("code");
    return !!fromForm;
  });
  const requestIdRef = useRef(0);

  const generateCode = (name: string) => slugify(name, { lower: true, strict: true });

  const setUniqueCode = async (name: string) => {
    const base = generateCode(name);
    if (!base) return;
    const requestId = ++requestIdRef.current;

    const available = await isAreaCodeAvailable(base);
    if (requestId !== requestIdRef.current) return;
    if (available.available) {
      form.setValue("code", base, { shouldDirty: true, shouldValidate: true });
      form.clearErrors("code");
      return;
    }

    for (let i = 2; i <= 99; i += 1) {
      const candidate = `${base}-${i}`;
      const result = await isAreaCodeAvailable(candidate);
      if (requestId !== requestIdRef.current) return;
      if (result.available) {
        form.setValue("code", candidate, { shouldDirty: true, shouldValidate: true });
        form.clearErrors("code");
        return;
      }
    }
  };

  return (
    <>
      {/* Area Name Field */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name:</FormLabel>
            <FormControl>
              <Input
                placeholder="Ejemplo: Bloque A, Estacionamiento 1..."
                autoComplete="off"
                {...field}
                onChange={(event) => {
                  field.onChange(event);
                  if (codeTouched) return;
                  const value = event.target.value;
                  const nextCode = generateCode(value);
                  if (!nextCode) return;
                  form.setValue("code", nextCode, { shouldDirty: true, shouldValidate: false });
                }}
                onBlur={async (event) => {
                  field.onBlur();
                  if (codeTouched) return;
                  const value = event.target.value.trim();
                  if (!value) return;
                  await setUniqueCode(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Code Field */}
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código:</FormLabel>
            <FormControl>
              <Input
                placeholder="ejemplo: BLOQUE-A, EST-1..."
                autoComplete="off"
                {...field}
                onChange={(event) => {
                  field.onChange(event);
                  if (!codeTouched) {
                    setCodeTouched(true);
                  }
                }}
                onBlur={async (event) => {
                  field.onBlur();
                  const value = event.target.value.trim();
                  if (initialCode && value === initialCode) return;
                  if (!value) return;
                  const result = await isAreaCodeAvailable(value);
                  if (!result.available) {
                    form.setError("code", {
                      type: "validate",
                      message: "El código ya existe. Usa otro.",
                    });
                    return;
                  }
                  form.clearErrors("code");
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Description Field */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción:</FormLabel>
            <FormControl>
              <Input placeholder="añade una descripción..." autoComplete="off" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Color Fields */}
      <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Colores del area</p>
          {(!form.watch("fill_color") || !form.watch("stroke_color")) && (
            <p className="text-xs text-muted-foreground">
              Colores por defecto activos para cualquier color sin definir.
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

      {/* Layer Selection */}
      {layers.length > 0 && (
        <FormField
          control={form.control}
          name="layer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capa:</FormLabel>
              <FormControl>
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una capa" />
                  </SelectTrigger>
                  <SelectContent>
                    {layers.map((layer) => (
                      <SelectItem key={layer.id} value={layer.id.toString()}>
                        {layer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
