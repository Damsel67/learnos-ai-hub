import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground shadow-soft backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Now with AI Classroom Monitoring</span>
          </div>
          <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-7xl">
            The <span className="font-display italic text-gradient">Smart Learning</span>
            <br />
            Operating System
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
            AI-powered tutoring, live sessions, and academic intelligence for modern education.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
              Start Learning
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="bg-card/70 backdrop-blur">
              <Play className="mr-1 h-4 w-4" />
              Request Demo
            </Button>
          </div>
          <div className="mt-10 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span>Trusted by 1,200+ schools</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>SOC 2 Type II</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>99.99% uptime</span>
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-primary opacity-20 blur-3xl" />
      <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
        <div className="flex items-center gap-1.5 px-2 py-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-chart-4/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-chart-2/60" />
          <span className="ml-3 text-xs text-muted-foreground">app.learnos.io/dashboard</span>
        </div>
        <div className="grid grid-cols-12 gap-3 rounded-xl bg-surface p-4">
          <aside className="col-span-3 hidden rounded-lg bg-card p-3 shadow-soft md:block">
            <div className="mb-3 h-3 w-20 rounded bg-muted" />
            {["Live Sessions","Courses","Students","Reports","Schedule"].map((t,i)=> (
              <div key={t} className={`mb-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${i===0?"bg-accent text-accent-foreground":"text-muted-foreground"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${i===0?"bg-primary":"bg-border"}`} />
                {t}
              </div>
            ))}
          </aside>
          <div className="col-span-12 md:col-span-9 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[{k:"Active classes",v:"24"},{k:"Avg. focus",v:"92%"},{k:"Assignments",v:"318"}].map((m)=>(
                <div key={m.k} className="rounded-lg bg-card p-3 shadow-soft">
                  <div className="text-xs text-muted-foreground">{m.k}</div>
                  <div className="mt-1 text-xl font-semibold">{m.v}</div>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-card p-4 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-medium">Engagement this week</div>
                <div className="text-xs text-muted-foreground">AI monitored</div>
              </div>
              <div className="flex h-28 items-end gap-2">
                {[40,62,55,78,68,85,92].map((h,i)=>(
                  <div key={i} className="flex-1 rounded-md bg-gradient-primary opacity-80" style={{height:`${h}%`}} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
