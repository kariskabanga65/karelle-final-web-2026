import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Logo({ className, variant = "inline" }) {
  if (variant === "full") {
    return (
      <Link href="/" title="Kembali ke beranda" className={cn("block", className)}>
        <Image src="/images/logo-karelle.png" alt="KARÉLLE Modeling Course" width={1059} height={634} priority className="h-auto w-full" />
      </Link>
    );
  }

  return (
    <Link href="/" title="Kembali ke beranda" className={cn("flex items-center gap-2.5 text-white", className)}>
      <Image src="/images/logo-mark.png" alt="" width={476} height={399} priority className="h-10 w-auto" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl tracking-[0.28em]">KARÉLLE</span>
        <span className="mt-1.5 text-[0.55rem] tracking-[0.42em] text-white/75">MODELING COURSE</span>
      </span>
    </Link>
  );
}
