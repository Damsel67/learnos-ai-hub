import { GraduationCap, Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  const cols = [
    { title: "Product", links: ["Features", "Pricing", "How it Works", "Changelog"] },
    { title: "Company", links: ["About LearnOS", "Contact", "Careers", "Blog"] },
    { title: "Legal", links: ["Terms", "Privacy", "Security", "Cookies"] },
  ];
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </span>
              <span className="text-lg font-semibold">LearnOS</span>
            </a>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              The smart learning operating system for modern education.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground">
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
                    <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} LearnOS, Inc. All rights reserved.</span>
          <span>Made for educators, students and parents.</span>
        </div>
      </div>
    </footer>
  );
}
