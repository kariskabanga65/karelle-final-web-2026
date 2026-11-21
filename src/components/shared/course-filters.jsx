import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

/**
 * Form pencarian + filter kategori.
 * Memakai form GET biasa: hasil pencarian ada di URL (?search=&category=)
 * sehingga bisa dibagikan dan tetap berfungsi tanpa JavaScript.
 */
export function CourseFilters({ categories, search = "", activeCategory = "", action = "/courses" }) {
  const categoryHref = (slug) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (slug) params.set("category", slug);
    const query = params.toString();
    return query ? `${action}?${query}` : action;
  };

  return (
    <div className="space-y-5">
      <form action={action} method="get" role="search" className="flex gap-2">
        {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            type="search"
            defaultValue={search}
            placeholder="Cari course, topik, atau instruktur..."
            aria-label="Cari course"
            className="pl-10"
            maxLength={100}
          />
        </div>
        <Button type="submit" size="lg" className="h-11">Cari</Button>
      </form>
      <nav aria-label="Filter kategori" className="flex flex-wrap gap-2">
        <FilterChip href={categoryHref("")} active={!activeCategory}>Semua</FilterChip>
        {categories.map((category) => (
          <FilterChip key={category.slug} href={categoryHref(category.slug)} active={activeCategory === category.slug}>
            {category.name}
          </FilterChip>
        ))}
      </nav>
    </div>
  );
}

function FilterChip({ href, active, children }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition-colors",
        active ? "border-ink bg-ink text-white" : "border-border bg-card hover:border-ink",
      )}
    >
      {children}
    </Link>
  );
}
