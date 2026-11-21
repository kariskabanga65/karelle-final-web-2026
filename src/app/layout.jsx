import "./globals.css";

// Font, warna tema, dan layout lengkap ditata di Tahap 4 (UI Foundation).
export const metadata = {
  title: "KARÉLLE — Modeling Course",
  description:
    "Platform kursus modeling berbasis kelas: Runway & Catwalk, Photoshoot & Posing, Model Portfolio, dan Casting Preparation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
