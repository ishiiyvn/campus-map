import { db } from "@/index";
import { areas } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function getAreas() {
  try {
    return await db.select().from(areas);
  } catch (error) {
    console.error("Error fetching areas:", error);
    throw error;
  }
}

export async function getAreasByMapId(mapId: number) {
  try {
    return await db.select().from(areas).where(eq(areas.map_id, mapId)).orderBy(areas.name);
  } catch (error) {
    console.error("Error fetching areas by map:", error);
    throw error;
  }
}

export async function getAreaById(id: number) {
  try {
    const area = await db.select().from(areas).where(eq(areas.id, id)).limit(1);
    return area[0] || null;
  } catch (error) {
    console.error("Error fetching area by ID:", error);
    throw error;
  }
}
