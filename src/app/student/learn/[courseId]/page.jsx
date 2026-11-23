import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getLessonOutline, pickContinueLesson } from "@/lib/db/queries/learning";
import { getLearnerContext } from "@/lib/learning/access";

export const metadata = { title: "Belajar | KARÉLLE" };


export default async function LearnCoursePage({ params }) {
  const user = await requireRole(ROLES.STUDENT);
  const { courseId } = await params;
  const { course, enrollment } = await getLearnerContext(user.id, user.role, courseId);
  const outline = await getLessonOutline(course.id, enrollment?.id ?? null);
  const target = pickContinueLesson(outline, enrollment?.last_content_id ?? null);

  if (target) redirect(`/student/learn/${course.id}/${target.id}`);

  return (
    <EmptyState icon={FileText} title="Materi belum tersedia" description="Teacher belum menambahkan materi untuk course ini. Silakan cek kembali nanti.">
      <Button asChild variant="outline"><Link href="/student/courses">Kembali ke Kelas Saya</Link></Button>
    </EmptyState>
  );
}
