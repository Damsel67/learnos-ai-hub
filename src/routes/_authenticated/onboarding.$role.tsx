import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { OrgForm, orgTypeFromCustomer } from "@/components/org/OrgForm";
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
  const { profile } = useAuth();
  const needsOrgCheck = role === "organization" && profile?.account_type === "organization";
  const [orgState, setOrgState] = useState<"checking" | "setup" | "ready">("checking");
  const [customerType, setCustomerType] = useState<string | null>(null);

  useEffect(() => {
    if (!needsOrgCheck || !user) {
      setOrgState("ready");
      return;
    }
    void (async () => {
      const [{ data: org }, { data: p }] = await Promise.all([
        supabase.rpc("my_organization"),
        supabase.from("profiles").select("customer_type").eq("id", user.id).maybeSingle(),
      ]);
      setCustomerType(p?.customer_type ?? null);
      const o = org as { setup_completed?: boolean } | null;
      setOrgState(o?.setup_completed ? "ready" : "setup");
    })();
  }, [needsOrgCheck, user]);

  if (needsOrgCheck && orgState === "checking") {
    return (
      <AuthShell title="Setting up your workspace">
        <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      </AuthShell>
    );
  }

  if (needsOrgCheck && orgState === "setup") {
    return (
      <AuthShell
        title="Set up your organisation"
        subtitle="Tell us a little about your organisation to get your LearnOS workspace ready."
      >
        <OrgForm
          initial={{ name: "", org_type: orgTypeFromCustomer(customerType), country: "", website: "" }}
          submitLabel="Create Organisation"
          loadingLabel="Creating organisation..."
          onSubmit={async (v) => {
            const { error: rpcError } = await supabase.rpc("create_my_organization", {
              _name: v.name, _type: v.org_type, _country: v.country, _website: v.website,
            });
            if (rpcError) return rpcError.message;
            setOrgState("ready");
            return null;
          }}
        />
      </AuthShell>
    );
  }

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
