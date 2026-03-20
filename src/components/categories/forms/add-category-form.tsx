"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createCategory } from "@/server/actions/categories";
import { CategoryInput, categorySchema } from "@/lib/validators/category";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import CategoryFormFields from "./category-form-fields";
import { useTranslations } from "next-intl";

export interface AddCategoryFormProps {
  onSuccess?: () => void;
}

export default function AddCategoryForm({ onSuccess }: AddCategoryFormProps) {
  const t = useTranslations("categories");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#000000",
      icon: null,
      display_type: "icon",
      is_active: true,
      is_map_level_default: false,
    },
  });

  async function onSubmit(values: CategoryInput) {
    try {
      setIsLoading(true);
      await createCategory(values);
      toast.success(t("createSuccess"));
      form.reset();
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(t("createError"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <CategoryFormFields form={form} />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("save")}
        </Button>
      </form>
    </Form>
  );
}
