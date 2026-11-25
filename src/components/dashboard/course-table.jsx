import Link from "next/link";
import { Eye, EyeOff, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { deleteCourseAction, toggleCourseActiveAction } from "@/actions/course-actions";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCoursePeriod } from "@/lib/utils/format";

/** Tabel course untuk Admin (/admin) dan Teacher (/teacher). */
export function CourseTable({ courses, basePath, showTeacher = false, extraActions }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course</TableHead>
            {showTeacher && <TableHead>Teacher</TableHead>}
            <TableHead>Periode</TableHead>
            <TableHead>Materi</TableHead>
            <TableHead>Student</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="min-w-56">
                <p className="font-medium">{course.title}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant="outline">{course.category_name}</Badge>
                  {!course.is_active && <Badge variant="secondary">Nonaktif</Badge>}
                </div>
              </TableCell>
              {showTeacher && <TableCell className="whitespace-nowrap">{course.teacher_name}</TableCell>}
              <TableCell className="text-xs whitespace-nowrap text-muted-foreground">{formatCoursePeriod(course.start_date, course.end_date)}</TableCell>
              <TableCell>{course.content_count}</TableCell>
              <TableCell>{course.student_count}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  {extraActions?.(course)}
                  <Button asChild variant="ghost" size="sm" aria-label={`Lihat ${course.title}`}>
                    <Link href={`/courses/${course.slug}`}><Eye /></Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`${basePath}/courses/${course.id}/edit`}><Pencil /> Edit</Link>
                  </Button>
                  {course.is_active ? (
                    <ConfirmActionButton
                      action={toggleCourseActiveAction.bind(null, course.id)}
                      title="Nonaktifkan course?"
                      description={`"${course.title}" akan disembunyikan dari katalog dan tidak menerima student baru. Materi, enrollment, dan progres tetap tersimpan, dan course bisa diaktifkan kembali kapan saja.`}
                      confirmLabel="Nonaktifkan"
                      variant="default"
                    >
                      <EyeOff /> Nonaktifkan
                    </ConfirmActionButton>
                  ) : (
                    <ConfirmActionButton
                      action={toggleCourseActiveAction.bind(null, course.id)}
                      title="Aktifkan kembali course?"
                      description={`"${course.title}" akan tampil lagi di katalog dan bisa diikuti student baru.`}
                      confirmLabel="Aktifkan"
                      variant="default"
                    >
                      <RotateCcw /> Aktifkan
                    </ConfirmActionButton>
                  )}
                  <ConfirmActionButton
                    action={deleteCourseAction.bind(null, course.id)}
                    title="Hapus course?"
                    description={`"${course.title}" beserta ${course.content_count} materi, ${course.student_count} enrollment, dan diskusinya akan dihapus permanen. Sertifikat yang sudah terbit tetap sah.`}
                    triggerClassName="text-destructive hover:text-destructive"
                  >
                    <Trash2 /> Hapus
                  </ConfirmActionButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
