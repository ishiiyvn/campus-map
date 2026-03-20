import { getCategories } from "@/server/queries/categories";
import { CategoriesList } from "@/components/categories/categories-list";
import { AddCategoryButton } from "@/components/categories/buttons/add-category-button";
import { getTranslations } from "next-intl/server";

export default async function CategoriesPage() {
  const categories = await getCategories();
  const t = await getTranslations("sidebar");

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("categories")}</h1>
        <AddCategoryButton />
      </div>
      <CategoriesList categories={categories || []} />
    </div>
  );
}
