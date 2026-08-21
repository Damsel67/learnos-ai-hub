import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/landing/Logo";
import { ThemeToggle } from "@/components/landing/ThemeToggle";

export function AuthBrand({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  const mark = size === "sm" ? "h-4 w-4" : "h-6 w-6";
  const text = size === "sm" ? "text-lg" : "text-2xl";
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`flex ${box} items-center justify-center rounded-xl bg-gradient-primary shadow-glow ring-1 ring-border`}
      >
        <LogoMark className={mark} />
      </span>
      <span className={`${text} font-semibold tracking-tight`}>LearnOS</span>
    </span>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  wide,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-hero">
      <div className="pointer-events-none absolute left-1/4 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-primary opacity-20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute bottom-0 right-1/5 h-72 w-72 rounded-full bg-gradient-mint opacity-15 blur-3xl animate-float-slower" />

      <header className="relative z-10 border-b border-border/60 bg-background/40 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="LearnOS home">
            <AuthBrand size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-lg border border-border bg-card/70 px-3 py-2 text-sm font-medium text-muted-foreground shadow-soft backdrop-blur-xl transition-colors hover:border-primary/40 hover:text-foreground sm:inline-flex"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to website
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
        <div className={`w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>
          <div className="mb-7 flex flex-col items-center text-center">
            <AuthBrand />
            <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            {subtitle && (
              <p className="mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground">{subtitle}</p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8">
            {children}
          </div>

          {footer && <div className="mt-6 text-center text-[0.9375rem] text-muted-foreground">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
