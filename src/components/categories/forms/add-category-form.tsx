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

import { createCategory } from "@/server/actions/categories";
import { CategoryInput, categorySchema } from "@/lib/validators/category";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";

export interface AddCategoryFormProps {
  onSubmitCallback?: () => void,
}

export default function AddCategoryForm({ onSubmitCallback }: AddCategoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#000000",
      icon: "",
    }
  });

  async function onSubmit(values: CategoryInput) {
    try {
      setIsLoading(true);
      await createCategory(values);
      toast.success("Category created successfully");

      form.reset();
      onSubmitCallback?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create category");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Category Name" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    className="w-12 p-1 h-10"
                    {...field}
                    value={field.value || "#000000"}
                  />
                  <Input
                    placeholder="#RRGGBB"
                    {...field}
                    value={field.value || ""}
                    className="font-mono"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save
        </Button>
      </form>
    </Form>
  )
}

