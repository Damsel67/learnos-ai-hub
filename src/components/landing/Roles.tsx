import { GraduationCap, Presentation, Heart, Building2, Workflow, Wallet } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";

function Bars({ data, mint }: { data: number[]; mint?: boolean }) {
  return (
    <div className="flex h-14 items-end gap-1">
      {data.map((h, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${mint ? "bg-gradient-mint" : "bg-gradient-primary"} opacity-80`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface/70 p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}

function Progress({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px]">
        <span>{label}</span>
        <span className="text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-gradient-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface/70 px-3 py-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

const roles = [
  {
    icon: GraduationCap,
    title: "Student",
    desc: "Lessons, live sessions, homework and streaks in one place.",
    preview: (
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Streak" value="12 days" />
          <Stat label="Assignments" value="8 / 10" />
        </div>
        <Progress label="Algebra II" pct={78} />
        <Progress label="Biology" pct={54} />
        <Line label="Next class" value="4:00 PM" />
      </div>
    ),
  },
  {
    icon: Presentation,
    title: "Tutor",
    desc: "Run classes, track focus and grade with AI assistance.",
    preview: (
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Classes today" value="5" />
          <Stat label="Hours taught" value="124h" />
        </div>
        <Line label="Live: Physics 101" value="28 joined" />
        <Bars data={[40, 62, 55, 78, 68, 85, 92]} />
      </div>
    ),
  },
  {
    icon: Heart,
    title: "Parent",
    desc: "Progress, attendance, homework and payments at a glance.",
    preview: (
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Attendance" value="97%" />
          <Stat label="Avg. grade" value="A-" />
        </div>
        <Line label="Weekly report" value="Sent" />
        <Line label="Next invoice" value="$120 · Mar 4" />
      </div>
    ),
  },
  {
    icon: Building2,
    title: "School Administrator",
    desc: "Institution-wide oversight of people, classes and outcomes.",
    preview: (
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Students" value="2,418" />
          <Stat label="Tutors" value="186" />
        </div>
        <Progress label="Curriculum coverage" pct={86} />
        <Line label="Compliance" value="All clear" />
      </div>
    ),
  },
  {
    icon: Workflow,
    title: "Operations Team",
    desc: "Scheduling, conflicts, tutor matching and automations.",
    preview: (
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Sessions/wk" value="1,204" />
          <Stat label="Conflicts" value="0" />
        </div>
        <Line label="Automation rules" value="112 active" />
        <Bars data={[55, 40, 70, 62, 80, 58, 74]} mint />
      </div>
    ),
  },
  {
    icon: Wallet,
    title: "Finance Team",
    desc: "Revenue, invoicing, payouts and financial reporting.",
    preview: (
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="MRR" value="$84k" />
          <Stat label="Collected" value="98%" />
        </div>
        <Line label="Outstanding" value="$2,140" />
        <Bars data={[35, 48, 52, 61, 70, 78, 90]} mint />
      </div>
    ),
  },
];

export function Roles() {
  return (
    <section id="solutions" className="relative py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Solutions"
          title="Built for"
          accent="Every Role"
          subtitle="One platform, six tailored experiences — each with the data that role actually needs."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((r, i) => (
            <Reveal key={r.title} delay={(i % 3) * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5 shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Dashboard</div>
                    <div className="text-lg font-semibold">{r.title}</div>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-soft text-primary ring-1 ring-border">
                    <r.icon className="h-4.5 w-4.5" />
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
                <div className="mt-5 rounded-xl border border-border bg-surface/50 p-3">{r.preview}</div>
                <div className="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-gradient-primary opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
