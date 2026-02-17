import z from "zod";


const classroomProps = z.object({
  type: z.literal("classroom"),
  capacity: z.number().int().positive("la capacidad debe ser un número positivo"),
  hasProjector: z.boolean().optional(),
});

const officeProps = z.object({
  type: z.literal("office"),
  name: z.string().min(1, "el nombre de la oficina es obligatorio"),
  department: z.string().optional(),
});


export const areaPropertiesSchema = z.discriminatedUnion("type", [
  classroomProps,
  officeProps,
]);


// Zod schema
export const areaSchema = z.object({
  id: z.number().optional(),
  map_id: z.number().int(),
  parent_area_id: z.number().int().nullable().optional(),
  category_id: z.number().int().nullable().optional(),
  name: z.string().min(1, "El nombre del área es obligatorio"),
  code: z.string().min(1, "El código es obligatorio"),
  description: z.string().optional(),
  polygon_coordinates: z.any(),
  fill_color: z.string().nullable().optional(),
  stroke_color: z.string().nullable().optional(),
  properties: areaPropertiesSchema.optional(),
});

export type AreaInput = z.input<typeof areaSchema>;
export type AreaOutput = z.infer<typeof areaSchema>;
