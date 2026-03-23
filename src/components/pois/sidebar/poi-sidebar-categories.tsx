"use client";

import { Category } from "@/server/db/schema";
import { PoiSidebarCategory } from "./poi-sidebar-category";

interface PoiSidebarCategoriesProps {
  categories: Category[];
  visibility: Record<number, boolean>;
  onVisibilityChange: (categoryId: number, visible: boolean) => void;
}

export function PoiSidebarCategories({
  categories,
  visibility,
  onVisibilityChange,
}: PoiSidebarCategoriesProps) {
  const activeCategories = categories.filter((c) => c.is_active);

  if (activeCategories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No categories available
      </p>
    );
  }

  return (
    <div className="p-2 space-y-1">
      {activeCategories.map((category) => {
        const isVisible = visibility[category.id] ?? category.is_map_level_default ?? true;

        return (
          <PoiSidebarCategory
            key={category.id}
            category={category}
            isVisible={isVisible}
            onToggle={() => onVisibilityChange(category.id, !isVisible)}
          />
        );
      })}
    </div>
  );
}
