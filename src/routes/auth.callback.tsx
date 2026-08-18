import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormAlert } from "@/components/auth/fields";
import { VerificationSuccess } from "@/components/auth/VerificationStates";
import { destinationFor, type Profile } from "@/hooks/use-auth";

type Search = { flow?: string };

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): Search => ({
    flow: typeof search['flow'] === "string" ? search['flow'] : undefined,
  }),
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

type State =
  | { kind: "loading" }
  | { kind: "verified" }
  | { kind: "already" }
  | { kind: "expired" }
  | { kind: "error" };

function CallbackPage() {
  const navigate = useNavigate();
  const { flow } = Route.useSearch();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    const errorCode = hash.get("error_code") ?? query.get("error_code") ?? hash.get("error") ?? query.get("error");
    const linkType = hash.get("type") ?? query.get("type");
    const isVerifyFlow = flow === "verify" || linkType === "signup" || linkType === "email";

    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      const user = data.session?.user;

      if (errorCode) {
        if (user?.email_confirmed_at) setState({ kind: "already" });
        else setState({ kind: isVerifyFlow || /otp|expired|access_denied/i.test(errorCode) ? "expired" : "error" });
        return;
      }

      if (!user) {
        setState({ kind: isVerifyFlow ? "expired" : "error" });
        return;
      }

      if (isVerifyFlow) {
        setState({ kind: "verified" });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, account_type, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      navigate({ to: destinationFor((profile as Profile | null) ?? null) as never, replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, flow]);

  if (state.kind === "verified") {
    return (
      <AuthShell title="Verify your email" subtitle="Your LearnOS account is ready.">
        <VerificationSuccess />
      </AuthShell>
    );
  }

  if (state.kind === "already") {
    return (
      <AuthShell title="Verify your email" subtitle="Nothing more to do here.">
        <VerificationSuccess
          title="Email already verified"
          lines={["Your email address has already been verified."]}
        />
      </AuthShell>
    );
  }

  if (state.kind === "expired" || state.kind === "error") {
    const expired = state.kind === "expired";
    return (
      <AuthShell
        title={expired ? "Verification link expired" : "Sign-in couldn't be completed"}
        subtitle={
          expired
            ? "This verification link is no longer valid. Please request a new verification email."
            : "The link may have expired — please try again."
        }
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/40 bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <FormAlert tone="error">
            {expired
              ? "This verification link is no longer valid. Please request a new verification email."
              : "We couldn't complete sign-in."}
          </FormAlert>
          <button
            type="button"
            onClick={() => navigate({ to: expired ? "/verify-email" : "/login", search: expired ? {} : undefined })}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95"
          >
            {expired ? "Send New Verification Email" : "Back to Sign In"}
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Signing you in" subtitle="Hold tight while we finish setting up your session.">
      <div className="flex justify-center py-6">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    </AuthShell>
  );
}
