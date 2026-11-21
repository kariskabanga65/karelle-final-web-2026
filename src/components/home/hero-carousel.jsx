"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ribbon } from "@/components/layout/ribbon";
import { cn } from "@/lib/utils/cn";

const SLIDES = [
  {
    before: "Your journey to the",
    highlight: "runway",
    after: "starts here.",
    description:
      "A professional modeling course designed to help you build confidence, master essential skills, and step into the fashion industry.",
    image: "/images/hero-model.jpg",
  },
  {
    before: "Master every",
    highlight: "pose",
    after: "in front of the lens.",
    description:
      "Belajar posing, ekspresi, dan angle kamera langsung dari fotografer dan coach profesional.",
    image: "/images/hero-model.jpg",
  },
  {
    before: "Walk into every",
    highlight: "casting",
    after: "fully prepared.",
    description:
      "Susun portofolio, comp card, dan self-tape yang membuat casting director mengingat Anda.",
    image: "/images/hero-model.jpg",
  },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const go = (step) => setIndex((current) => (current + step + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = setInterval(() => setIndex((current) => (current + 1) % SLIDES.length), 7000);
    return () => clearInterval(timer);
  }, [index]);

  return (
    <section aria-roledescription="carousel" aria-label="Sorotan KARÉLLE" className="relative overflow-hidden bg-[radial-gradient(ellipse_at_30%_40%,#5b5b5b_0%,#262626_45%,#0e0e0e_100%)] text-white">
      <Ribbon className="top-8 -left-24 w-[420px] opacity-70" />
      <Ribbon flip className="-right-10 -bottom-40 w-[520px] opacity-40" />

      <div className="relative mx-auto grid min-h-[640px] max-w-7xl lg:grid-cols-2">
        <div className="absolute inset-0 lg:relative lg:[mask-image:linear-gradient(to_right,black_55%,transparent)]">
          <Image
            key={slide.image}
            src={slide.image}
            alt="Model KARÉLLE duduk dengan busana hitam"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-[center_62%] opacity-35 lg:object-[center_80%] mix-blend-luminosity lg:opacity-100 lg:mix-blend-normal"
          />
        </div>

        <div className="relative flex flex-col justify-center gap-8 px-5 py-20 sm:px-8 lg:py-24 lg:pl-12" aria-live="polite">
          <p className="eyebrow text-white/85">KARÉLLE Modeling Course</p>
          <h1 className="display-title text-5xl uppercase sm:text-6xl xl:text-[4.3rem]">
            {slide.before} <em className="font-display italic">{slide.highlight}</em> {slide.after}
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-white/75">{slide.description}</p>
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="light" size="lg" className="rounded-sm">
              <Link href="/courses">Explore Courses <ArrowRight /></Link>
            </Button>
            <Button asChild variant="outline-light" size="lg" className="rounded-sm">
              <Link href="/register/student">Join KARÉLLE</Link>
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-white/70">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div className="flex gap-1.5" role="tablist" aria-label="Pilih slide">
                {SLIDES.map((item, slideIndex) => (
                  <button
                    key={item.highlight}
                    type="button"
                    role="tab"
                    aria-selected={slideIndex === index}
                    aria-label={`Slide ${slideIndex + 1}`}
                    onClick={() => setIndex(slideIndex)}
                    className={cn("h-px w-8 bg-white/30 transition-all", slideIndex === index && "w-14 bg-white")}
                  />
                ))}
              </div>
              <span>{String(SLIDES.length).padStart(2, "0")}</span>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => go(-1)} aria-label="Slide sebelumnya" className="flex size-11 items-center justify-center rounded-full border border-white/60 transition-colors hover:bg-white hover:text-ink">
                <ArrowLeft className="size-4" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Slide berikutnya" className="flex size-11 items-center justify-center rounded-full bg-white text-ink transition-opacity hover:opacity-85">
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
