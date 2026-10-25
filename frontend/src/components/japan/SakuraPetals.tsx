import type { CSSProperties } from "react";

// Deterministic petal layout so server and client render the same markup.
const PETALS = Array.from({ length: 26 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  // Round everything so server and client serialise identical style strings.
  return {
    left: `${Math.round(r(1) * 100)}%`,
    size: 8 + Math.round(r(2) * 10),
    duration: Math.round(9 + r(3) * 10),
    delay: -Math.round(r(4) * 18),
    drift: `${Math.round(r(5) * 220 - 60)}px`,
    opacity: Math.round((0.55 + r(6) * 0.45) * 100) / 100,
  };
});

export function SakuraPetals({ count = 26 }: { count?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {PETALS.slice(0, count).map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block animate-petal-fall bg-sakura"
          style={
            {
              left: p.left,
              width: `${p.size}px`,
              height: `${Math.round(p.size * 0.8)}px`,
              borderRadius: "150% 0 150% 0",
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              opacity: p.opacity,
              "--petal-drift": p.drift,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
