import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { HeroShowcase } from "./HeroShowcase";

const logos = ["Northgate Academy", "BrightPath Tutors", "Lumen Institute", "EduWorks Group", "Skillbridge"];

export function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden bg-hero">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-gradient-primary opacity-20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-24 top-64 h-72 w-72 rounded-full bg-gradient-mint opacity-15 blur-3xl animate-float-slower" />

      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-28 md:pt-32 md:pb-36">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground shadow-soft backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Now with AI Classroom Monitoring</span>
          </div>
          <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-7xl">
            The <span className="font-display italic text-gradient">Smart Learning</span>
            <br className="hidden md:block" /> Operating System
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            AI-powered tutoring, live sessions, and academic intelligence for modern education.
          </p>
          <p className="mx-auto mt-5 max-w-3xl text-pretty text-sm leading-relaxed text-muted-foreground/80 md:text-base">
            LearnOS is an all-in-one education operating system that combines live teaching, course management,
            assessments, AI classroom intelligence, scheduling, communication, automation, analytics, and
            administration into one seamless platform for schools, tutoring companies, and training organizations.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
              Get Started
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="bg-card/60 backdrop-blur-xl">
              <Play className="mr-1 h-4 w-4" />
              Request Demo
            </Button>
          </div>


          <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-mint" />
            Trusted by schools, tutoring companies and training organisations worldwide.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
            {logos.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </motion.div>

        <HeroShowcase />
      </div>
    </section>
  );
}
