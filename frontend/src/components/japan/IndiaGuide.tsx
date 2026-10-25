import { useState } from "react";
import { COMFORT_TIPS, PHRASES, VEG_FOOD } from "@/data/japan";
import { Reveal, SectionHeading } from "./Reveal";
import { cn } from "@/lib/utils";

export function IndiaGuide() {
  const [active, setActive] = useState(0);
  const phrase = PHRASES[active] ?? PHRASES[0]!;
  return (
    <section id="india" className="relative bg-secondary/40 px-6 py-28 md:py-36">
      <SectionHeading
        jp="ナマステ"
        eyebrow="Namaste, India"
        title={
          <>
            Japan feels like <span className="text-sunrise">home</span> for Indian travellers
          </>
        }
        subtitle="Pure veg and Jain food, simple etiquette tips and a warm welcome — everything to travel comfortably."
      />

      <div className="mx-auto mt-16 max-w-6xl">
        <h3 className="font-display text-2xl">🥗 Vegetarian & Jain food</h3>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VEG_FOOD.map((f, i) => (
            <Reveal
              key={f.title}
              delay={i * 90}
              className="rounded-2xl border bg-card p-6 shadow-paper transition-transform duration-300 hover:-translate-y-1"
            >
              <p className="font-display text-2xl text-primary">{f.jp}</p>
              <h4 className="mt-3 font-display text-lg">{f.title}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 grid gap-8 rounded-3xl bg-ink p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="text-sm uppercase tracking-widest text-primary">Food phrase card</p>
            <h3 className="mt-2 font-display text-3xl text-ink-foreground">
              Show this to the waiter
            </h3>
            <div className="mt-6 flex flex-col gap-2">
              {PHRASES.map((p, i) => (
                <button
                  key={p.en}
                  onClick={() => setActive(i)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-left text-sm transition-colors",
                    i === active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-ink-foreground/20 text-ink-muted hover:text-ink-foreground",
                  )}
                >
                  {p.en}
                </button>
              ))}
            </div>
          </div>
          <div
            key={active}
            className="flex animate-in fade-in zoom-in-95 duration-500 flex-col justify-center rounded-2xl bg-card p-8 text-center shadow-elegant"
          >
            <p className="font-display text-3xl leading-relaxed md:text-4xl">{phrase.jp}</p>
            <p className="mt-4 text-sm italic text-muted-foreground">{phrase.romaji}</p>
            <p className="mt-1 text-sm text-muted-foreground">{phrase.en}</p>
          </div>
        </div>

        <h3 className="mt-16 font-display text-2xl">🙏 Feel at ease with Japanese culture</h3>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COMFORT_TIPS.map((t, i) => (
            <Reveal
              key={t.title}
              delay={i * 80}
              className="flex gap-4 rounded-2xl border bg-card p-6"
            >
              <span className="text-3xl">{t.emoji}</span>
              <div>
                <h4 className="font-display text-lg">{t.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{t.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
