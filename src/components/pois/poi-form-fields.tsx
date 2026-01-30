"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Category } from "@/server/db/schema";
import { UseFormReturn } from "react-hook-form";
import { PointOfInterestInput } from "@/lib/validators/poi";
import { useEffect } from "react";

interface PoiFormFieldsProps {
  form: UseFormReturn<PointOfInterestInput>;
  categories: Category[];
}

export default function PoiFormFields({ form, categories }: PoiFormFieldsProps) {
  // Watch category_id to auto-update color
  const selectedCategoryId = form.watch("category_id");

  useEffect(() => {
    if (selectedCategoryId) {
      const category = categories.find((c) => c.id === selectedCategoryId);
      // If category has a color and user hasn't manually set a custom color yet (or we want to override), set it
      // For now, let's only set it if the current color is empty or black (default)
      if (category?.color) {
        form.setValue("icon_color", category.color);
      }
    }
  }, [selectedCategoryId, categories, form]);

  return (
    <div className="space-y-4">
      {/* Name */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="POI Name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Description..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category */}
      <FormField
        control={form.control}
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select
              onValueChange={(val) => field.onChange(Number(val))}
              value={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center gap-2">
                      {category.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Color */}
      <FormField
        control={form.control}
        name="icon_color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marker Color</FormLabel>
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

      {/* Coordinates (Hidden or ReadOnly) */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="x_coordinate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">X Coordinate</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" readOnly {...field} className="bg-muted" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="y_coordinate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Y Coordinate</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" readOnly {...field} className="bg-muted" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
