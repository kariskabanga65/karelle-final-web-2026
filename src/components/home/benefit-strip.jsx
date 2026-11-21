import { Award, Crown, Layers, Sparkles } from "lucide-react";

const BENEFITS = [
  { icon: Crown, title: "Professional Instructors", text: "Dibimbing runway coach, fotografer, dan casting director." },
  { icon: Layers, title: "Structured Learning", text: "Materi berurutan dari dasar hingga siap profesional." },
  { icon: Sparkles, title: "Practical Experience", text: "Latihan nyata: catwalk, posing, comp card, dan self-tape." },
  { icon: Award, title: "Certification of Completion", text: "Sertifikat resmi bernomor unik setelah lulus 100%." },
];

export function BenefitStrip() {
  return (
    <section aria-label="Keunggulan belajar di KARÉLLE" className="border-t border-ink-border bg-ink text-white">
      <ul className="mx-auto grid max-w-7xl sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-4 border-ink-border px-6 py-8 sm:px-8 lg:border-r lg:last:border-r-0">
            <Icon className="size-8 shrink-0 stroke-[1.2]" aria-hidden />
            <div>
              <h3 className="font-medium">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/55">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
