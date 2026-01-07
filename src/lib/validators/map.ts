import z from "zod"

export const mapSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "el nombre del mapa es obligatorio"),
  slug: z.string().optional(), // Will be generated on server if empty
  description: z.string().optional().default(""),
  map_image_url: z.url("la url de la imagen del mapa debe ser válida").max(2048, "La url es demasiado larga"),
  map_width: z.number().positive("el ancho del mapa debe ser un número positivo"),
  map_height: z.number().positive("la altura del mapa debe ser un número positivo"),
  viewport_config: z.object({
    zoom: z.number().positive("el zoom debe ser un número positivo"),
    center: z.tuple([z.number(), z.number()]),
    minzoom: z.number().positive("el zoom mínimo debe ser un número positivo").optional(),
    maxzoom: z.number().positive("el zoom máximo debe ser un número positivo").optional(),
  })
})

export type MapInput = z.input<typeof mapSchema>;
export type MapOutput = z.infer<typeof mapSchema>;
