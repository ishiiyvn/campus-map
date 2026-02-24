"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { AreaInput } from "@/lib/validators";
import { isAreaCodeAvailable } from "@/server/actions/areas";
import slugify from "slugify";
import { useEffect, useRef, useState } from "react";

interface AreaFormFieldsProps {
  form: UseFormReturn<AreaInput>;
  initialCode?: string;
}

export default function AreaFormFields({ form, initialCode }: AreaFormFieldsProps) {
  const [codeTouched, setCodeTouched] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const initialCode = form.getValues("code");
    if (initialCode) {
      setCodeTouched(true);
    }
  }, [form]);

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
    </>
  );
}
