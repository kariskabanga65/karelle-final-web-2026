import { createUserAction } from "@/actions/user-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { UserForm } from "@/components/forms/user-form";
import { getAllCategories } from "@/lib/db/queries/categories";

export const metadata = { title: "Tambah User | Admin KARÉLLE" };

export default async function NewUserPage() {
  // Kategori menjadi pilihan "Bidang keahlian" saat role Teacher dipilih.
  const categories = await getAllCategories();

  return (
    <>
      <PageHeader
        eyebrow="User Management"
        title="Tambah user"
        description="Password otomatis di-hash dengan bcrypt. Role Teacher mengisi data yang sama seperti form register Teacher."
      />
      <div className="max-w-3xl rounded-xl border bg-card p-6 shadow-xs">
        <UserForm action={createUserAction} categories={categories} />
      </div>
    </>
  );
}
