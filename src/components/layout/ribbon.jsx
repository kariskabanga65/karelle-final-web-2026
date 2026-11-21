import { cn } from "@/lib/utils/cn";

export function Ribbon({ className, flip = false }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 300"
      fill="none"
      className={cn("pointer-events-none absolute", flip && "-scale-x-100", className)}
    >
      <defs>
        <linearGradient id="ribbon-silver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.35" stopColor="#f4f4f4" stopOpacity="0.85" />
          <stop offset="0.6" stopColor="#9a9a9a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M-20 280 C 90 250, 120 120, 230 110 S 360 40, 420 -10" stroke="url(#ribbon-silver)" strokeWidth="14" strokeLinecap="round" />
      <path d="M-20 296 C 100 262, 132 140, 240 128 S 370 58, 430 6" stroke="url(#ribbon-silver)" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
