import z from "zod";


export const layerSchema = z.object({
  id: z.number().optional(),
  map_id: z.number().int(),
  name: z.string().min(1, "El nombre de la capa es obligatorio"),
  slug: z.string().nullable().optional(),
  display_order: z.number().int().default(0).optional(),
  is_visible: z.boolean().default(true).optional(),
  created_at: z.date().optional(),
})

export type LayerInput = z.input<typeof layerSchema>;
export type LayerOutput = z.infer<typeof layerSchema>;
