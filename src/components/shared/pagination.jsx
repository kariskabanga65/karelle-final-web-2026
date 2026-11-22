import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Navigasi halaman. Parameter pencarian lain (search, role) tetap dibawa.
 */
export function Pagination({ page, totalPages, basePath, params = {} }) {
  if (totalPages <= 1) return null;

  const hrefFor = (target) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value && query.set(key, value));
    if (target > 1) query.set("page", String(target));
    const text = query.toString();
    return text ? `${basePath}?${text}` : basePath;
  };

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">Halaman {page} dari {totalPages}</p>
      <div className="flex items-center gap-1">
        <PageLink href={hrefFor(page - 1)} disabled={page <= 1} label="Halaman sebelumnya">
          <ChevronLeft className="size-4" />
        </PageLink>
        {pages.map((number) => (
          <PageLink key={number} href={hrefFor(number)} active={number === page} label={`Halaman ${number}`}>
            {number}
          </PageLink>
        ))}
        <PageLink href={hrefFor(page + 1)} disabled={page >= totalPages} label="Halaman berikutnya">
          <ChevronRight className="size-4" />
        </PageLink>
      </div>
    </nav>
  );
}

function PageLink({ href, disabled, active, label, children }) {
  const className = cn(
    "flex size-9 items-center justify-center rounded-md border text-sm",
    active ? "border-ink bg-ink text-white" : "bg-card hover:border-ink",
    disabled && "pointer-events-none opacity-40",
  );
  if (disabled) return <span className={className} aria-disabled="true" aria-label={label}>{children}</span>;
  return <Link href={href} className={className} aria-label={label} aria-current={active ? "page" : undefined}>{children}</Link>;
}
