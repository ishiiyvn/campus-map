"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { AreaInput } from "@/lib/validators";

interface AreaFormFieldsProps {
  form: UseFormReturn<AreaInput>;
}

export default function AreaFormFields({ form }: AreaFormFieldsProps) {
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
              <Input placeholder="Ejemplo: Bloque A, Estacionamiento 1..." {...field} />
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
              <Input placeholder="ejemplo: BLOQUE-A, EST-1..." {...field} />
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
              <Input placeholder="añade una descripción..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}