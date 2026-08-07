import { Twitter, Github, Linkedin } from "lucide-react";
import { LogoMark } from "./Logo";

const cols = [
  { title: "Products", links: ["Learning Platform", "AI Classroom", "Courses", "Assessments", "Communication", "Automation", "Analytics"] },
  { title: "Company", links: ["About", "Blog", "Roadmap", "Careers", "Contact"] },
  { title: "Resources", links: ["Documentation", "API", "Help Center", "Community", "Status"] },
  { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Security"] },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/60 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-6">
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow ring-1 ring-border">
                <LogoMark className="h-4 w-4" />
              </span>
              <span className="text-lg font-semibold">LearnOS</span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              The AI operating system for modern education — live classrooms, learning management, automation and
              analytics for schools, tutoring companies and training organizations.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-sm font-semibold">{c.title}</div>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} LearnOS, Inc. All rights reserved.</span>
          <span>SOC 2 Type II · GDPR ready · 99.99% uptime</span>
        </div>
      </div>
    </footer>
  );
}
