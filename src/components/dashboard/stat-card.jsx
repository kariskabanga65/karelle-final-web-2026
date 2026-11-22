import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function StatCard({ label, value, icon: Icon, href, highlight = false }) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <p className={cn("text-sm", highlight ? "text-white/70" : "text-muted-foreground")}>{label}</p>
        {Icon && <Icon className="size-5 stroke-[1.4]" aria-hidden />}
      </div>
      <p className="font-display text-5xl leading-none">{value}</p>
    </>
  );
  const className = cn(
    "flex flex-col gap-5 rounded-xl border p-5 shadow-xs transition-shadow",
    highlight ? "border-ink bg-ink text-white" : "bg-card",
    href && "hover:shadow-md",
  );
  return href ? <Link href={href} className={className}>{content}</Link> : <div className={className}>{content}</div>;
}
