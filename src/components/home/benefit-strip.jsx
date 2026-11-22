import { Award, Crown, Layers, Star } from "lucide-react";

const BENEFITS = [
  { icon: Crown, title: ["Professional", "Instructors"] },
  { icon: Layers, title: ["Structured", "Learning"] },
  { icon: Star, title: ["Practical", "Experience"] },
  { icon: Award, title: ["Certification", "of Completion"] },
];

/** Strip keunggulan di bawah hero: ikon + judul dua baris, dipisah garis tipis. */
export function BenefitStrip() {
  return (
    <section aria-label="Keunggulan belajar di KARÉLLE" className="border-t border-white/10 bg-[#161616] text-white">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 px-5 sm:px-8 lg:grid-cols-4">
        {BENEFITS.map(({ icon: Icon, title }) => (
          <li
            key={title.join(" ")}
            className="relative flex items-center justify-center gap-5 py-7 lg:after:absolute lg:after:top-1/2 lg:after:right-0 lg:after:h-10 lg:after:w-px lg:after:-translate-y-1/2 lg:after:bg-white/25 lg:last:after:hidden"
          >
            <Icon className="size-9 shrink-0 stroke-[1.1]" aria-hidden />
            <p className="leading-snug text-white/90">
              {title[0]}
              <br />
              {title[1]}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
