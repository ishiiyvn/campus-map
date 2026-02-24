"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createArea } from "@/server/actions/areas";
import { AreaInput, areaSchema } from "@/lib/validators";
import { Area } from "@/server/db/schema";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import AreaFormFields from "./area-form-fields";

interface AddAreaFormProps {
  mapId: number;
  polygonCoordinates?: { x: number; y: number }[];
  onSuccess?: (area: Area) => void;
  refreshOnSuccess?: boolean;
}

export default function AddAreaForm({ 
  mapId, 
  polygonCoordinates = [], 
  onSuccess,
  refreshOnSuccess = true,
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

  useEffect(() => {
    form.setValue("map_id", mapId);
    form.setValue("polygon_coordinates", polygonCoordinates);
  }, [form, mapId, polygonCoordinates]);

  async function onSubmit(values: AreaInput) {
    try {
      setIsLoading(true);
      const newArea = await createArea({
        ...values,
        map_id: mapId,
        polygon_coordinates: polygonCoordinates,
      });
      toast.success("Area created successfully");
      form.reset();
      onSuccess?.(newArea as Area);
      if (refreshOnSuccess) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.includes("código")) {
        form.setError("code", {
          type: "validate",
          message: error.message,
        });
        return;
      }
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
      </form>
    </Form>
  );
}
