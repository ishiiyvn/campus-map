import { AnyPgColumn, boolean, doublePrecision, integer, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

// App-side profiles keyed by Stack user ID for authorization
export const profiles = pgTable("profiles", {
  stack_user_id: varchar({ length: 255 }).primaryKey(),
  is_admin: boolean().notNull().default(false),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),
});

// Main map configurations
export const maps = pgTable("maps", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  owner_id: varchar({ length: 255 }).notNull().references(() => profiles.stack_user_id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 255 }).notNull().unique(),
  description: varchar({ length: 1024 }).notNull(),
  map_image_url: varchar({ length: 2048 }).notNull(), // Background 2D plan image
  map_width: integer().notNull(), // Original image width in pixels
  map_height: integer().notNull(), // Original image height in pixels
  viewport_config: jsonb().notNull(), // Default zoom, center point, etc.
  is_active: boolean().notNull().default(true),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),
});

export type Map = typeof maps.$inferSelect;

// Points of Interest (POIs) on the map (atm, cafe, bathroom, offices, etc.)
export const pointsOfInterest = pgTable("points_of_interest", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  map_id: integer().notNull().references(() => maps.id, { onDelete: "cascade" }),
  area_id: integer().references(() => areas.id, { onDelete: "set null" }), // Optional if inside an area
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 1024 }).notNull(),

  category_id: integer().notNull().references(() => categories.id, { onDelete: "restrict" }), // Mandatory categorization

  // Exact coordinates on the map
  x_coordinate: doublePrecision().notNull(),
  y_coordinate: doublePrecision().notNull(),

  // Display and color settings
  icon: varchar({ length: 100 }), // Icon identifier for frontend
  icon_color: varchar({ length: 7 }), // Hex color code
  is_visible: boolean().notNull().default(true),
  display_order: integer().notNull().default(0),

  // Flexible properties
  //  properties: jsonb(),

  is_active: boolean().notNull().default(true),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),
});

export type PointOfInterest = typeof pointsOfInterest.$inferSelect;

// Abstract areas - can be buildings, rooms, parking, green areas, etc.
export const areas = pgTable("areas", {

  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  map_id: integer().notNull().references(() => maps.id, { onDelete: "cascade" }),
  category_id: integer().references(() => categories.id, { onDelete: "set null" }), // Optional categorization

  parent_area_id: integer().references((): AnyPgColumn => areas.id, { onDelete: "set null" }),

  // Basic info
  name: varchar({ length: 255 }).notNull(),
  code: varchar({ length: 100 }).notNull().unique(),
  description: varchar({ length: 1024 }),

  // Geometric data
  polygon_coordinates: jsonb().notNull(),
  area_size: doublePrecision(), // square meters(optional)

  // Display and color settings
  fill_color: varchar({ length: 7 }),
  stroke_color: varchar({ length: 7 }),
  is_visible: boolean().notNull().default(true),
  display_order: integer().notNull().default(0),

  // Generic properties (flexible JSON storage)
  properties: jsonb(),

  // Administrative
  is_active: boolean().notNull().default(true),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),
});

export type Area = typeof areas.$inferSelect;

//export const areasIndexes = { mapIdIdx: index("areas_map_id_idx").on(areas.map_id),
//  parentAreaIdIdx: index("areas_parent_area_id_idx").on(areas.parent_area_id),
//  typeIdx: index("areas_type_idx").on(areas.type),
//  mapCodeIdx: uniqueIndex("areas_map_id_code_idx").on(areas.map_id, areas.code),
//};

export const categories = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  description: varchar({ length: 1024 }).notNull(),
  //type: varchar({ length: 50 }).notNull(),
  color: varchar({ length: 7 }),
  icon: varchar({ length: 100 }),
  parent_category_id: integer().references((): AnyPgColumn => categories.id, { onDelete: "set null" }),
  is_active: boolean().notNull().default(true),
  created_at: timestamp().defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
