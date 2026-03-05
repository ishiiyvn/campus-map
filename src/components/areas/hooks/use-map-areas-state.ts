"use client";

import { useCallback, useEffect, useState } from "react";
import type { Area } from "@/server/db/schema";

export function useMapAreasState(areas: Area[]) {
  const [mapAreas, setMapAreas] = useState<Area[]>(areas);

  useEffect(() => {
    setMapAreas(areas);
  }, [areas]);

  const addArea = useCallback((created: Area) => {
    setMapAreas((prev) => [...prev, created]);
  }, []);

  const updateArea = useCallback((updated: Area) => {
    setMapAreas((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }, []);

  const removeArea = useCallback((deletedId: number) => {
    setMapAreas((prev) => prev.filter((item) => item.id !== deletedId));
  }, []);

  return {
    mapAreas,
    addArea,
    updateArea,
    removeArea,
  };
}
