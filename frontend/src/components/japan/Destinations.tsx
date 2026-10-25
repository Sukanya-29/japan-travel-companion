import { useState } from "react";
import { ArrowUpRight, CalendarHeart } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DESTINATIONS, INTERESTS, MONTHS, type Destination, type Interest } from "@/data/japan";
import { Reveal, SectionHeading } from "./Reveal";

export function Destinations() {
  const [filter, setFilter] = useState<Interest | "all">("all");
  const [open, setOpen] = useState<Destination | null>(null);

  const list = filter === "all" ? DESTINATIONS : DESTINATIONS.filter((d) => d.tags.includes(filter));

  return (
    <section id="places" className="washi relative px-6 py-28 md:py-36">
      <SectionHeading
        jp="場所"
        eyebrow="Places of Japan"
        title="From neon cities to tropical islands"
        subtitle="Over 3,000 km from snowy north to subtropical south. Filter by what you love and tap a place to dive in."
      />

      <Reveal className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2.5">
        {[{ id: "all" as const, label: "All places", emoji: "🗾" }, ...INTERESTS].map((it) => (
          <button
            key={it.id}
            onClick={() => setFilter(it.id)}
            className={cn(
              "flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 shadow-2xs",
              filter === it.id
                ? "border-transparent bg-[#141312] text-white"
                : "border-[#E5E0D8] bg-white text-[#2B2825] hover:border-[#BDB5A8] hover:-translate-y-0.5",
            )}
          >
            <span className="mr-1.5">{it.emoji}</span>
            {it.label}
          </button>
        ))}
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((d, i) => (
          <button
            key={d.slug}
            onClick={() => setOpen(d)}
            className={cn(
              "group relative aspect-[3/4.2] overflow-hidden rounded-[22px] bg-[#1C1A17] text-left shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-xl cursor-pointer",
              (i % 4 === 1 || i % 4 === 3) && "lg:mt-12",
            )}
          >
            <img
              src={d.image}
              alt={d.name}
              loading="eager"
              width={896}
              height={1152}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="card-overlay absolute inset-0" />
            <span className="absolute right-4 top-4 font-display text-3xl text-white/90 vertical-jp select-none tracking-widest drop-shadow-sm">
              {d.jp}
            </span>
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/70 font-medium">{d.region}</p>
              <h3 className="mt-1 font-display text-2xl font-semibold text-white">{d.name}</h3>
              <p className="mt-1 text-sm text-white/80 line-clamp-2">{d.tagline}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#F4ACB7] transition-colors group-hover:text-white">
                Discover <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-3xl overflow-hidden border-0 bg-card p-0">
          {open && (
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-[4/5] md:aspect-auto">
                <img src={open.image} alt={open.name} className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute bottom-4 left-5 font-display text-6xl text-on-image">{open.jp}</span>
              </div>
              <div className="p-7">
                <p className="text-xs uppercase tracking-[0.3em] text-primary">{open.region}</p>
                <DialogTitle className="mt-2 font-display text-3xl">{open.name}</DialogTitle>
                <DialogDescription className="mt-3 text-sm text-muted-foreground">
                  {open.description}
                </DialogDescription>
                <p className="mt-6 text-sm font-semibold">Don't miss</p>
                <ul className="mt-2 space-y-2 text-sm">
                  {open.mustDo.map((m) => (
                    <li key={m} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rotate-45 bg-primary" /> {m}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-start gap-2 rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
                  <CalendarHeart className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Best months: {open.bestMonths.map((m) => MONTHS[m - 1].slice(0, 3)).join(", ")}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {open.tags.map((t) => {
                    const it = INTERESTS.find((x) => x.id === t)!;
                    return (
                      <span key={t} className="rounded-full border px-2.5 py-1 text-xs">
                        {it.emoji} {it.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
