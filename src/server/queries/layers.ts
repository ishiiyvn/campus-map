import { db } from "@/index";
import { layers } from "../db/schema";
import { eq, and } from "drizzle-orm";

export async function getLayers(mapId?: number) {
  try {
    if (mapId) {
      return await db
        .select()
        .from(layers)
        .where(eq(layers.map_id, mapId))
        .orderBy(layers.display_order);
    }
    return await db.select().from(layers).orderBy(layers.display_order);
  } catch (error) {
    console.error("Error fetching layers:", error);
    return [];
  }
}

export async function getLayerById(id: number, mapId: number) {
  try {
    return await db.select()
      .from(layers)
      .where(and(eq(layers.id, id), eq(layers.map_id, mapId)));
  } catch (error) {
    console.error("Error fetching layer by ID:", error);
  }
}
