import type { Area } from "@/server/db/schema";

export const buildAreaRenderData = (areas: Area[]) =>
  areas.map((area) => {
    const points = (area.polygon_coordinates ?? []) as { x: number; y: number }[];
    return {
      id: area.id,
      layer_id: area.layer_id ?? null,
      points: points.flatMap((point) => [point.x, point.y]),
      fill: area.fill_color || "rgba(59,130,246,0.2)",
      stroke: area.stroke_color || "#3b82f6",
    };
  });
