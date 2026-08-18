import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormAlert } from "@/components/auth/fields";
import { destinationFor, type Profile } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  component: CallbackPage,
  head: () => ({
    meta: [
      { title: "Signing you in — LearnOS" },
      { name: "description", content: "Completing your secure LearnOS sign-in and taking you to your workspace." },
      { property: "og:title", content: "Signing you in — LearnOS" },
      { property: "og:description", content: "Completing your secure LearnOS sign-in." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function CallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (cancelled) return;
      if (sessionError || !data.session) {
        setError("We couldn't complete sign-in. The link may have expired — please try again.");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, account_type, onboarding_completed")
        .eq("id", data.session.user.id)
        .maybeSingle();
      if (cancelled) return;
      navigate({ to: destinationFor((profile as Profile | null) ?? null) as never, replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <AuthShell title="Signing you in" subtitle="Hold tight while we finish setting up your session.">
      {error ? (
        <div className="space-y-4">
          <FormAlert tone="error">{error}</FormAlert>
          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95"
          >
            Back to Sign In
          </button>
        </div>
      ) : (
        <div className="flex justify-center py-6">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
      )}
    </AuthShell>
  );
}
