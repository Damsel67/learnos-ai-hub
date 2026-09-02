import { Twitter, Github, Linkedin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { LogoMark } from "./Logo";
import { CustomerCareModal } from "./CustomerCareModal";

type FooterLink = { label: string; to?: string; href?: string; care?: boolean };

const cols: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Platform", href: "/#platform" },
      { label: "Live Classrooms", href: "/#platform" },
      { label: "Courses", href: "/#platform" },
      { label: "Assessments", href: "/#platform" },
      { label: "Communication", href: "/#platform" },
      { label: "AI Classroom", href: "/#ai" },
      { label: "Analytics", href: "/#why" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Schools", href: "/#solutions" },
      { label: "Tutoring Companies", href: "/#solutions" },
      { label: "Universities", href: "/#solutions" },
      { label: "Corporate Training", href: "/#solutions" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/#faq" },
      { label: "API", href: "/#faq" },
      { label: "Help Center", care: true },
      { label: "Blog", href: "/#faq" },
      { label: "Community", care: true },
      { label: "Status", href: "/#why" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#why" },
      { label: "Careers", care: true },
      { label: "Contact", care: true },
      { label: "Roadmap", href: "/#faq" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", to: "/login" },
      { label: "Create Account", to: "/signup" },
      { label: "Forgot Password", to: "/forgot-password" },
      { label: "Talk to Sales", care: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/#faq" },
      { label: "Privacy", href: "/#faq" },
      { label: "Security", href: "/#why" },
      { label: "Cookies", href: "/#faq" },
    ],
  },
];

const linkClass = "text-left text-sm text-muted-foreground transition-colors hover:text-foreground";

function FooterItem({ link }: { link: FooterLink }) {
  if (link.care) {
    return (
      <CustomerCareModal>
        <button type="button" className={linkClass}>
          {link.label}
        </button>
      </CustomerCareModal>
    );
  }
  if (link.to) {
    return (
      <Link to={link.to} className={linkClass}>
        {link.label}
      </Link>
    );
  }
  return (
    <a href={link.href} className={linkClass}>
      {link.label}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/60 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-3 lg:grid-cols-8">
          <div className="md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow ring-1 ring-border">
                <LogoMark className="h-4 w-4" />
              </span>
              <span className="text-lg font-semibold">LearnOS</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              The AI operating system for modern education — live classrooms, learning management, automation and
              analytics for schools, tutoring companies and training organizations.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="https://wa.me/2349165621724"
                  target="_blank"
                  rel="noopener noreferrer"
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
                  <li key={l.label}>
                    <FooterItem link={l} />
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
