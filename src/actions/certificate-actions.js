"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorizeAction } from "@/lib/auth/action-guard";
import { ROLES } from "@/lib/auth/roles";
import { issueCertificate } from "@/lib/certificates/issue";
import { withTransaction } from "@/lib/db";
import { getDbErrorMessage } from "@/lib/db/errors";
import { actionError } from "@/lib/utils/action-result";
import { isUuid } from "@/lib/utils/slug";


export async function claimCertificateAction(courseId) {
  const { user, error } = await authorizeAction([ROLES.STUDENT]);
  if (error) return error;
  if (user.role !== ROLES.STUDENT) return actionError("Hanya Student yang dapat menerbitkan sertifikat.");
  if (!isUuid(courseId)) return actionError("Course tidak ditemukan.");

  let certificate;
  try {
    certificate = await withTransaction((client) => issueCertificate(client, { studentId: user.id, courseId }));
  } catch (err) {
    return actionError(getDbErrorMessage(err, "Gagal menerbitkan sertifikat."));
  }
  if (!certificate) return actionError("Sertifikat hanya dapat diterbitkan jika progress course mencapai 100%.");

  revalidatePath("/student/certificates");
  revalidatePath("/student");
  redirect(`/student/certificates/${certificate.id}?issued=1`);
}
