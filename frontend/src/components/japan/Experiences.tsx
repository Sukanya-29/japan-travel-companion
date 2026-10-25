import { EXPERIENCES } from "@/data/japan";
import { Reveal, SectionHeading } from "./Reveal";

export function Experiences() {
  return (
    <section id="experiences" className="relative overflow-hidden bg-[#0F0E0D] px-6 py-28 md:py-36">
      <SectionHeading
        tone="dark"
        jp="体験"
        eyebrow="What awaits you"
        title="Things you can only feel in Japan"
        subtitle="It's not just what you see — it's the rituals, the flavours and the little moments."
      />

      <div className="mx-auto mt-16 max-w-6xl grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 lg:divide-x divide-white/10">
        {EXPERIENCES.map((e, i) => (
          <Reveal key={e.title} delay={i * 90} className="group relative p-6 sm:p-8 transition-transform duration-300 hover:-translate-y-1">
            <p className="font-display text-5xl font-medium text-[#CF3A24] transition-transform duration-300 group-hover:scale-105">
              {e.jp}
            </p>
            <h3 className="mt-5 font-display text-2xl font-semibold text-white tracking-tight">
              {e.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#9E9689]">
              {e.text}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
