import { db } from "@/index";
import { pointsOfInterest, poiLevels, levels } from "../db/schema";
import { eq } from "drizzle-orm";

async function attachLevelIds<T extends { id: number }>(pois: T[]) {
  return Promise.all(
    pois.map(async (poi) => {
      const poiLevelRecords = await db
        .select({
          id: levels.id,
        })
        .from(poiLevels)
        .innerJoin(levels, eq(poiLevels.level_id, levels.id))
        .where(eq(poiLevels.poi_id, poi.id));
      return { ...poi, level_ids: poiLevelRecords.map((l) => l.id) };
    })
  );
}

export async function getPointOfInterestById(id: number) {
  try {
    const pois = await db
      .select()
      .from(pointsOfInterest)
      .where(eq(pointsOfInterest.id, id));
    return attachLevelIds(pois);
  } catch (error) {
    console.error("Error fetching point of interest by ID:", error);
    throw error;
  }
}

export async function getPointsOfInterest() {
  try {
    const pois = await db.select().from(pointsOfInterest);
    return attachLevelIds(pois);
  } catch (error) {
    console.error("Error fetching points of interest:", error);
    throw error;
  }
}

export async function getPoisByMap(mapId: number) {
  try {
    const pois = await db
      .select()
      .from(pointsOfInterest)
      .where(eq(pointsOfInterest.map_id, mapId));
    return attachLevelIds(pois);
  } catch (error) {
    console.error("Error fetching POIs by map:", error);
    throw error;
  }
}

export async function getPoisByArea(areaId: number) {
  try {
    const pois = await db
      .select()
      .from(pointsOfInterest)
      .where(eq(pointsOfInterest.area_id, areaId));
    return attachLevelIds(pois);
  } catch (error) {
    console.error("Error fetching POIs by area:", error);
    throw error;
  }
}

export async function getMapLevelPois(mapId: number) {
  try {
    const pois = await db
      .select()
      .from(pointsOfInterest)
      .where(eq(pointsOfInterest.map_id, mapId));
    const mapLevelPois = pois.filter((poi) => poi.area_id === null);
    return attachLevelIds(mapLevelPois);
  } catch (error) {
    console.error("Error fetching map-level POIs:", error);
    throw error;
  }
}
