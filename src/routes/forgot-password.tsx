import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Field, FormAlert, SubmitButton } from "@/components/auth/fields";
import { Input } from "@/components/ui/input";
import { friendlyAuthError } from "@/lib/auth-errors";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [
      { title: "Reset your LearnOS password" },
      { name: "description", content: "Enter your email address and we'll send you a secure link to reset your LearnOS password." },
      { property: "og:title", content: "Reset your LearnOS password" },
      { property: "og:description", content: "Request a secure password reset link for your LearnOS account." },
    ],
  }),
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!emailValid || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        setError(friendlyAuthError(resetError.message));
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle="We've sent password reset instructions to your email address.">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-mint text-background">
            <MailCheck className="h-5 w-5" />
          </span>
          <p className="text-sm text-muted-foreground">
            Sent to <span className="font-medium text-foreground">{email}</span>. The link expires in 60 minutes.
          </p>
          <Link
            to="/login"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95"
          >
            Back to Sign In
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      footer={
        <>
          Remember your password?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to Sign In
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {error && <FormAlert tone="error">{error}</FormAlert>}
        <Field id="email" label="Email address" error={touched && !emailValid ? "Enter a valid email address." : undefined}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={touched && !emailValid ? true : undefined}
          />
        </Field>
        <SubmitButton loading={loading} loadingLabel="Sending..." disabled={!emailValid}>
          Send Reset Link
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
