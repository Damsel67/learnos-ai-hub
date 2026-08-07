import { motion, useReducedMotion } from "motion/react";
import { Sparkles } from "lucide-react";
import { SectionHeading } from "./Reveal";

const features = [
  "AI creates lesson plans",
  "AI marks quizzes",
  "AI writes reports",
  "AI summarizes sessions",
  "AI identifies struggling learners",
  "AI recommends homework",
  "AI predicts learner performance",
  "AI writes parent updates",
];

export function AIFeatures() {
  const reduce = useReducedMotion();
  return (
    <section id="ai" className="relative overflow-hidden py-28">
      <div className="pointer-events-none absolute left-1/4 top-10 h-72 w-72 rounded-full bg-gradient-primary opacity-20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute right-1/4 bottom-10 h-72 w-72 rounded-full bg-gradient-mint opacity-15 blur-3xl animate-float-slower" />

      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="AI Features"
          title="An AI layer across"
          accent="every workflow"
          subtitle="LearnOS AI works quietly in the background — planning, grading, reporting and predicting."
        />

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f}
              initial={reduce ? undefined : { opacity: 0, y: 20 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
            >
              <motion.div
                animate={reduce ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 5 + (i % 4), repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                className="group h-full rounded-2xl border border-border/70 bg-card/50 p-5 shadow-soft backdrop-blur-xl transition-colors hover:border-primary/40"
              >
                <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
                  <Sparkles className="h-4 w-4" />
                </span>
                <p className="text-sm font-medium leading-snug">{f}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
