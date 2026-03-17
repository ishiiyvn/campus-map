"use server"

import { db } from "@/index";
import { categories } from "../db/schema";
import { eq } from "drizzle-orm";
import { categorySchema } from "@/lib/validators";

export async function createCategory(data: unknown) {
  try {
    // Validate incoming data
    const validatedData = categorySchema.parse(data);
    const [newCategory] = await db
      .insert(categories)
      .values(validatedData)
      .returning();

    return newCategory;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}


export async function updateCategory(id: number, data: unknown) {
  try {
    const validadtedData = categorySchema.parse(data);
    const [updatedCategory] = await db
      .update(categories)
      .set(validadtedData)
      .where(eq(categories.id, id))
      .returning();

    return updatedCategory;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
}


export async function deleteCategory(id: number) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}
