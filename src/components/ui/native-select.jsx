import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Select bawaan browser bergaya shadcn — aman untuk form Server Action. */
function NativeSelect({ className, children, ...props }) {
  return (
    <div className="relative">
      <select
        data-slot="native-select"
        className={cn(
          "h-11 w-full appearance-none rounded-md border border-input bg-white py-2 pr-10 pl-3.5 text-[0.95rem] shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15 disabled:opacity-50 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

export { NativeSelect };
