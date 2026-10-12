import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  BarChart3, BookOpen, CalendarClock, GraduationCap, LayoutDashboard, LogOut, Mail, Menu,
  PanelLeftClose, PanelLeftOpen, Settings, UserCog, Users,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { LogoMark } from "@/components/landing/Logo";
import { ThemeToggle } from "@/components/landing/ThemeToggle";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const orgSections = {
  users: { title: "User Management", desc: "Manage every administrator, tutor and learner in your organisation.", Icon: UserCog },
  tutors: { title: "Tutors", desc: "View and manage the tutors in your organisation.", Icon: Users },
  learners: { title: "Learners", desc: "View and manage the learners in your organisation.", Icon: GraduationCap },
  courses: { title: "Courses", desc: "Create and organise your organisation's courses.", Icon: BookOpen },
  sessions: { title: "Classes & Sessions", desc: "Schedule and run group classes and private sessions.", Icon: CalendarClock },
  reports: { title: "Reports & Analytics", desc: "Track attendance, progress and engagement across your organisation.", Icon: BarChart3 },
} as const;
export type OrgSection = keyof typeof orgSections;

type NavItem = { label: string; Icon: typeof Users; to: string; params?: { section: string } };
const nav: NavItem[] = [
  { label: "Overview", Icon: LayoutDashboard, to: "/dashboard" },
  { label: "User Management", Icon: UserCog, to: "/org/$section", params: { section: "users" } },
  { label: "Tutors", Icon: Users, to: "/org/$section", params: { section: "tutors" } },
  { label: "Learners", Icon: GraduationCap, to: "/org/$section", params: { section: "learners" } },
  { label: "Courses", Icon: BookOpen, to: "/org/$section", params: { section: "courses" } },
  { label: "Classes & Sessions", Icon: CalendarClock, to: "/org/$section", params: { section: "sessions" } },
  { label: "Invitations", Icon: Mail, to: "/settings/invitations" },
  { label: "Reports & Analytics", Icon: BarChart3, to: "/org/$section", params: { section: "reports" } },
  { label: "Organisation Settings", Icon: Settings, to: "/settings/organization" },
];

function NavList({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {nav.map((n) => {
        const href = n.params ? n.to.replace("$section", n.params.section) : n.to;
        const active = path === href;
        return (
          <Link
            key={n.label}
            to={n.to as "/dashboard"}
            params={n.params as never}
            onClick={onNavigate}
            title={collapsed ? n.label : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-surface hover:text-foreground"
            } ${collapsed ? "justify-center px-0" : ""}`}
          >
            <n.Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{n.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function OrgAdminShell({ orgName, children }: { orgName: string | null; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const name = profile?.full_name || user?.email || "Administrator";

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border/70 bg-surface/40 p-3 backdrop-blur-xl transition-[width] md:flex ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className={`mb-6 flex items-center gap-2 px-2 pt-2 ${collapsed ? "justify-center px-0" : ""}`}>
          <Link to="/" aria-label="LearnOS home"><LogoMark className="h-6 w-6" /></Link>
          {!collapsed && <span className="text-sm font-semibold tracking-tight">LearnOS</span>}
        </div>
        <NavList collapsed={collapsed} />
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="mt-auto flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /> Collapse</>}
        </button>
      </aside>

      <Sheet open={mobile} onOpenChange={setMobile}>
        <SheetContent side="left" className="w-72 p-4">
          <SheetTitle className="mb-6 flex items-center gap-2 text-sm"><LogoMark className="h-6 w-6" /> LearnOS</SheetTitle>
          <NavList onNavigate={() => setMobile(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/70 bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <button className="rounded-lg p-2 hover:bg-surface md:hidden" onClick={() => setMobile(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">Organisation</p>
            <p className="truncate text-base font-semibold">{orgName ?? "Your organisation"}</p>
          </div>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-semibold text-primary-foreground">
              {name.charAt(0).toUpperCase()}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">{name}<p className="truncate text-xs font-normal text-muted-foreground">{user?.email}</p></DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/settings/organization" })}><Settings className="mr-2 h-4 w-4" /> Organisation settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => void signOut()}><LogOut className="mr-2 h-4 w-4" /> Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
