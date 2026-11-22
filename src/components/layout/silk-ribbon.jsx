import { cn } from "@/lib/utils/cn";

/**
 * Pita satin silver (dekoratif). Bentuknya pita lebar yang meliuk
 * dengan kilau putih, seperti pada desain hero KARÉLLE.
 */
export function SilkRibbon({ className, id = "silk" }) {
  return (
    <svg aria-hidden viewBox="0 0 600 400" fill="none" className={cn("pointer-events-none absolute", className)}>
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.25" stopColor="#f2f2f2" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="0.72" stopColor="#8d8d8d" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* badan pita: dua tepi yang menyempit-melebar sehingga terlihat terpelintir */}
      <path
        d="M0 390 C 120 370, 200 300, 290 220 C 370 150, 450 60, 600 20 L 600 46 C 470 80, 400 170, 320 240 C 230 318, 140 392, 0 400 Z"
        fill={`url(#${id}-fill)`}
      />
      <path d="M0 390 C 120 370, 200 300, 290 220 C 370 150, 450 60, 600 20" stroke={`url(#${id}-edge)`} strokeWidth="1.5" />
      <path d="M10 400 C 150 388, 235 316, 320 240 C 400 170, 470 82, 600 46" stroke={`url(#${id}-edge)`} strokeWidth="0.8" opacity="0.6" />
    </svg>
  );
}
