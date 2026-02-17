"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createArea } from "@/server/actions/areas";
import { AreaInput, areaSchema } from "@/lib/validators";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import AreaFormFields from "./area-form-fields";

interface AddAreaFormProps {
  mapId: number;
  polygonCoordinates?: { x: number; y: number }[];
  onSuccess?: () => void;
}

export default function AddAreaForm({ 
  mapId, 
  polygonCoordinates = [], 
  onSuccess 
}: AddAreaFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AreaInput>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      map_id: mapId,
      polygon_coordinates: polygonCoordinates,
    },
  });

  async function onSubmit(values: AreaInput) {
    try {
      setIsLoading(true);
      await createArea(values);
      toast.success("Area created successfully");
      form.reset();
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create area");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <AreaFormFields form={form} />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Area
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
  );
}
