import z from "zod";


export const categorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "El nombre de la categoría es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  parent_category_id: z.number().int().nullable().optional(),
  is_active: z.boolean().default(true).optional(),
  created_at: z.date().optional(),
})

export type CategoryInput = z.input<typeof categorySchema>;
export type CategoryOutput = z.infer<typeof categorySchema>;



