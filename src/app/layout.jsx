import "@fontsource-variable/bodoni-moda";
import "@fontsource-variable/bodoni-moda/wght-italic.css";
import "@fontsource-variable/jost";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "KARÉLLE — Modeling Course",
  description:
    "Platform kursus modeling berbasis kelas: Runway & Catwalk, Photoshoot & Posing, Model Portfolio, dan Casting Preparation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-ink">
          Lewati ke konten
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
