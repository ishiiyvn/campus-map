import z from "zod"


export const pointOfInterestSchema = z.object({
  id: z.number().optional(),
  map_id: z.number().int(),
  area_id: z.number().int().nullable().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category_id: z.number().int("Category must be an integer"),
  x_coordinate: z.number(),
  y_coordinate: z.number(),
  icon: z.string().nullable().optional(),
  icon_color: z.string().nullable().optional(),
  is_visible: z.boolean().default(true).optional(),
  display_order: z.number().int().default(0).optional(),
  //  properties: poiPropertiesSchema.optional(),
  is_active: z.boolean().default(true).optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type PointOfInterestInput = z.input<typeof pointOfInterestSchema>;
export type PointOfInterestOutput = z.infer<typeof pointOfInterestSchema>;

