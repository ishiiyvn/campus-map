import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner"
import { Loader2 } from "lucide-react";

import { Area } from "@/server/db/schema";
import { createArea, updateArea } from "@/server/actions/areas";
import { AreaOutput, areaSchema } from "@/lib/validators";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";

export interface AreaFormProps {
  area?: Area,
  onSubmitCallback?: () => void,
  mapId?: number;
}

type PolygonCoordinate = { x: number; y: number } | Record<string, unknown>;

// Helper type for Area with potential extra properties
type AreaWithPotentialType = Area & { type?: string };

export default function AreaForm({ area, onSubmitCallback, mapId = 1 }: AreaFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AreaOutput>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      name: area?.name || "",
      code: area?.code || "",
      description: area?.description || "",
      type: (area as unknown as AreaWithPotentialType)?.type || "generico",
      map_id: area?.map_id || mapId,
      polygon_coordinates: (area?.polygon_coordinates as PolygonCoordinate[]) || [],
    },
  });

  useEffect(() => {
    if (area) {
      form.reset({
        name: area.name,
        code: area.code,
        description: area.description || "",
        type: (area as unknown as AreaWithPotentialType)?.type || "generico",
        map_id: area.map_id,
        polygon_coordinates: (area.polygon_coordinates as PolygonCoordinate[]),
      });
    }
  }, [area, form]);

  async function onSubmit(values: AreaOutput) {
    try {
      setIsLoading(true);

      if (area && area.id) {
        await updateArea(area.id, values);
        toast.success("Area updated successfully");
      } else {
        await createArea(values);
        toast.success("Area created successfully");
      }

      form.reset();
      onSubmitCallback?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(area ? "Failed to update area" : "Failed to create area");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form} >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Area Name Field*/}
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
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Área:</FormLabel>
              <FormControl>
                <Input placeholder="valor por defecto: generico" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : (area ? "Save Changes" : "Add")}
        </Button>

        {/* Hidden fields for required data */}
        <input type="hidden" {...form.register("map_id", { valueAsNumber: true })} />
        {/*
           TODO: Polygon coordinates are currently defaulted to empty array.
           In the future, this should be handled by a map drawing tool.
        */}
        <input type="hidden" {...form.register("polygon_coordinates")} value={JSON.stringify(form.watch("polygon_coordinates"))} />
      </form>
    </Form>
  )
}
