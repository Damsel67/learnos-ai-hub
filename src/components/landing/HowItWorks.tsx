import { BookOpen, Radio, Sparkles } from "lucide-react";

const steps = [
  { n: "01", icon: BookOpen, title: "Create a Course", desc: "Design your curriculum with lessons, assignments and resources in minutes." },
  { n: "02", icon: Radio, title: "Run Live Sessions", desc: "Teach in interactive virtual classrooms with built-in collaboration tools." },
  { n: "03", icon: Sparkles, title: "Track Progress with AI", desc: "Get actionable insights on mastery, focus and outcomes — automatically." },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">How it works</span>
          <h2 className="mt-3 text-4xl font-semibold md:text-5xl">Launch in three steps</h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.n} className="relative rounded-2xl border border-border bg-card p-7 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl text-muted-foreground/60">{s.n}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                  <s.icon className="h-5 w-5" />
                </span>
              </div>
              <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-border md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
