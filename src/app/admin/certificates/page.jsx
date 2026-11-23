import Link from "next/link";
import { Award, ExternalLink, Eye, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAllCertificates } from "@/lib/db/queries/certificates";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Sertifikat | Admin KARÉLLE" };

export default async function AdminCertificatesPage({ searchParams }) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const page = Math.max(1, Number.parseInt(params.page, 10) || 1);
  const { rows, total, perPage } = await listAllCertificates({ search, page });
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <>
      <PageHeader eyebrow="Certificates" title="Sertifikat" description={`${total} sertifikat telah diterbitkan untuk student yang menyelesaikan 100% materi.`} />
      <form method="get" role="search" className="flex max-w-xl gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="search" type="search" defaultValue={search} placeholder="Cari nama student, course, atau nomor" aria-label="Cari sertifikat" className="pl-10" />
        </div>
        <Button type="submit" className="h-11">Cari</Button>
      </form>

      {rows.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Terbit</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.certificate_number}</TableCell>
                    <TableCell className="font-medium">{row.student_name}</TableCell>
                    <TableCell>
                      {row.course_title}
                      <p className="text-xs text-muted-foreground">oleh {row.teacher_name}</p>
                    </TableCell>
                    <TableCell>{formatDate(row.issued_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="sm"><Link href={`/student/certificates/${row.id}`}><Eye /> Lihat</Link></Button>
                        <Button asChild variant="ghost" size="sm"><Link href={`/certificates/verify/${row.certificate_number}`} target="_blank"><ExternalLink /> Verifikasi</Link></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} basePath="/admin/certificates" params={{ search }} />
        </>
      ) : (
        <EmptyState icon={Award} title={search ? "Sertifikat tidak ditemukan" : "Belum ada sertifikat"} description={search ? "Ubah kata kunci pencarian." : "Sertifikat muncul di sini saat student menyelesaikan course."} />
      )}
    </>
  );
}
