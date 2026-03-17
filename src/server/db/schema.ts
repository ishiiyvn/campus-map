import { AnyPgColumn, boolean, doublePrecision, integer, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  stack_user_id: varchar({ length: 255 }).primaryKey(),
  is_admin: boolean().notNull().default(false),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  description: varchar({ length: 1024 }).notNull(),
  color: varchar({ length: 7 }),
  icon: varchar({ length: 100 }),
  parent_category_id: integer().references((): AnyPgColumn => categories.id, { onDelete: "set null" }),
  is_active: boolean().notNull().default(true),
  created_at: timestamp().defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;

export const layers = pgTable("layers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  map_id: integer().notNull().references(() => maps.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 50 }).unique(),
  display_order: integer().notNull().default(0),
  is_visible: boolean().notNull().default(true),
  fill_color: varchar({ length: 7 }),
  stroke_color: varchar({ length: 7 }),
  created_at: timestamp().defaultNow().notNull(),
});

export type Layer = typeof layers.$inferSelect;

export const maps = pgTable("maps", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  owner_id: varchar({ length: 255 }).notNull().references(() => profiles.stack_user_id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 255 }).notNull().unique(),
  description: varchar({ length: 1024 }).notNull(),
  map_image_url: varchar({ length: 2048 }).notNull(),
  map_width: integer().notNull(),
  map_height: integer().notNull(),
  viewport_config: jsonb().notNull(),
  is_active: boolean().notNull().default(true),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),
});

export type Map = typeof maps.$inferSelect;

export const areas = pgTable("areas", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  map_id: integer().notNull().references(() => maps.id, { onDelete: "cascade" }),
  layer_id: integer().references(() => layers.id, { onDelete: "set null" }),
  parent_area_id: integer().references((): AnyPgColumn => areas.id, { onDelete: "set null" }),
  name: varchar({ length: 255 }).notNull(),
  code: varchar({ length: 100 }).notNull().unique(),
  fill_color: varchar({ length: 7 }),
  stroke_color: varchar({ length: 7 }),
  description: varchar({ length: 1024 }),
  polygon_coordinates: jsonb().notNull(),
  area_size: doublePrecision(),
  is_visible: boolean().notNull().default(true),
  display_order: integer().notNull().default(0),
  properties: jsonb(),
  is_active: boolean().notNull().default(true),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),
});

export type Area = typeof areas.$inferSelect;

export const pointsOfInterest = pgTable("points_of_interest", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  map_id: integer().notNull().references(() => maps.id, { onDelete: "cascade" }),
  area_id: integer().references(() => areas.id, { onDelete: "set null" }),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 1024 }).notNull(),
  category_id: integer().notNull().references(() => categories.id, { onDelete: "restrict" }),
  x_coordinate: doublePrecision().notNull(),
  y_coordinate: doublePrecision().notNull(),
  icon: varchar({ length: 100 }),
  icon_color: varchar({ length: 7 }),
  is_visible: boolean().notNull().default(true),
  display_order: integer().notNull().default(0),
  is_active: boolean().notNull().default(true),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),
});

export type PointOfInterest = typeof pointsOfInterest.$inferSelect;
