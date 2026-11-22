import { createUserAction } from "@/actions/user-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { UserForm } from "@/components/forms/user-form";

export const metadata = { title: "Tambah User | Admin KARÉLLE" };

export default function NewUserPage() {
  return (
    <>
      <PageHeader eyebrow="User Management" title="Tambah user" description="Password otomatis di-hash dengan bcrypt sebelum disimpan." />
      <div className="max-w-3xl rounded-xl border bg-card p-6 shadow-xs">
        <UserForm action={createUserAction} />
      </div>
    </>
  );
}
