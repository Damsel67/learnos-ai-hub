import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Reveal, SectionHeading } from "./Reveal";

const stats = [
  { value: 99.99, suffix: "%", label: "Uptime SLA", decimals: 2 },
  { value: 100, suffix: "+", label: "Automation workflows" },
  { value: 24, suffix: "/7", label: "AI powered monitoring" },
  { value: 12, suffix: "M+", label: "Learning events monthly" },
  { value: 190, suffix: "+", label: "Global timezones supported" },
  { value: 0, suffix: "∞", label: "Unlimited classrooms", raw: "∞" },
  { value: 256, suffix: "-bit", label: "Enterprise security" },
  { value: 2, suffix: "", label: "SOC2 Type II compliant", raw: "SOC2" },
];

function Counter({ value, suffix, decimals = 0, raw }: { value: number; suffix: string; decimals?: number; raw?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || raw) return;
    if (reduce) return setN(value);
    let frame = 0;
    const total = 48;
    const id = setInterval(() => {
      frame++;
      const t = 1 - Math.pow(1 - frame / total, 3);
      setN(value * t);
      if (frame >= total) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [inView, value, reduce, raw]);

  return (
    <div ref={ref} className="text-3xl font-semibold md:text-4xl">
      {raw ? <span className="text-gradient">{raw}</span> : <span className="text-gradient">{n.toFixed(decimals)}{suffix}</span>}
    </div>
  );
}

export function Stats() {
  return (
    <section id="why" className="relative py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Enterprise"
          title="Why schools choose"
          accent="LearnOS"
          subtitle="Built to the reliability and security standards enterprise education teams require."
        />

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={(i % 4) * 0.07}>
              <div className="h-full rounded-2xl border border-border/70 bg-card/60 p-6 text-center shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card">
                <Counter value={s.value} suffix={s.suffix} decimals={s.decimals} raw={s.raw} />
                <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
