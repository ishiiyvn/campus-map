"use client";

import { useState } from "react";
import { Category } from "@/server/db/schema";
import { getIconComponent } from "@/components/ui/icon-picker";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteCategory } from "@/server/actions/categories";
import { toast } from "sonner";
import EditCategoryForm from "./forms/edit-category-form";
import { useTranslations } from "next-intl";

function CategoryCard({ category }: { category: Category }) {
  const [open, setOpen] = useState(false);
  const IconComp = category.icon ? getIconComponent(category.icon) : null;
  const t = useTranslations("categories");

  async function handleDelete() {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      await deleteCategory(category.id!);
      toast.success(t("deleteSuccess"));
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error(t("deleteError"));
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow border flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center"
          style={{ backgroundColor: category.color ? `${category.color}20` : "#f3f4f6" }}
        >
          {IconComp ? (
            <div style={{ color: category.color || undefined }}>
              <IconComp className="w-5 h-5" />
            </div>
          ) : (
            <span className="text-sm font-medium">{category.name.charAt(0)}</span>
          )}
        </div>
        <div>
          <h3 className="font-medium">{category.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {category.description}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100">
              {category.display_type === "text" ? "Text" : "Icon"}
            </span>
            {category.is_map_level_default && (
              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                Default
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("editTitle")}</DialogTitle>
            </DialogHeader>
            <EditCategoryForm category={category} onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export function CategoriesList({ categories }: { categories: Category[] }) {
  if (!categories || categories.length === 0) {
    return <p className="text-muted-foreground">No categories found. Create one above.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
