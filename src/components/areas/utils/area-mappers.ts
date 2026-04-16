import type { Area, Layer } from "@/server/db/schema";

const getPolygonCentroid = (points: { x: number; y: number }[]) => {
  if (points.length < 3) {
    return points[0] ?? { x: 0, y: 0 };
  }

  let signedArea = 0;
  let centroidX = 0;
  let centroidY = 0;

  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const cross = current.x * next.y - next.x * current.y;
    signedArea += cross;
    centroidX += (current.x + next.x) * cross;
    centroidY += (current.y + next.y) * cross;
  }

  if (Math.abs(signedArea) < 1e-7) {
    const total = points.reduce(
      (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
      { x: 0, y: 0 },
    );
    return { x: total.x / points.length, y: total.y / points.length };
  }

  const areaFactor = 1 / (3 * signedArea);
  return {
    x: centroidX * areaFactor,
    y: centroidY * areaFactor,
  };
};

export const buildAreaRenderData = (areas: Area[], layers: Layer[] = []) => {
  const layerColorMap = new Map(
    layers.map((layer) => [
      layer.id,
      { fill_color: layer.fill_color, stroke_color: layer.stroke_color },
    ]),
  );

  return areas.map((area) => {
    const points = (area.polygon_coordinates ?? []) as { x: number; y: number }[];
    const layerColors = area.layer_id ? layerColorMap.get(area.layer_id) : undefined;
    const labelPosition = getPolygonCentroid(points);

    return {
      id: area.id,
      name: area.name,
      layer_id: area.layer_id ?? null,
      points: points.flatMap((point) => [point.x, point.y]),
      fill: area.fill_color || layerColors?.fill_color || "rgba(59,130,246,0.5)",
      stroke: area.stroke_color || layerColors?.stroke_color || "#3b82f6",
      labelX: labelPosition.x,
      labelY: labelPosition.y,
    };
  });
};
