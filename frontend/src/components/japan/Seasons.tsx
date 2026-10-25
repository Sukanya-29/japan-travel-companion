import { useState } from "react";
import { Thermometer, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { MONTHS, SEASONS, type SeasonId } from "@/data/japan";
import { Reveal, SectionHeading } from "./Reveal";

export function Seasons() {
  const [active, setActive] = useState<SeasonId>("spring");
  const season = SEASONS.find((s) => s.id === active)!;

  return (
    <section id="seasons" className="relative bg-background px-6 py-28 md:py-36">
      <SectionHeading
        jp="季節"
        eyebrow="Best time to visit"
        title="Four seasons, four Japans"
        subtitle="Japan changes completely with the seasons. Tap a season to see what's waiting for you."
      />

      <Reveal className="mx-auto mt-14 flex max-w-xl justify-center gap-2 rounded-full border bg-card p-1.5 shadow-paper">
        {SEASONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-medium transition-all duration-500",
              active === s.id ? "bg-primary text-primary-foreground shadow-elegant" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="font-display text-base">{s.jp}</span>
            <span className="hidden sm:inline">{s.name}</span>
          </button>
        ))}
      </Reveal>

      {/* Month timeline */}
      <Reveal className="mx-auto mt-8 grid max-w-6xl grid-cols-12 gap-1">
        {MONTHS.map((m, i) => {
          const on = season.monthNums.includes(i + 1);
          return (
            <div key={m} className="text-center">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-all duration-700",
                  on ? "bg-primary" : "bg-border",
                )}
              />
              <p className={cn("mt-2 text-[10px] uppercase tracking-wider md:text-xs", on ? "text-foreground" : "text-muted-foreground/60")}>
                {m.slice(0, 3)}
              </p>
            </div>
          );
        })}
      </Reveal>

      <Reveal className="mx-auto mt-10 grid max-w-6xl overflow-hidden rounded-2xl bg-ink shadow-paper lg:grid-cols-[1.4fr_1fr]">
        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[520px]">
          {SEASONS.map((s) => (
            <img
              key={s.id}
              src={s.image}
              alt={`${s.name} in Japan`}
              loading="lazy"
              width={1280}
              height={960}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] ease-out",
                s.id === active ? "scale-100 opacity-100" : "scale-110 opacity-0",
              )}
            />
          ))}
          <span
            key={season.id}
            className="absolute bottom-4 left-6 animate-ink-in font-display text-[8rem] leading-none text-on-image/90 md:text-[11rem]"
          >
            {season.jp}
          </span>
        </div>

        <div key={season.id} className="flex flex-col justify-center p-8 text-ink-foreground md:p-12">
          <p className="animate-in fade-in slide-in-from-right-4 text-xs uppercase tracking-[0.3em] text-primary duration-700">
            {season.months}
          </p>
          <h3 className="mt-3 animate-in fade-in slide-in-from-right-6 font-display text-4xl duration-700">
            {season.headline}
          </h3>
          <p className="mt-4 animate-in fade-in slide-in-from-right-8 text-ink-muted duration-700">
            {season.description}
          </p>
          <ul className="mt-6 space-y-3">
            {season.highlights.map((h, i) => (
              <li
                key={h}
                className="flex animate-in items-center gap-3 text-sm fade-in slide-in-from-bottom-2 duration-500 [animation-fill-mode:both]"
                style={{ animationDelay: `${200 + i * 120}ms` }}
              >
                <span className="h-1.5 w-1.5 rotate-45 bg-sakura" />
                {h}
              </li>
            ))}
          </ul>
          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-ink-foreground/5 p-4">
              <Thermometer className="h-4 w-4 text-gold" />
              <p className="mt-2 text-ink-muted">Weather</p>
              <p className="font-medium">{season.weather}</p>
            </div>
            <div className="rounded-xl bg-ink-foreground/5 p-4">
              <Users className="h-4 w-4 text-sakura" />
              <p className="mt-2 text-ink-muted">Crowds</p>
              <p className="font-medium">{season.crowd}</p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
