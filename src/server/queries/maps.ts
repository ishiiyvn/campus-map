import { db } from "@/index";
import { maps } from "../db/schema";
import { eq } from "drizzle-orm";
import { stackServerApp } from "@/stack/server";

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

export async function getMapById(id: number) {
  try {
    const [map] = await db.select().from(maps).where(eq(maps.id, id));
    return map;
  } catch (error) {
    console.error("Error fetching map by ID:", error);
    return null;
  }
}

export async function getMapBySlug(slug: string) {
  try {
    const [map] = await db.select().from(maps).where(eq(maps.slug, slug));
    return map;
  } catch (error) {
    console.error("Error fetching map by slug:", error);
    return null;
  }
}
