import { db } from "@/index";
import { categories } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getCategories() {
  try {
    return await db.select().from(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

export async function getCategoryById(id: number) {
  try {
    return await db.select().from(categories).where(eq(categories.id, id));
  } catch (error) {
    console.error("Error fetching category by ID:", error);
  }
}
