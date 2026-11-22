import Link from "next/link";
import { GraduationCap, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getTeacherCourseOptions, listStudentProgress } from "@/lib/db/queries/teacher-dashboard";
import { formatDate, formatPercent, formatRelative, getInitials } from "@/lib/utils/format";
import { isUuid } from "@/lib/utils/slug";

export const metadata = { title: "Progress Student | Teacher KARÉLLE" };

export default async function TeacherStudentsPage({ searchParams }) {
  const user = await requireRole(ROLES.TEACHER);
  const teacherId = user.role === ROLES.ADMIN ? null : user.id;
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const status = ["active", "completed"].includes(params.status) ? params.status : "";
  const page = Math.max(1, Number.parseInt(params.page, 10) || 1);

  const courses = await getTeacherCourseOptions(teacherId);
  // Filter course hanya diterima jika course itu memang milik Teacher.
  const courseId = isUuid(params.course) && courses.some((c) => c.id === params.course) ? params.course : "";

  const { rows, total, perPage } = await listStudentProgress({ teacherId, courseId: courseId || null, search, status, page });
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const filtered = Boolean(search || status || courseId);

  return (
    <>
      <PageHeader eyebrow="Student Progress" title="Progress student" description={`${total} enrollment${filtered ? " sesuai filter" : " di course Anda"}. Progress dihitung otomatis dari materi yang ditandai selesai.`} />

      <form method="get" role="search" className="grid gap-3 rounded-xl border bg-card p-4 shadow-xs md:grid-cols-[1fr_14rem_10rem_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="search" type="search" defaultValue={search} placeholder="Cari nama, username, atau email" aria-label="Cari student" className="pl-10" />
        </div>
        <NativeSelect name="course" defaultValue={courseId} aria-label="Filter course">
          <option value="">Semua course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </NativeSelect>
        <NativeSelect name="status" defaultValue={status} aria-label="Filter status">
          <option value="">Semua status</option>
          <option value="active">Sedang belajar</option>
          <option value="completed">Selesai 100%</option>
        </NativeSelect>
        <div className="flex gap-2">
          <Button type="submit" className="h-11 flex-1">Terapkan</Button>
          {filtered && <Button asChild variant="ghost" className="h-11"><Link href="/teacher/students">Reset</Link></Button>}
        </div>
      </form>

      {rows.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="min-w-48">Progress</TableHead>
                  <TableHead>Materi terakhir</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.enrollment_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          {row.image && <AvatarImage src={row.image} alt="" className="grayscale" />}
                          <AvatarFallback className="bg-ink text-xs text-white">{getInitials(row.student_name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium">{row.student_name}</p>
                          <p className="truncate text-xs text-muted-foreground">@{row.username} · {row.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-40">
                      <Link href={`/courses/${row.course_slug}`} className="underline-offset-4 hover:underline">{row.course_title}</Link>
                      <p className="text-xs text-muted-foreground">Bergabung {formatDate(row.enrolled_at)}</p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium">{formatPercent(row.progress_percent)}</span>
                          <span className="text-muted-foreground">{row.completed_lessons}/{row.total_lessons} materi</span>
                        </div>
                        <Progress value={Number(row.progress_percent)} aria-label={`Progress ${row.student_name} di ${row.course_title}`} />
                      </div>
                    </TableCell>
                    <TableCell className="min-w-40 text-sm">
                      {row.last_lesson_title ?? <span className="text-muted-foreground">Belum mulai</span>}
                      {row.last_activity_at && <p className="text-xs text-muted-foreground">{formatRelative(row.last_activity_at)}</p>}
                    </TableCell>
                    <TableCell>
                      {row.status === "completed" ? (
                        <Badge variant="success">Selesai</Badge>
                      ) : Number(row.progress_percent) > 0 ? (
                        <Badge variant="outline">Sedang belajar</Badge>
                      ) : (
                        <Badge variant="warning">Belum mulai</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} basePath="/teacher/students" params={{ search, course: courseId, status }} />
        </>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title={filtered ? "Tidak ada student sesuai filter" : "Belum ada student"}
          description={filtered ? "Ubah kata kunci atau filter." : "Student yang mengikuti course Anda akan muncul di sini beserta progresnya."}
        />
      )}
    </>
  );
}
