import Link from "next/link";
import { notFound } from "next/navigation";
import { updateUserAction } from "@/actions/user-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { UserForm } from "@/components/forms/user-form";
import { getAllCategories } from "@/lib/db/queries/categories";
import { getLatestTeacherApplication } from "@/lib/db/queries/teacher-applications";
import { getUserById } from "@/lib/db/queries/users";

export const metadata = { title: "Edit User | Admin KARÉLLE" };

export default async function EditUserPage({ params }) {
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) notFound();
  const [application, categories] = await Promise.all([getLatestTeacherApplication(user.id), getAllCategories()]);
  const pendingApplication = application?.status === "pending" ? application : null;

  return (
    <>
      <PageHeader eyebrow="User Management" title={`Edit ${user.name}`} description={`@${user.username}`} />
      {application?.status === "pending" && (
        <p className="max-w-3xl rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
          User ini mengajukan diri sebagai Teacher ({application.expertise}). Ubah role menjadi Teacher untuk menyetujuinya (data pengajuannya sudah terisi), atau proses lewat menu{" "}
          <Link href="/admin/teacher-applications" className="font-medium underline underline-offset-4">
            Pengajuan Teacher
          </Link>
          .
        </p>
      )}
      <div className="max-w-3xl rounded-xl border bg-card p-6 shadow-xs">
        <UserForm action={updateUserAction.bind(null, user.id)} user={user} categories={categories} application={pendingApplication} />
      </div>
    </>
  );
}
