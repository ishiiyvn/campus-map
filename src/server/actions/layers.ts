"use server"

import { db } from "@/index";
import { layers } from "../db/schema";
import { eq } from "drizzle-orm";
import { layerSchema } from "@/lib/validators/layer";

export async function createLayer(data: unknown) {
  try {
    const validatedData = layerSchema.parse(data);
    const [newLayer] = await db
      .insert(layers)
      .values(validatedData)
      .returning();

    return newLayer;
  } catch (error) {
    console.error("Error creating layer:", error);
    throw error;
  }
}


export async function updateLayer(id: number, data: unknown) {
  try {
    const validatedData = layerSchema.parse(data);
    const [updatedLayer] = await db
      .update(layers)
      .set(validatedData)
      .where(eq(layers.id, id))
      .returning();

    return updatedLayer;
  } catch (error) {
    console.error("Error updating layer:", error);
    throw error;
  }
}


export async function deleteLayer(id: number) {
  try {
    await db.delete(layers).where(eq(layers.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting layer:", error);
    throw error;
  }
}

export async function reorderLayers(orderedIds: number[]) {
  try {
    // Get current layers ordered by display_order (original positions)
    const currentLayers = await db
      .select({ id: layers.id, display_order: layers.display_order })
      .from(layers)
      .orderBy(layers.display_order);

    // Create a map of id -> display_order for quick lookup
    const idToDisplayOrder = new Map(currentLayers.map(l => [l.id, l.display_order]));

    // Update each layer: assign the display_order of whatever was at that position originally
    for (let i = 0; i < orderedIds.length; i++) {
      const layerId = orderedIds[i];
      // The layer at position i gets the display_order of what was originally at position i
      const originalLayer = currentLayers[i];
      if (originalLayer) {
        await db
          .update(layers)
          .set({ display_order: originalLayer.display_order })
          .where(eq(layers.id, layerId));
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Error reordering layers:", error);
    throw error;
  }
}
