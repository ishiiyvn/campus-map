"use server"

import { db } from "@/index";
import { pointsOfInterest, poiLevels } from "../db/schema";
import { eq } from "drizzle-orm";
import { pointOfInterestSchema } from "@/lib/validators/poi";

export async function createPointOfInterest(data: unknown) {
  try {
    const validatedData = pointOfInterestSchema.parse(data);
    const { level_ids, ...poiData } = validatedData;

    const [newPoi] = await db
      .insert(pointsOfInterest)
      .values(poiData)
      .returning();

    if (level_ids && level_ids.length > 0) {
      const poiLevelRecords = level_ids.map((levelId) => ({
        poi_id: newPoi.id,
        level_id: levelId,
      }));
      await db.insert(poiLevels).values(poiLevelRecords);
    }

    return { ...newPoi, level_ids: level_ids || [] };
  } catch (error) {
    console.error("Error creating point of interest:", error);
    throw error;
  }
}

export async function updatePointOfInterest(id: number, data: unknown) {
  try {
    const validatedData = pointOfInterestSchema.parse(data);
    const { level_ids, id: _, ...poiData } = validatedData;

    const [updatedPoi] = await db
      .update(pointsOfInterest)
      .set(poiData)
      .where(eq(pointsOfInterest.id, id))
      .returning();

    if (level_ids !== undefined) {
      await db.delete(poiLevels).where(eq(poiLevels.poi_id, id));

      if (level_ids.length > 0) {
        const poiLevelRecords = level_ids.map((levelId) => ({
          poi_id: id,
          level_id: levelId,
        }));
        await db.insert(poiLevels).values(poiLevelRecords);
      }
    }

    return { ...updatedPoi, level_ids: level_ids || [] };
  } catch (error) {
    console.error("Error updating point of interest:", error);
    throw error;
  }
}

export async function deletePointOfInterest(id: number) {
  try {
    await db.delete(poiLevels).where(eq(poiLevels.poi_id, id));
    await db.delete(pointsOfInterest).where(eq(pointsOfInterest.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting point of interest:", error);
    throw error;
  }
}

export async function updatePoiCoordinates(id: number, x: number, y: number) {
  try {
    const [updatedPoi] = await db
      .update(pointsOfInterest)
      .set({ x_coordinate: x, y_coordinate: y })
      .where(eq(pointsOfInterest.id, id))
      .returning();

    return updatedPoi;
  } catch (error) {
    console.error("Error updating POI coordinates:", error);
    throw error;
  }
}
