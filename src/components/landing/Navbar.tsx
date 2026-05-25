import { Button } from "@/components/ui/button";
import { LogoMark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const links = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "How it Works", href: "#how" },
    { label: "Login", href: "#login" },
  ];
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow ring-1 ring-white/10">
            <LogoMark className="h-4 w-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">LearnOS</span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" className="hidden md:inline-flex" size="sm">Sign in</Button>
          <Button size="sm" className="bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-95">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
