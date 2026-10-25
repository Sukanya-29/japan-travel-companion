import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowDown } from "lucide-react";
import heroFuji from "@/assets/hero-fuji.jpg";
import { SakuraPetals } from "./SakuraPetals";

export function Hero() {
  const imgRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (imgRef.current) {
          imgRef.current.style.transform = `translateY(${y * 0.22}px)`;
        }
        if (textRef.current) {
          textRef.current.style.transform = `translateY(${y * -0.12}px)`;
          textRef.current.style.opacity = String(Math.max(0, 1 - y / 550));
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section id="top" className="relative h-screen min-h-[640px] max-h-[1000px] overflow-hidden bg-[#0F0E0D]">
      <img
        ref={imgRef}
        src={heroFuji}
        alt="Mount Fuji at dawn with the red Chureito pagoda and cherry blossoms"
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover object-[center_25%] will-change-transform"
      />
      <div className="hero-overlay absolute inset-0" />
      <SakuraPetals />

      {/* Vertical Japanese text on right */}
      <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 md:block lg:right-12 xl:right-16 z-10">
        <p className="vertical-jp font-display text-2xl tracking-[0.55em] text-white/80 select-none animate-ink-in">
          日本へようこそ
        </p>
      </div>

      <div
        ref={textRef}
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6 pt-28 pb-12 sm:px-10 lg:px-12"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.38em] text-white/80">
            Welcome to Japan · 日本
          </p>

          <h1 className="mt-5 font-display text-5xl font-normal leading-[1.08] text-white sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-tight">
            Where ancient{" "}
            <span className="font-serif italic text-[#F4ACB7]">tradition</span>{" "}
            dances with the future.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
            Cherry blossoms and neon skylines, silent temples and sizzling street food.
            Discover the country millions fall in love with — and plan a trip made just for you.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/itineraryPlanner"
              className="inline-flex items-center justify-center rounded-full bg-[#CF3A24] px-8 py-3.5 text-base font-medium text-white shadow-[0_8px_25px_rgba(207,58,36,0.35)] transition-all duration-300 hover:bg-[#B7331F] hover:-translate-y-0.5"
            >
              Design my Japan trip
            </Link>

            <a
              href="#places"
              className="inline-flex items-center justify-center rounded-full bg-black/25 px-8 py-3.5 text-base font-medium text-white border border-white/30 backdrop-blur-md transition-all duration-300 hover:bg-black/40 hover:-translate-y-0.5"
            >
              Explore places
            </a>
          </div>
        </div>
      </div>

      <a
        href="#places"
        aria-label="Scroll down"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/70 transition-colors hover:text-white"
      >
        <ArrowDown className="h-5 w-5 animate-bounce" />
      </a>
    </section>
  );
}
