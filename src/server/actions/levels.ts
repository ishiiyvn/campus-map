"use server"

import { db } from "@/index";
import { levels, poiLevels } from "../db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { levelSchema } from "@/lib/validators/level";

export async function getLevelsByArea(areaId: number) {
  try {
    const result = await db
      .select()
      .from(levels)
      .where(eq(levels.area_id, areaId))
      .orderBy(levels.display_order);

    return result;
  } catch (error) {
    console.error("Error fetching levels:", error);
    throw error;
  }
}

export async function createLevel(data: unknown) {
  try {
    const validatedData = levelSchema.parse(data);
    const [newLevel] = await db
      .insert(levels)
      .values(validatedData)
      .returning();

    return newLevel;
  } catch (error) {
    console.error("Error creating level:", error);
    throw error;
  }
}

export async function updateLevel(id: number, data: unknown) {
  try {
    const validatedData = levelSchema.parse(data);
    const [updatedLevel] = await db
      .update(levels)
      .set(validatedData)
      .where(eq(levels.id, id))
      .returning();

    return updatedLevel;
  } catch (error) {
    console.error("Error updating level:", error);
    throw error;
  }
}

export async function deleteLevel(id: number) {
  try {
    await db.delete(levels).where(eq(levels.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting level:", error);
    throw error;
  }
}

export async function reorderLevels(areaId: number, orderedIds: number[]) {
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      await db
        .update(levels)
        .set({ display_order: i })
        .where(and(eq(levels.id, orderedIds[i]), eq(levels.area_id, areaId)));
    }
    return { success: true };
  } catch (error) {
    console.error("Error reordering levels:", error);
    throw error;
  }
}

export async function getAllLevels() {
  try {
    const result = await db
      .select()
      .from(levels)
      .orderBy(levels.area_id, levels.display_order);

    return result;
  } catch (error) {
    console.error("Error fetching all levels:", error);
    throw error;
  }
}
