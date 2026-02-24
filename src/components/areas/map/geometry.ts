import type { AreaPoint } from "./types";

export const distanceToSegment = (p: AreaPoint, a: AreaPoint, b: AreaPoint) => {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = p.x - a.x;
  const apy = p.y - a.y;
  const abLenSq = abx * abx + aby * aby || 1;
  let t = (apx * abx + apy * aby) / abLenSq;
  t = Math.max(0, Math.min(1, t));
  const closestX = a.x + abx * t;
  const closestY = a.y + aby * t;
  const dx = p.x - closestX;
  const dy = p.y - closestY;
  return Math.hypot(dx, dy);
};

export const insertPointBetweenNearestEdges = (points: AreaPoint[], point: AreaPoint) => {
  if (points.length < 2) {
    return [...points, point];
  }

  let closestIndex = 0;
  let closestDist = Infinity;
  const lastIndex = points.length - 1;

  for (let i = 0; i < lastIndex; i += 1) {
    const dist = distanceToSegment(point, points[i], points[i + 1]);
    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = i;
    }
  }

  if (points.length >= 3) {
    const dist = distanceToSegment(point, points[lastIndex], points[0]);
    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = lastIndex;
    }
  }

  const next = [...points];
  const insertAt = closestIndex === lastIndex ? points.length : closestIndex + 1;
  next.splice(insertAt, 0, point);
  return next;
};
