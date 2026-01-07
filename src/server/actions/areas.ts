"use server";

import { db } from "@/index";
import { areas } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { areaSchema } from "@/lib/validators/area";

// ---------------------------
// FETCH AREAS
// ---------------------------


// Fetch all areas (admin overview)
export async function getAreas() {
  try {
    return await db.select().from(areas);
  } catch (error) {
    console.error("Error fetching areas:", error);
    throw error;
  }
}


// Fetch areas by map (for map display)
export async function getAreasByMapId(mapId: number) {
  try {
    return await db.select().from(areas).where(eq(areas.map_id, mapId)).orderBy(areas.name);
  } catch (error) {
    console.error("Error fetching areas by map:", error);
    throw error;
  }
}


// Fetch a single area by ID
export async function getAreaById(id: number) {
  try {
    const area = await db.select().from(areas).where(eq(areas.id, id)).limit(1);
    return area[0] || null;
  } catch (error) {
    console.error("Error fetching area by ID:", error);
    throw error;
  }
}

// ---------------------------
// CREATE / UPDATE / DELETE
// ---------------------------


export async function createArea(data: unknown) {
  try {
    // Validate incoming data
    const validatedData = areaSchema.parse(data);
    const [newArea] = await db
      .insert(areas)
      .values(validatedData)
      .returning();

    return newArea;
  } catch (error) {
    console.error("Error creating area:", error);
    throw error;
  }
}


export async function updateArea(id: number, data: unknown) {
  try {
    const validatedData = areaSchema.parse(data);
    const [updatedArea] = await db
      .update(areas)
      .set(validatedData)
      .where(eq(areas.id, id))
      .returning();

    return updatedArea;
  } catch (error) {
    console.error("Error updating area:", error);
    throw error;
  }
}


export async function deleteArea(id: number) {
  try {
    await db.delete(areas).where(eq(areas.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting area:", error);
    throw error;
  }
}
