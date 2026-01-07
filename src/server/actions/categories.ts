"use server"

import { db } from "@/index";
import { categories } from "../db/schema";
import { eq } from "drizzle-orm";
import { categorySchema } from "@/lib/validators";

// ---------------------------
// FETCH CATEGORIES 
// ---------------------------


// Fetch all categories
export async function getCategories() {
  try {
    return await db.select().from(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}


// Fetch a single category by ID
export async function getCategoryById(id: number) {
  try {
    return await db.select().from(categories).where(eq(categories.id, id));
  } catch (error) {
    console.error("Error fetching category by ID:", error);
  }
}

// ---------------------------
// CREATE / UPDATE / DELETE
// ---------------------------

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
