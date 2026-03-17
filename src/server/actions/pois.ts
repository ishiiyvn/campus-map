"use server"

import { db } from "@/index";
import { pointsOfInterest } from "../db/schema";
import { eq } from "drizzle-orm";
import { pointOfInterestSchema } from "@/lib/validators/poi";

export async function createPointOfInterest(data: unknown) {
  try {
    // Validate incoming data
    const validatedData = pointOfInterestSchema.parse(data);

    // Drizzle with doublePrecision accepts numbers directly
    const [newPoi] = await db
      .insert(pointsOfInterest)
      .values(validatedData)
      .returning();

    return newPoi;
  } catch (error) {
    console.error("Error creating point of interest:", error);
    throw error;
  }
}


export async function updatePointOfInterest(id: number, data: unknown) {
  try {
    const validatedData = pointOfInterestSchema.parse(data);

    // Drizzle with doublePrecision accepts numbers directly
    const [updatedPoi] = await db
      .update(pointsOfInterest)
      .set(validatedData)
      .where(eq(pointsOfInterest.id, id))
      .returning();

    return updatedPoi;
  } catch (error) {
    console.error("Error updating point of interest:", error);
    throw error;
  }
}


export async function deletePointOfInterest(id: number) {
  try {
    await db
      .delete(pointsOfInterest)
      .where(eq(pointsOfInterest.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting point of interest:", error);
    throw error;
  }
}
