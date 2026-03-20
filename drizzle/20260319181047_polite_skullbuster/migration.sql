CREATE TABLE "areas" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "areas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"map_id" integer NOT NULL,
	"layer_id" integer,
	"parent_area_id" integer,
	"name" varchar(255) NOT NULL,
	"code" varchar(100) NOT NULL UNIQUE,
	"fill_color" varchar(7),
	"stroke_color" varchar(7),
	"description" varchar(1024),
	"polygon_coordinates" jsonb NOT NULL,
	"area_size" double precision,
	"is_visible" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"properties" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL UNIQUE,
	"description" varchar(1024) NOT NULL,
	"color" varchar(7),
	"icon" varchar(100),
	"display_type" varchar(10) DEFAULT 'icon' NOT NULL,
	"parent_category_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_map_level_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "layers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "layers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"map_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(50) UNIQUE,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"fill_color" varchar(7),
	"stroke_color" varchar(7),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "levels_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"area_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maps" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "maps_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"owner_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"description" varchar(1024) NOT NULL,
	"map_image_url" varchar(2048) NOT NULL,
	"map_width" integer NOT NULL,
	"map_height" integer NOT NULL,
	"viewport_config" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poi_levels" (
	"poi_id" integer NOT NULL,
	"level_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "points_of_interest" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "points_of_interest_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"map_id" integer NOT NULL,
	"area_id" integer,
	"name" varchar(255) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"category_id" integer NOT NULL,
	"x_coordinate" double precision NOT NULL,
	"y_coordinate" double precision NOT NULL,
	"icon" varchar(100),
	"icon_color" varchar(7),
	"is_visible" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"stack_user_id" varchar(255) PRIMARY KEY,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "areas" ADD CONSTRAINT "areas_map_id_maps_id_fkey" FOREIGN KEY ("map_id") REFERENCES "maps"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "areas" ADD CONSTRAINT "areas_layer_id_layers_id_fkey" FOREIGN KEY ("layer_id") REFERENCES "layers"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "areas" ADD CONSTRAINT "areas_parent_area_id_areas_id_fkey" FOREIGN KEY ("parent_area_id") REFERENCES "areas"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_category_id_categories_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "layers" ADD CONSTRAINT "layers_map_id_maps_id_fkey" FOREIGN KEY ("map_id") REFERENCES "maps"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "levels" ADD CONSTRAINT "levels_area_id_areas_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "maps" ADD CONSTRAINT "maps_owner_id_profiles_stack_user_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profiles"("stack_user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "poi_levels" ADD CONSTRAINT "poi_levels_poi_id_points_of_interest_id_fkey" FOREIGN KEY ("poi_id") REFERENCES "points_of_interest"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "poi_levels" ADD CONSTRAINT "poi_levels_level_id_levels_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "points_of_interest" ADD CONSTRAINT "points_of_interest_map_id_maps_id_fkey" FOREIGN KEY ("map_id") REFERENCES "maps"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "points_of_interest" ADD CONSTRAINT "points_of_interest_area_id_areas_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "points_of_interest" ADD CONSTRAINT "points_of_interest_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT;