"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { Category } from "@/server/db/schema";
import { updateCategory, deleteCategory } from "@/server/actions/categories";
import { CategoryInput, categorySchema } from "@/lib/validators/category";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import CategoryFormFields from "./category-form-fields";
import { useTranslations } from "next-intl";

interface EditCategoryFormProps {
  category: Category;
  onSuccess?: () => void;
}

export default function EditCategoryForm({ category, onSuccess }: EditCategoryFormProps) {
  const t = useTranslations("categories");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      display_type: (category.display_type as "icon" | "text") || "icon",
      is_active: category.is_active,
      is_map_level_default: category.is_map_level_default,
    },
  });

  useEffect(() => {
    form.reset({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      display_type: (category.display_type as "icon" | "text") || "icon",
      is_active: category.is_active,
      is_map_level_default: category.is_map_level_default,
    });
  }, [category, form]);

  async function onSubmit(values: CategoryInput) {
    try {
      setIsLoading(true);
      await updateCategory(category.id!, values);
      toast.success(t("updateSuccess"));
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(t("updateError"));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(t("deleteConfirm"))) return;

    try {
      setIsDeleting(true);
      await deleteCategory(category.id!);
      toast.success(t("deleteSuccess"));
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(t("deleteError"));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <CategoryFormFields form={form} />

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={isLoading || isDeleting}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("save")}
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            disabled={isLoading || isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}
