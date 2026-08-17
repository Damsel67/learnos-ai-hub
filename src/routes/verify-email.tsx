import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormAlert } from "@/components/auth/fields";
import { friendlyAuthError } from "@/lib/auth-errors";

type Search = { email?: string };

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    email: typeof search['email'] === "string" ? search['email'] : undefined,
  }),
  component: VerifyEmailPage,
  head: () => ({
    meta: [
      { title: "Verify your email — LearnOS" },
      { name: "description", content: "Confirm your email address to activate your LearnOS account and access your dashboards." },
      { property: "og:title", content: "Verify your email — LearnOS" },
      { property: "og:description", content: "Confirm your email address to activate your LearnOS account." },
    ],
  }),
});

function VerifyEmailPage() {
  const { email } = Route.useSearch();
  const [seconds, setSeconds] = useState(45);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  async function resend() {
    if (!email || seconds > 0 || sending) return;
    setSending(true);
    setError(null);
    setNotice(null);
    try {
      const { error: resendError } = await supabase.auth.resend({ type: "signup", email });
      if (resendError) setError(friendlyAuthError(resendError.message));
      else {
        setNotice("Verification email sent. Check your inbox and spam folder.");
        setSeconds(45);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    }
    setSending(false);
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle="We've sent a verification link to your email address."
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to Sign In
        </Link>
      }
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
          <MailCheck className="h-5 w-5" />
        </span>

        <div className="w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Sent to </span>
          <span className="font-medium">{email ?? "your email address"}</span>
        </div>

        {error && <FormAlert tone="error">{error}</FormAlert>}
        {notice && <FormAlert tone="success">{notice}</FormAlert>}

        <button
          type="button"
          onClick={() => void resend()}
          disabled={seconds > 0 || sending || !email}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "Sending..." : seconds > 0 ? `Resend Verification Email (${seconds}s)` : "Resend Verification Email"}
        </button>

        <Link to="/signup" className="text-sm font-medium text-primary hover:underline">
          Change email address
        </Link>
      </div>
    </AuthShell>
  );
}
