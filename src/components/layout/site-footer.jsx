import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { Logo } from "./logo";
import { NAV_LINKS } from "./nav-links";

const PROGRAM_LINKS = [
  { href: "/courses?category=runway-catwalk", label: "Runway & Catwalk" },
  { href: "/courses?category=photoshoot-posing", label: "Photoshoot & Posing" },
  { href: "/courses?category=model-portfolio", label: "Model Portfolio" },
  { href: "/courses?category=casting-preparation", label: "Casting Preparation" },
];

const ACCOUNT_LINKS = [
  { href: "/login", label: "Login" },
  { href: "/register/student", label: "Daftar sebagai Student" },
  { href: "/register/teacher", label: "Daftar sebagai Teacher" },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-white/60">
            Kursus modeling profesional untuk membangun kepercayaan diri dan keterampilan menuju industri fashion.
          </p>
          <ul className="space-y-2 text-sm text-white/60">
            <li className="flex items-center gap-2"><MapPin className="size-4" /> Makassar, Indonesia</li>
            <li className="flex items-center gap-2">
              <Mail className="size-4" />
              <a href="mailto:hello@karelle.id" className="hover:text-white">hello@karelle.id</a>
            </li>
          </ul>
        </div>
        <FooterColumn title="Menu" links={NAV_LINKS} />
        <FooterColumn title="Program" links={PROGRAM_LINKS} />
        <FooterColumn title="Akun" links={ACCOUNT_LINKS} />
      </div>
      <div className="border-t border-ink-border">
        <p className="mx-auto max-w-7xl px-5 py-6 text-xs tracking-wider text-white/50 sm:px-8">
          © {new Date().getFullYear()} KARÉLLE Modeling Course. Final Project Praktikum Pemrograman Web 2026.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="mb-5 text-[0.7rem] tracking-[0.35em] text-white/50 uppercase">{title}</p>
      <ul className="space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-white/80 transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
