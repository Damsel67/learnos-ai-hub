import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { CheckCircle2, Mic, MonitorPlay, Hand, Users, TrendingUp, Radio } from "lucide-react";

const aiCards = [
  "AI detected learner distraction",
  "Attendance completed automatically",
  "Homework generated",
  "Parent notified",
  "Quiz graded automatically",
];

const positions = [
  "left-0 top-16",
  "right-0 top-4",
  "left-4 bottom-10",
  "right-2 bottom-24",
  "left-1/2 -top-6 -translate-x-1/2",
];

export function HeroShowcase() {
  const reduce = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 6;
      setTilt({ x, y });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce]);

  return (
    <div className="relative mx-auto mt-20 max-w-6xl">
      <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-primary opacity-20 blur-3xl" />

      <motion.div
        className="relative"
        animate={{ rotateY: tilt.x * 0.4, rotateX: -tilt.y * 0.4 }}
        transition={{ type: "spring", stiffness: 60, damping: 20 }}
        style={{ transformPerspective: 1400 }}
      >
        <div className="flex items-end justify-center">
          {/* Student */}
          <Panel
            className="hidden w-[30%] -mr-10 rotate-[-6deg] md:block"
            delay={0.1}
            title="Student Dashboard"
          >
            <StudentPanel />
          </Panel>

          {/* Live classroom */}
          <Panel className="relative z-20 w-full md:w-[46%]" delay={0} title="Live Classroom" featured>
            <ClassroomPanel />
          </Panel>

          {/* Admin */}
          <Panel
            className="hidden w-[30%] -ml-10 rotate-[6deg] md:block"
            delay={0.2}
            title="Admin Dashboard"
          >
            <AdminPanel />
          </Panel>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        {aiCards.map((c, i) => (
          <motion.div
            key={c}
            className={`absolute ${positions[i]} rounded-xl border border-border/70 bg-card/60 px-3 py-2 text-xs shadow-card backdrop-blur-xl`}
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            animate={reduce ? undefined : { opacity: [0, 1, 1, 0], y: [12, 0, -4, -14] }}
            transition={{ duration: 6, delay: i * 1.2, repeat: Infinity, repeatDelay: 2.5 }}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-mint" />
              {c}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 md:hidden">
        {aiCards.slice(0, 3).map((c) => (
          <div key={c} className="rounded-lg border border-border bg-card/60 p-2 text-[10px] backdrop-blur-xl">
            <CheckCircle2 className="mb-1 h-3 w-3 text-mint" />
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}

function Panel({
  children,
  className = "",
  title,
  delay,
  featured,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
  delay: number;
  featured?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 30 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border border-border/70 bg-card/60 p-3 backdrop-blur-xl ${
        featured ? "shadow-card" : "shadow-soft"
      } ${className}`}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[11px] font-medium text-muted-foreground">{title}</span>
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
        </span>
      </div>
      <div className="rounded-xl bg-surface/70 p-3">{children}</div>
    </motion.div>
  );
}

function StudentPanel() {
  return (
    <div className="space-y-2.5">
      <div className="text-[11px] text-muted-foreground">Weekly mastery</div>
      {[
        { l: "Algebra II", p: 78 },
        { l: "Biology", p: 54 },
        { l: "Physics", p: 88 },
      ].map((s) => (
        <div key={s.l}>
          <div className="mb-1 flex justify-between text-[10px]">
            <span>{s.l}</span>
            <span className="text-muted-foreground">{s.p}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gradient-primary" style={{ width: `${s.p}%` }} />
          </div>
        </div>
      ))}
      <div className="rounded-lg border border-border bg-card/60 p-2 text-[10px] text-muted-foreground">
        Next: <span className="text-foreground">Live tutoring · 4:00 PM</span>
      </div>
    </div>
  );
}

function ClassroomPanel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1.5 text-destructive">
          <Radio className="h-3 w-3" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" /> LIVE · Physics 101
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-3 w-3" /> 28
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-video rounded bg-gradient-primary"
            style={{ opacity: 0.4 + ((i * 7) % 5) * 0.12 }}
          />
        ))}
      </div>
      <div className="rounded-lg border border-border bg-card/60 p-2">
        <div className="mb-1.5 text-[10px] text-muted-foreground">Whiteboard</div>
        <svg viewBox="0 0 200 40" className="h-10 w-full">
          <path d="M4 30 C40 4, 70 36, 110 14 S170 8, 196 24" fill="none" stroke="var(--mint)" strokeWidth="2" />
          <path d="M4 36 C50 26, 90 32, 196 30" fill="none" stroke="var(--primary-glow)" strokeWidth="1.5" opacity="0.7" />
        </svg>
      </div>
      <div className="flex items-center justify-center gap-2">
        {[Mic, MonitorPlay, Hand, TrendingUp].map((Icon, i) => (
          <span
            key={i}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card/70 text-muted-foreground"
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        ))}
      </div>
    </div>
  );
}

function AdminPanel() {
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { l: "Students", v: "2,418" },
          { l: "Tutors", v: "186" },
          { l: "Revenue", v: "$84k" },
          { l: "Retention", v: "96%" },
        ].map((s) => (
          <div key={s.l} className="rounded-lg border border-border bg-card/60 p-1.5">
            <div className="text-[9px] uppercase text-muted-foreground">{s.l}</div>
            <div className="text-xs font-semibold">{s.v}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-card/60 p-2">
        <div className="mb-1 text-[10px] text-muted-foreground">Engagement</div>
        <div className="flex h-10 items-end gap-1">
          {[30, 50, 42, 68, 55, 72, 88].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-gradient-mint opacity-80" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
