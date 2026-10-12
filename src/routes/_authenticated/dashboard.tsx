import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, CalendarClock, GraduationCap, Loader2, LogOut, Settings, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { OrgAdminShell } from "@/components/org/OrgAdminShell";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { LogoMark } from "@/components/landing/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Your LearnOS dashboard" },
      { name: "description", content: "Your personal LearnOS workspace for classes, assessments and AI insights." },
      { property: "og:title", content: "Your LearnOS dashboard" },
      { property: "og:description", content: "Your personal LearnOS workspace." },
    ],
  }),
});

function DashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  if (profile?.account_type === "organization") return <OrgOverview />;

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-surface/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <LogoMark />
          <Button variant="outline" size="sm" onClick={() => void signOut()} className="gap-2">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.
        </h1>
        <p className="mt-3 text-muted-foreground">
          You're signed in as <span className="text-foreground">{user?.email}</span>
          {profile?.account_type ? ` · ${profile.account_type} account` : ""}.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {["Live classrooms", "Courses & assessments", "AI insights"].map((title) => (
            <div key={title} className="rounded-2xl border border-border bg-surface/50 p-6 shadow-card backdrop-blur-xl">
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-2 text-sm text-muted-foreground">Coming soon to your workspace.</p>
            </div>
          ))}
        </div>

        {((profile?.account_type as string) === "organization" || profile?.account_type === "parent") && (
          <Link
            to="/settings/invitations"
            className="mt-8 inline-flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-4 py-2.5 text-sm font-medium hover:border-primary/40"
          >
            {profile?.account_type === "parent" ? "Learners → Invite Learner" : "Manage invitations"}
          </Link>
        )}
        {(profile?.account_type as string) === "organization" && (
          <Link
            to="/settings/organization"
            className="ml-3 mt-8 inline-flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-4 py-2.5 text-sm font-medium hover:border-primary/40"
          >
            Organisation settings
          </Link>
        )}
      </main>
    </div>
  );
}

type Org = { id: string; name: string; setup_completed: boolean } | null;
type Inv = { id: string; invitation_type: string; email: string; first_name: string | null; last_name: string | null; status: string; created_at: string; inviter_name: string | null };

function OrgOverview() {
  const { profile } = useAuth();
  const [org, setOrg] = useState<Org | undefined>(undefined);
  const [counts, setCounts] = useState<{ tutor: number; learner: number } | null>(null);
  const [acts, setActs] = useState<Inv[]>([]);
  const [err, setErr] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase.rpc("my_organization");
      if (error) { setErr(true); setOrg(null); return; }
      const o = data as unknown as Org;
      setOrg(o);
      if (!o) return;
      const [m, inv] = await Promise.all([
        supabase.from("organization_members").select("role").eq("organization_id", o.id).eq("status", "active"),
        supabase.rpc("list_my_invitations"),
      ]);
      if (m.error || inv.error) setErr(true);
      const rows = m.data ?? [];
      setCounts({ tutor: rows.filter((r) => r.role === "tutor").length, learner: rows.filter((r) => r.role === "learner").length });
      setActs(((inv.data ?? []) as Inv[]).slice(0, 8));
    })();
  }, []);

  if (org === undefined) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  if (!org || !org.setup_completed) {
    return (
      <OrgAdminShell orgName={null}>
        <div className="rounded-2xl border border-border bg-surface/50 p-8 text-center shadow-card backdrop-blur-xl">
          <h1 className="text-2xl font-semibold">Set up your organisation</h1>
          <p className="mt-2 text-muted-foreground">Finish your organisation profile to unlock the admin dashboard.</p>
          <Button asChild className="mt-6"><Link to="/onboarding/$role" params={{ role: "organization" }}>Set up organisation</Link></Button>
        </div>
      </OrgAdminShell>
    );
  }

  const first = profile?.full_name?.split(" ")[0];
  const stats = [
    { label: "Total Tutors", value: counts?.tutor, Icon: Users, section: "tutors" },
    { label: "Total Learners", value: counts?.learner, Icon: GraduationCap, section: "learners" },
    { label: "Active Courses", value: null, Icon: BookOpen, section: "courses" },
    { label: "Upcoming Sessions", value: null, Icon: CalendarClock, section: "sessions" },
  ];
  const actions = [
    { label: "Invite Tutor", invite: "tutor", Icon: Users },
    { label: "Invite Learner", invite: "learner", Icon: GraduationCap },
    { label: "Invite Administrator", invite: "admin", Icon: ShieldCheck },
  ];
  const card = "rounded-2xl border border-border bg-surface/50 shadow-card backdrop-blur-xl";

  return (
    <OrgAdminShell orgName={org.name}>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back{first ? `, ${first}` : ""}.</h1>
      <p className="mt-2 text-muted-foreground">Here's what's happening at {org.name}.</p>
      {err && <p className="mt-4 text-sm text-destructive">Some information couldn't be loaded. Please refresh.</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to="/org/$section" params={{ section: s.section }} className={`${card} p-5 transition hover:border-primary/40`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><s.Icon className="h-4 w-4" /></span>
            </div>
            {s.value === null ? (
              <p className="mt-4 text-sm text-muted-foreground">Not available yet</p>
            ) : (
              <p className="mt-3 text-3xl font-semibold tracking-tight">{s.value ?? "—"}</p>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className={`${card} p-6 lg:col-span-2`}>
          <h2 className="font-semibold">Recent activity</h2>
          {acts.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No activity yet. Invitations you send and accept will appear here.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border/70">
              {acts.map((a) => {
                const who = [a.first_name, a.last_name].filter(Boolean).join(" ") || a.email;
                const role = a.invitation_type === "admin" ? "administrator" : a.invitation_type;
                const text = a.status === "accepted" ? `${who} accepted the ${role} invitation` : `${role.charAt(0).toUpperCase() + role.slice(1)} invitation sent to ${who}`;
                return (
                  <li key={a.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span className="min-w-0 truncate">{text}{a.status !== "accepted" && a.status !== "pending" ? ` · ${a.status}` : ""}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={`${card} p-6`}>
          <h2 className="font-semibold">Quick actions</h2>
          <div className="mt-4 flex flex-col gap-2">
            {actions.map((a) => (
              <a key={a.label} href={`/settings/invitations?invite=${a.invite}`} className="flex items-center gap-3 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:border-primary/40">
                <a.Icon className="h-4 w-4 text-primary" /> {a.label}
              </a>
            ))}
            <Link to="/settings/organization" className="flex items-center gap-3 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:border-primary/40">
              <Settings className="h-4 w-4 text-primary" /> Manage Organisation
            </Link>
          </div>
        </section>
      </div>

      <section className={`${card} mt-6 p-6`}>
        <h2 className="font-semibold">Upcoming sessions</h2>
        <div className="mt-6 flex flex-col items-center py-6 text-center">
          <CalendarClock className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No sessions to show</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Class scheduling isn't available yet. Sessions will appear here once it launches.</p>
        </div>
      </section>
    </OrgAdminShell>
  );
}
