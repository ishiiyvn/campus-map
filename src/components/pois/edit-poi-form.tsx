"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Category, PointOfInterest } from "@/server/db/schema";
import { updatePointOfInterest, deletePointOfInterest } from "@/server/actions/pois";
import { PointOfInterestInput, pointOfInterestSchema } from "@/lib/validators/poi";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import PoiFormFields from "./poi-form-fields";

interface EditPoiFormProps {
  poi: PointOfInterest;
  categories: Category[];
  onSuccess?: () => void;
}

export default function EditPoiForm({
  poi,
  categories,
  onSuccess,
}: EditPoiFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<PointOfInterestInput>({
    resolver: zodResolver(pointOfInterestSchema),
    defaultValues: {
      id: poi.id,
      name: poi.name,
      description: poi.description,
      map_id: poi.map_id,
      x_coordinate: poi.x_coordinate,
      y_coordinate: poi.y_coordinate,
      category_id: poi.category_id,
      icon_color: poi.icon_color,
      is_visible: poi.is_visible,
      display_order: poi.display_order,
    },
  });

  async function onSubmit(values: PointOfInterestInput) {
    try {
      setIsLoading(true);
      await updatePointOfInterest(poi.id, values);
      toast.success("POI updated successfully");
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update POI");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this marker?")) return;
    
    try {
      setIsDeleting(true);
      await deletePointOfInterest(poi.id);
      toast.success("POI deleted");
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete POI");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PoiFormFields form={form} categories={categories} />
        
        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={isLoading || isDeleting}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
          
          <Button 
            type="button" 
            variant="destructive" 
            size="icon"
            onClick={handleDelete}
            disabled={isLoading || isDeleting}
          >
             {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}
