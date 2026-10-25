import type { ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      data-visible={visible}
      className={cn("reveal", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  jp,
  eyebrow,
  title,
  subtitle,
  tone = "light",
}: {
  jp: string;
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  tone?: "light" | "dark";
}) {
  return (
    <Reveal className="relative mx-auto max-w-3xl text-center">
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 -z-0 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[9rem] leading-none md:text-[13rem]",
          tone === "dark" ? "text-white/10" : "text-[#78716C]/15",
        )}
      >
        {jp}
      </span>
      <p className="relative text-xs font-semibold uppercase tracking-[0.38em] text-[#CF3A24]">
        {eyebrow}
      </p>
      <h2
        className={cn(
          "relative mt-3 font-display text-4xl sm:text-5xl md:text-6xl font-normal leading-tight tracking-tight",
          tone === "dark" ? "text-white" : "text-[#1C1917]",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "relative mx-auto mt-4 max-w-xl text-base md:text-lg leading-relaxed",
            tone === "dark" ? "text-[#9E9689]" : "text-[#57534E]",
          )}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
