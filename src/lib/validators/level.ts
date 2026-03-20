import z from "zod";

export const levelSchema = z.object({
  id: z.number().optional(),
  area_id: z.number().int(),
  name: z.string().min(1, "Name is required"),
  display_order: z.number().int().default(0),
});

export type LevelInput = z.input<typeof levelSchema>;
export type LevelOutput = z.infer<typeof levelSchema>;
