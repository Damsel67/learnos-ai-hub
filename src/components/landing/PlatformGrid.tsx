import {
  Video, Brain, BookOpen, ClipboardCheck, MessagesSquare, CalendarClock, Users2, Settings2, BarChart3,
} from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";

const groups = [
  { icon: Brain, title: "AI Classroom Intelligence", items: ["Face attention tracking", "Participation analytics", "Speaking time", "Engagement score", "Emotion trends", "Automatic attendance"] },
  { icon: Video, title: "Live Interactive Classrooms", items: ["HD Video", "Interactive Whiteboard", "Screen Sharing", "Polls", "Breakout Rooms", "Session Recording"] },
  { icon: BookOpen, title: "Course Management", items: ["Courses", "Modules", "Lessons", "Assignments", "Learning Resources", "Certificates"] },
  { icon: ClipboardCheck, title: "Assessment Engine", items: ["Quiz Builder", "AI Question Generator", "Auto Grading", "Exams", "Rubrics", "Analytics"] },
  { icon: MessagesSquare, title: "Communication Hub", items: ["Chat", "Announcements", "Parent Messaging", "Email", "SMS", "WhatsApp Integration"] },
  { icon: CalendarClock, title: "Smart Scheduling", items: ["Calendar", "Tutor Matching", "Timezone Detection", "Conflict Detection", "Recurring Sessions", "Automated Reminders"] },
  { icon: Users2, title: "Parent Portal", items: ["Progress Reports", "Attendance", "Homework", "Payments", "Messages", "Session Recordings"] },
  { icon: Settings2, title: "Admin Console", items: ["User Management", "Role Permissions", "Reports", "Finance", "Audit Logs", "System Settings"] },
  { icon: BarChart3, title: "Analytics", items: ["Student Performance", "Tutor Performance", "Revenue", "Attendance", "Engagement", "Growth Reports"] },
];

export function PlatformGrid() {
  return (
    <section id="platform" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Platform"
          title="Everything You Need to"
          accent="Run Learning"
          subtitle="Nine deeply integrated products replacing the patchwork of tools schools use today."
        />


        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((g, i) => (
            <Reveal key={g.title} delay={(i % 3) * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card">
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-soft text-primary ring-1 ring-border transition-transform duration-300 group-hover:scale-110">
                  <g.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{g.title}</h3>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {g.items.map((it) => (
                    <span
                      key={it}
                      className="rounded-full border border-border bg-surface/70 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors group-hover:border-primary/25 group-hover:text-foreground"
                    >
                      {it}
                    </span>
                  ))}
                </div>
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-primary opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-25" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
