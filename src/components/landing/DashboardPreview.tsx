import { Trophy, GraduationCap, Shield, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

export function DashboardPreview() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">Dashboards</span>
          <h2 className="mt-3 text-4xl font-semibold md:text-5xl">
            A view for <span className="font-display italic text-gradient">every role</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Tailored experiences for students, tutors and administrators.</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <PreviewCard title="Student" subtitle="Learning hub" tone="from-violet-500/10 to-fuchsia-500/10">
            <div className="space-y-3">
              <Row icon={Trophy} label="Streak" value="12 days" />
              <Row icon={CheckCircle2} label="Assignments" value="8 / 10" />
              <ProgressRow label="Algebra II" pct={78} />
              <ProgressRow label="Biology" pct={54} />
              <div className="rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
                Next: <span className="text-foreground">Live tutoring · 4:00 PM</span>
              </div>
            </div>
          </PreviewCard>

          <PreviewCard title="Tutor" subtitle="Class control" tone="from-sky-500/10 to-indigo-500/10" featured>
            <div className="space-y-3">
              <Row icon={GraduationCap} label="Today's classes" value="5" />
              <Row icon={Clock} label="Hours taught" value="124h" />
              <div className="rounded-lg bg-surface p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Live: Physics 101</span>
                  <span className="flex items-center gap-1 text-destructive"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive"/> LIVE</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {Array.from({length:8}).map((_,i)=>(
                    <div key={i} className="aspect-video rounded bg-gradient-primary opacity-70" />
                  ))}
                </div>
              </div>
              <Row icon={TrendingUp} label="Class focus avg." value="91%" />
            </div>
          </PreviewCard>

          <PreviewCard title="Admin" subtitle="Institution view" tone="from-emerald-500/10 to-teal-500/10">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Students" value="2,418" />
                <Stat label="Tutors" value="186" />
                <Stat label="Revenue" value="$84k" />
                <Stat label="Retention" value="96%" />
              </div>
              <Row icon={Shield} label="Compliance" value="All clear" />
              <div className="rounded-lg border border-border bg-surface p-3 text-xs">
                <div className="mb-1.5 text-muted-foreground">Weekly engagement</div>
                <div className="flex h-12 items-end gap-1">
                  {[30,50,42,68,55,72,88].map((h,i)=>(
                    <div key={i} className="flex-1 rounded-sm bg-gradient-primary opacity-80" style={{height:`${h}%`}}/>
                  ))}
                </div>
              </div>
            </div>
          </PreviewCard>
        </div>
      </div>
    </section>
  );
}

function PreviewCard({ title, subtitle, children, tone, featured }: { title: string; subtitle: string; children: React.ReactNode; tone: string; featured?: boolean }) {
  return (
    <div className={`relative rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card ${featured ? "lg:-translate-y-3" : ""}`}>
      <div className={`absolute inset-x-0 top-0 h-32 rounded-t-2xl bg-gradient-to-b ${tone} pointer-events-none`} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{subtitle}</div>
            <div className="text-lg font-semibold">{title} Dashboard</div>
          </div>
          <span className="h-2 w-2 rounded-full bg-gradient-primary" />
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4 text-primary" />{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ProgressRow({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="mb-1.5 flex justify-between text-xs"><span>{label}</span><span className="text-muted-foreground">{pct}%</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-2.5">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}
