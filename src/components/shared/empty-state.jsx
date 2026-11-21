import { SearchX } from "lucide-react";

export function EmptyState({ icon: Icon = SearchX, title, description, children }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
      <Icon className="size-10 stroke-[1.2] text-muted-foreground" aria-hidden />
      <h3 className="font-display text-2xl">{title}</h3>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
