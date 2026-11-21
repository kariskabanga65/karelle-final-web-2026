import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-5 py-16 sm:px-8" aria-busy="true" aria-label="Memuat course">
      <Skeleton className="h-16 w-2/3" />
      <Skeleton className="h-11 w-full" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-[420px] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
