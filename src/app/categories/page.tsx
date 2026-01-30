import AddCategoryForm from "@/components/categories/add-category-form";

export default function CategoriesPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>
      <div className="bg-white p-6 rounded-lg shadow max-w-md">
         <h2 className="text-xl mb-4">Add New Category</h2>
         <AddCategoryForm />
      </div>
    </div>
  );
}
