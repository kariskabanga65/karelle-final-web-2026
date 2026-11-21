import Image from "next/image";
import { redirect } from "next/navigation";
import { Ribbon } from "@/components/layout/ribbon";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardPath } from "@/lib/auth/roles";

// User yang sudah login tidak perlu melihat halaman login/register lagi.
export default async function AuthLayout({ children }) {
  const user = await getCurrentUser();
  if (user) redirect(getDashboardPath(user.role));

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_35%_45%,#6a6a6a_0%,#2b2b2b_45%,#0b0b0b_100%)] text-white">
      <Ribbon className="-top-16 -left-24 w-[520px] opacity-80" />
      <Ribbon flip className="-right-16 -bottom-24 w-[560px] opacity-70" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Kiri: foto model + judul (desktop) */}
        <aside className="relative hidden h-[min(860px,92vh)] lg:block" aria-hidden>
          <div className="absolute inset-0 [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_14%,black_52%,transparent_92%),linear-gradient(to_bottom,transparent,black_12%,black_84%,transparent)]">
            <Image src="/images/hero-model.jpg" alt="" fill priority sizes="55vw" className="object-cover object-[30%_75%]" />
          </div>
          <div className="absolute top-[9%] left-[44%] w-max space-y-5">
            <p className="eyebrow whitespace-nowrap text-white/80">KARÉLLE Modeling Course</p>
            <p className="display-title text-silver w-max text-5xl leading-[1.04] uppercase xl:text-[3.3rem]">
              <span className="block">Discipline</span>
              <span className="block">Pose</span>
              <span className="block pl-5">Confidence</span>
              <span className="block pl-12">&amp; <em className="italic">Runway</em></span>
            </p>
            <span className="ml-40 block h-px w-28 bg-white/40" />
          </div>
        </aside>

        {/* Kanan: kartu kaca berisi form */}
        <main id="main-content" className="auth-glass mx-auto w-full max-w-lg px-6 py-10 sm:px-12">
          {children}
        </main>
      </div>
    </div>
  );
}
