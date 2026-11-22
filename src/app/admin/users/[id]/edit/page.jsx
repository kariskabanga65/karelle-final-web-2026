import { notFound } from "next/navigation";
import { updateUserAction } from "@/actions/user-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { UserForm } from "@/components/forms/user-form";
import { getLatestTeacherApplication } from "@/lib/db/queries/teacher-applications";
import { getUserById } from "@/lib/db/queries/users";

export const metadata = { title: "Edit User | Admin KARÉLLE" };

export default async function EditUserPage({ params }) {
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) notFound();
  const application = await getLatestTeacherApplication(user.id);

  return (
    <>
      <PageHeader eyebrow="User Management" title={`Edit ${user.name}`} description={`@${user.username}`} />
      {application?.status === "pending" && (
        <p className="max-w-3xl rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
          User ini mengajukan diri sebagai Teacher ({application.expertise}). Mengubah role menjadi Teacher akan sekaligus menyetujui pengajuannya.
        </p>
      )}
      <div className="max-w-3xl rounded-xl border bg-card p-6 shadow-xs">
        <UserForm action={updateUserAction.bind(null, user.id)} user={user} />
      </div>
    </>
  );
}
