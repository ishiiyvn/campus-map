import type { Area } from "@/server/db/schema";

export function isPointInPolygon(x: number, y: number, polygon: { x: number; y: number }[]): boolean {
  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

export function findAreaContainingPoint(
  x: number,
  y: number,
  areas: Area[]
): Area | null {
  for (const area of areas) {
    const polygon = (area.polygon_coordinates ?? []) as { x: number; y: number }[];
    if (polygon.length >= 3 && isPointInPolygon(x, y, polygon)) {
      return area;
    }
  }
  return null;
}
