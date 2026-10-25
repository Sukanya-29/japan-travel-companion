import { Link } from "react-router-dom";
import hiroshima from "@/assets/place-hiroshima.jpg";
import { SakuraPetals } from "./SakuraPetals";
import { Reveal } from "./Reveal";

export function FinalCta() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#0F0E0D] px-6 py-32 md:py-44">
        <img
          src={hiroshima}
          alt="Floating torii gate at sunset"
          loading="eager"
          width={896}
          height={1152}
          className="absolute inset-0 h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0E0D]/40 via-[#0F0E0D]/30 to-[#0F0E0D]/90" />
        <SakuraPetals count={14} />

        <Reveal className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="font-display text-5xl font-normal leading-tight text-white md:text-7xl tracking-tight">
            Your story in Japan <br className="hidden sm:inline" />
            starts here.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base text-white/85 md:text-lg leading-relaxed">
            The torii is waiting. Build a personalised route in under a minute and start dreaming.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/itineraryPlanner"
              className="inline-flex items-center justify-center rounded-full bg-[#CF3A24] px-8 py-3.5 text-base font-medium text-white shadow-[0_8px_25px_rgba(207,58,36,0.35)] transition-all duration-300 hover:bg-[#B7331F] hover:-translate-y-0.5"
            >
              Plan my trip now
            </Link>

            <a
              href="#seasons"
              className="inline-flex items-center justify-center rounded-full bg-black/30 px-8 py-3.5 text-base font-medium text-white border border-white/25 backdrop-blur-md transition-all duration-300 hover:bg-black/45 hover:-translate-y-0.5"
            >
              When should I go?
            </a>
          </div>
        </Reveal>
      </section>

      <footer className="bg-[#0F0E0D] border-t border-white/10 px-6 py-6 sm:px-10 text-white/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#CF3A24] font-display text-xs text-white">
              旅
            </span>
            <span className="font-display text-base font-semibold text-white tracking-wide">
              Nihon
            </span>
          </div>

          <p className="text-white/60 text-xs sm:text-sm">
            Made with love for Japan · 日本が大好き
          </p>
        </div>
      </footer>
    </>
  );
}
