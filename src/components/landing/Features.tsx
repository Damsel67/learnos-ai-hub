import { Brain, Video, CalendarClock, BookOpen, LineChart, Users } from "lucide-react";

const features = [
  { icon: Brain, title: "AI Classroom Monitoring", desc: "Real-time focus, sentiment and participation analytics powered by on-device AI." },
  { icon: Video, title: "Live Interactive Sessions", desc: "HD virtual classrooms with whiteboard, breakouts, polls and recording." },
  { icon: CalendarClock, title: "Smart Scheduling System", desc: "Auto-optimized timetables across tutors, students and timezones." },
  { icon: BookOpen, title: "Course Management", desc: "Build curricula, assignments and resources with a Notion-like editor." },
  { icon: LineChart, title: "Student Progress Tracking", desc: "Mastery-based insights and personalized learning paths." },
  { icon: Users, title: "Parent Reporting", desc: "Weekly digests, milestone alerts and direct messaging with tutors." },
];

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-primary">Features</span>
          <h2 className="mt-3 text-4xl font-semibold md:text-5xl">
            Everything you need to <span className="font-display italic text-gradient">run learning</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            One platform for tutors, students, parents and administrators — built for modern education.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-soft text-primary ring-1 ring-border">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-primary opacity-0 blur-3xl transition-opacity group-hover:opacity-20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
