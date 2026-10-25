import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { INDIA_TESTIMONIALS, STATS, TESTIMONIALS } from "@/data/japan";
import { SectionHeading } from "./Reveal";

function Counter({ value, decimals, suffix }: { value: number; decimals: number; suffix: string }) {
  const { ref, visible } = useReveal<HTMLSpanElement>(0.4);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1800;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, value]);

  return (
    <span ref={ref}>
      {n.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export function Love() {
  const [filter, setFilter] = useState<"all" | "india">("all");
  const list =
    filter === "india" ? INDIA_TESTIMONIALS : [...INDIA_TESTIMONIALS.slice(0, 3), ...TESTIMONIALS];
  const row = [...list, ...list];
  return (
    <section id="love" className="relative overflow-hidden bg-background py-28 md:py-36">
      <div className="px-6">
        <SectionHeading
          jp="愛"
          eyebrow="Why people love it"
          title={
            <>
              Visit once, <span className="text-sunrise">dream forever</span>
            </>
          }
          subtitle="Safe streets, kind people, unbelievable food and a sense of wonder around every corner."
        />

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-y-10 border-y py-12 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="px-4 text-center">
              <p className="font-display text-4xl font-semibold text-primary md:text-5xl">
                <Counter value={s.value} decimals={s.decimals} suffix={s.suffix} />
              </p>
              <p className="mx-auto mt-2 max-w-[180px] text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 flex justify-center gap-2">
        {(["all", "india"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-5 py-2 text-sm transition-colors ${filter === f ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"}`}
          >
            {f === "all" ? "All travellers" : "🇮🇳 Travellers from India"}
          </button>
        ))}
      </div>
      <div key={filter} className="group relative mt-8 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max animate-marquee gap-5 group-hover:[animation-play-state:paused]">
          {row.map((t, i) => (
            <figure
              key={i}
              className="w-[320px] shrink-0 rounded-2xl border bg-card p-6 shadow-paper"
            >
              <Quote className="h-5 w-5 text-primary" />
              <blockquote className="mt-3 font-display text-lg leading-snug">“{t.text}”</blockquote>
              <figcaption className="mt-4 text-sm text-muted-foreground">— {t.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
