"use server"

import { db } from "@/index";
import { pointsOfInterest } from "../db/schema";
import { eq } from "drizzle-orm";
import { pointOfInterestSchema } from "@/lib/validators/poi";

// ---------------------------
// FETCH POINTS OF INTEREST 
// ---------------------------

// Fetch all POIs (Poinst of Interests)
export async function getPointsOfInterest() {
  try {
    return await db.select().from(pointsOfInterest);
  } catch (error) {
    console.error("Error fetching points of interest:", error);
  }
}

// Fetch a single POI by ID
export async function getPointOfInterestById(id: number) {
  try {
    return await db.select().from(pointsOfInterest).where(eq(pointsOfInterest.id, id));
  } catch (error) {
    console.error("Error fetching point of interest by ID:", error);
  }
}

// Fetch POIs by category
export async function getPointsOfInterestByCategoryId(categoryId: number) {
  try {
    return await db.select().from(pointsOfInterest).where(eq(pointsOfInterest.category_id, categoryId));
  } catch (error) {
    console.error("Error fetching points of interest by category:", error);
  }
}

// Fetch POIs by map ID
export async function getPointsOfInterestByMapId(mapId: number) {
  try {
    return await db.select().from(pointsOfInterest).where(eq(pointsOfInterest.map_id, mapId));
  } catch (error) {
    console.error("Error fetching points of interest by map ID:", error);
  }
}
// ---------------------------
// CREATE / UPDATE / DELETE
// ---------------------------

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
