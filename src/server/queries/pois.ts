import { db } from "@/index";
import { pointsOfInterest } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getPointsOfInterest() {
  try {
    return await db.select().from(pointsOfInterest);
  } catch (error) {
    console.error("Error fetching points of interest:", error);
  }
}

export async function getPointOfInterestById(id: number) {
  try {
    return await db.select().from(pointsOfInterest).where(eq(pointsOfInterest.id, id));
  } catch (error) {
    console.error("Error fetching point of interest by ID:", error);
  }
}

export async function getPointsOfInterestByCategoryId(categoryId: number) {
  try {
    return await db.select().from(pointsOfInterest).where(eq(pointsOfInterest.category_id, categoryId));
  } catch (error) {
    console.error("Error fetching points of interest by category:", error);
  }
}

export async function getPointsOfInterestByMapId(mapId: number) {
  try {
    return await db.select().from(pointsOfInterest).where(eq(pointsOfInterest.map_id, mapId));
  } catch (error) {
    console.error("Error fetching points of interest by map ID:", error);
  }
}
