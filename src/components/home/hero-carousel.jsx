"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SilkRibbon } from "@/components/layout/silk-ribbon";

// Setiap judul dipecah per baris seperti desain; kata dalam *...* dicetak miring.
const SLIDES = [
  {
    lines: ["Your journey", "to the *runway*", "starts here."],
    description:
      "A professional modeling course designed to help you build confidence, master essential skills, and step into the fashion industry.",
    image: "/images/hero-model.jpg",
  },
  {
    lines: ["Master every", "*pose* in front", "of the lens."],
    description:
      "Belajar posing, ekspresi, dan angle kamera langsung dari fotografer dan coach profesional.",
    image: "/images/hero-model.jpg",
  },
  {
    lines: ["Walk into every", "*casting* fully", "prepared."],
    description:
      "Susun portofolio, comp card, dan self-tape yang membuat casting director mengingat Anda.",
    image: "/images/hero-model.jpg",
  },
];

/** Mengubah "to the *runway*" menjadi teks dengan kata miring. */
function renderLine(line) {
  return line.split(/(\*[^*]+\*)/).map((part, i) =>
    part.startsWith("*") ? <em key={i} className="font-display italic">{part.slice(1, -1)}</em> : part,
  );
}

/**
 * Hero homepage dengan 3 slide teks yang berganti otomatis.
 * Pergantian berhenti saat kursor/fokus berada di hero, atau saat pengguna memilih "kurangi animasi".
 */
export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = SLIDES[index];

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = setInterval(() => setIndex((current) => (current + 1) % SLIDES.length), 7000);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Sorotan KARÉLLE"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative overflow-hidden bg-[radial-gradient(ellipse_70%_95%_at_22%_68%,#d4d4d4_0%,#9b9b9b_30%,#4b4b4b_58%,#1c1c1c_82%,#121212_100%)] text-white"
    >
      {/* Mobile: foto sebagai latar redup di belakang teks */}
      <div className="absolute inset-0 lg:hidden">
        <Image src={slide.image} alt="" fill priority sizes="100vw" className="object-cover object-[center_70%] opacity-40" />
        <div className="absolute inset-0 bg-ink/45" />
      </div>

      {/* Desktop: model utuh dari kepala sampai sepatu, tepi foto menyatu dengan gradasi */}
      <div className="absolute -top-[29%] left-[2%] hidden aspect-[908/1600] h-[139%] [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_12%,black_70%,transparent_96%),linear-gradient(to_bottom,transparent_22%,black_40%)] lg:block">
        <Image src={slide.image} alt="Model KARÉLLE duduk dengan busana hitam" fill priority sizes="45vw" className="object-cover" />
      </div>

      {/* Pita satin silver */}
      <SilkRibbon id="silk-top" className="top-0 -left-28 hidden w-[420px] opacity-75 lg:block" />
      <SilkRibbon id="silk-bottom" className="-right-6 -bottom-6 w-[420px] opacity-90 xl:w-[500px]" />

      <div className="relative mx-auto grid min-h-[max(640px,calc(100svh-6.5rem))] max-w-7xl pt-20 lg:grid-cols-[1fr_1.05fr]">
        <div className="relative flex flex-col justify-center gap-7 px-5 py-16 sm:px-8 lg:col-start-2 lg:py-20 lg:pl-4" aria-live="polite">
          <p className="eyebrow text-white/85">KARÉLLE Modeling Course</p>
          <h1 className="display-title text-5xl uppercase sm:text-6xl xl:text-[4.1rem]">
            {slide.lines.map((line) => (
              <span key={line} className="block whitespace-nowrap max-sm:whitespace-normal">{renderLine(line)}</span>
            ))}
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-white/80">{slide.description}</p>
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="light" size="lg" className="rounded-md px-7">
              <Link href="/courses">Explore Courses <ArrowRight /></Link>
            </Button>
            <Button asChild variant="outline-light" size="lg" className="rounded-md px-9">
              <Link href="/register/student">Join KARÉLLE</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
