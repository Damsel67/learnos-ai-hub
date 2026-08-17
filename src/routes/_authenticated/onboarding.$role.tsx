import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormAlert } from "@/components/auth/fields";

export const Route = createFileRoute("/_authenticated/onboarding/$role")({
  component: OnboardingPage,
  head: () => ({
    meta: [
      { title: "Finish setting up LearnOS" },
      { name: "description", content: "Complete a few quick steps to tailor your LearnOS workspace to how you teach or learn." },
      { property: "og:title", content: "Finish setting up LearnOS" },
      { property: "og:description", content: "Complete your LearnOS account setup." },
    ],
  }),
});

const copy: Record<string, { title: string; steps: string[] }> = {
  student: { title: "Welcome, learner", steps: ["Join your first class", "Set your study goals", "Turn on AI study help"] },
  parent: { title: "Welcome, parent", steps: ["Link your child's account", "Choose progress updates", "Set notification preferences"] },
  tutor: { title: "Welcome, tutor", steps: ["Create your first class", "Upload course material", "Enable AI lesson planning"] },
  organization: { title: "Welcome to LearnOS", steps: ["Add your organization details", "Invite tutors and staff", "Configure academic terms"] },
};

function OnboardingPage() {
  const { role } = useParams({ from: "/_authenticated/onboarding/$role" });
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const content = copy[role] ?? copy['student']!;

  async function finish() {
    if (!user || loading) return;
    setLoading(true);
    setError(null);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);
    if (updateError) {
      setError("We couldn't save your setup. Please try again.");
      setLoading(false);
      return;
    }
    await refreshProfile();
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <AuthShell title={content.title} subtitle="A few quick steps to tailor LearnOS to you.">
      <div className="space-y-5">
        {error && <FormAlert tone="error">{error}</FormAlert>}
        <ul className="space-y-3">
          {content.steps.map((step) => (
            <li key={step} className="flex items-center gap-3 rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-secondary" />
              {step}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => void finish()}
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-95 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Go to dashboard"} <ArrowRight className="h-4 w-4" />
        </button>
        <p className="text-center text-sm text-muted-foreground">
          <Link to="/dashboard" className="font-medium text-primary hover:underline">
            Skip for now
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
