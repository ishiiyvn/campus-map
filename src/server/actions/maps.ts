"use server"

import { db } from "@/index";
import { maps } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { mapSchema } from "@/lib/validators/map";
import { stackServerApp, ensureProfile } from "@/stack/server";
import slugify from "slugify";

// ---------------------------
// FETCH MAPS
// ---------------------------


// Fetch all maps (only owned by current user)
export async function getMaps() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) return [];

    return await db.select().from(maps).where(eq(maps.owner_id, user.id));
  } catch (error) {
    console.error("Error fetching maps:", error);
    return [];
  }
}


// Fetch a single map by ID (public access allowed)
export async function getMapById(id: number) {
  try {
    const [map] = await db.select().from(maps).where(eq(maps.id, id));
    return map;
  } catch (error) {
    console.error("Error fetching map by ID:", error);
    return null;
  }
}

// Fetch a single map by Slug (public access allowed)
export async function getMapBySlug(slug: string) {
  try {
    const [map] = await db.select().from(maps).where(eq(maps.slug, slug));
    return map;
  } catch (error) {
    console.error("Error fetching map by slug:", error);
    return null;
  }
}

// ---------------------------
// CREATE / UPDATE / DELETE
// ---------------------------

export async function createMap(data: unknown) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) throw new Error("Unauthorized");

    // Ensure user profile exists in our DB before linking map
    await ensureProfile();

    // Validate incoming data
    const validatedData = mapSchema.parse(data);
    
    // Generate slug from name if not provided
    const slug = validatedData.slug || slugify(validatedData.name, { lower: true, strict: true });
    
    // Ensure slug is unique (basic check - could be improved with retry logic)
    const existing = await db.select().from(maps).where(eq(maps.slug, slug));
    if (existing.length > 0) {
      throw new Error("Map with this name already exists. Please choose a different name.");
    }

    const [newMap] = await db
      .insert(maps)
      .values({
        ...validatedData,
        owner_id: user.id,
        slug: slug,
      })
      .returning();

    return newMap;
  } catch (error) {
    console.error("Error creating map:", error);
    throw error;
  }
}


export async function updateMap(id: number, data: unknown) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) throw new Error("Unauthorized");

    const validatedData = mapSchema.parse(data);
    
    // Check ownership
    const [existingMap] = await db.select().from(maps).where(and(eq(maps.id, id), eq(maps.owner_id, user.id)));
    if (!existingMap) throw new Error("Map not found or unauthorized");

    const [updatedMap] = await db
      .update(maps)
      .set(validatedData)
      .where(eq(maps.id, id))
      .returning();

    return updatedMap;
  } catch (error) {
    console.error("Error updating map:", error);
    throw error;
  }
}


export async function deleteMap(id: number) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check ownership before delete
    const [existingMap] = await db.select().from(maps).where(and(eq(maps.id, id), eq(maps.owner_id, user.id)));
    if (!existingMap) throw new Error("Map not found or unauthorized");

    await db.delete(maps).where(eq(maps.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting map:", error);
    throw error;
  }
}
