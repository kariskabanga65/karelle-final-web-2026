import { notFound } from "next/navigation";
import { updateCategoryAction } from "@/actions/category-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { CategoryForm } from "@/components/forms/category-form";
import { getCategoryById } from "@/lib/db/queries/manage-courses";
import { isUuid } from "@/lib/utils/slug";

export const metadata = { title: "Edit Kategori | Admin KARÉLLE" };

export default async function EditCategoryPage({ params }) {
  const { id } = await params;
  const category = isUuid(id) ? await getCategoryById(id) : null;
  if (!category) notFound();

  return (
    <>
      <PageHeader eyebrow="Category Management" title={`Edit ${category.name}`} description={`Dipakai oleh ${category.course_count} course.`} />
      <div className="max-w-xl rounded-xl border bg-card p-6 shadow-xs">
        <CategoryForm action={updateCategoryAction.bind(null, category.id)} category={category} />
      </div>
    </>
  );
}
