import type { AreaPoint } from "@/components/areas/utils/types";

export const arePointsEqual = (a: AreaPoint[], b: AreaPoint[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].x !== b[i].x || a[i].y !== b[i].y) {
      return false;
    }
  }
  return true;
};
