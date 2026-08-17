import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
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
      </main>
    </div>
  );
}
