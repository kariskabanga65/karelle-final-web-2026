import Link from "next/link";
import { FolderTree, Pencil, Trash2 } from "lucide-react";
import { createCategoryAction, deleteCategoryAction } from "@/actions/category-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { CategoryForm } from "@/components/forms/category-form";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashToast } from "@/components/shared/flash-toast";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";
import { getCategoriesWithCourseCount } from "@/lib/db/queries/courses";

export const metadata = { title: "Kategori | Admin KARÉLLE" };

export default async function AdminCategoriesPage({ searchParams }) {
  await requireRole(ROLES.ADMIN);
  const { success } = await searchParams;
  const categories = await getCategoriesWithCourseCount();

  return (
    <>
      <FlashToast message={success === "updated" ? "Kategori diperbarui." : null} />
      <PageHeader eyebrow="Category Management" title="Kategori" description="Kategori menjadi pilihan dropdown saat membuat course." />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        {categories.length > 0 ? (
          <div className="overflow-hidden rounded-xl border bg-card shadow-xs lg:self-start">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <p className="font-medium">{category.name}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{category.description || `/${category.slug}`}</p>
                    </TableCell>
                    <TableCell>{category.course_count}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/categories/${category.id}/edit`}><Pencil /> Edit</Link>
                        </Button>
                        <ConfirmActionButton
                          action={deleteCategoryAction.bind(null, category.id)}
                          title="Hapus kategori?"
                          description={
                            category.course_count > 0
                              ? `Kategori "${category.name}" masih dipakai ${category.course_count} course, sehingga tidak dapat dihapus. Pindahkan course ke kategori lain terlebih dahulu.`
                              : `Kategori "${category.name}" akan dihapus permanen.`
                          }
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
        ) : (
          <EmptyState icon={FolderTree} title="Belum ada kategori" description="Tambahkan kategori pertama lewat form di samping." />
        )}

        <section aria-labelledby="new-category" className="space-y-4 rounded-xl border bg-card p-6 shadow-xs lg:self-start">
          <h2 id="new-category" className="font-display text-2xl">Tambah kategori</h2>
          <CategoryForm action={createCategoryAction} />
        </section>
      </div>
    </>
  );
}
