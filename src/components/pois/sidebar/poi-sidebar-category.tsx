"use client";

import { Eye, EyeOff } from "lucide-react";
import { Category } from "@/server/db/schema";
import { getIconComponent } from "@/components/ui/icon-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PoiSidebarCategoryProps {
  category: Category;
  isVisible: boolean;
  onToggle: () => void;
}

export function PoiSidebarCategory({
  category,
  isVisible,
  onToggle,
}: PoiSidebarCategoryProps) {
  const IconComponent = category.icon ? getIconComponent(category.icon) : null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "w-full justify-start gap-2 h-9",
        isVisible && "bg-accent"
      )}
      onClick={onToggle}
    >
      <div
        className={cn(
          "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0",
          category.color ? "" : "bg-accent"
        )}
        style={
          category.color
            ? { backgroundColor: category.color + "20" }
            : undefined
        }
      >
        {IconComponent ? (
          <div style={category.color ? { color: category.color } : undefined}>
            <IconComponent className="w-4 h-4" />
          </div>
        ) : (
          <span className="text-xs font-medium">
            {category.name.charAt(0)}
          </span>
        )}
      </div>
      <span className="flex-1 truncate text-sm">
        {category.name}
      </span>
      {isVisible ? (
        <Eye className="w-4 h-4 text-muted-foreground" />
      ) : (
        <EyeOff className="w-4 h-4 text-muted-foreground" />
      )}
    </Button>
  );
}
