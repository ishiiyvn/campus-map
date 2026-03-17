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
