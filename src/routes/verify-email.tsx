import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormAlert, SubmitButton } from "@/components/auth/fields";
import { OtpInput } from "@/components/auth/OtpInput";
import { VerificationSuccess } from "@/components/auth/VerificationStates";
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
      { name: "description", content: "Confirm your email address with a verification link or 6-digit code to activate your LearnOS account." },
      { property: "og:title", content: "Verify your email — LearnOS" },
      { property: "og:description", content: "Confirm your email address to activate your LearnOS account." },
    ],
  }),
});

function VerifyEmailPage() {
  const { email } = Route.useSearch();
  const [seconds, setSeconds] = useState(45);
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  async function verify(value: string) {
    if (!email || verifying || value.length !== 6) return;
    setVerifying(true);
    setCodeError(null);
    setError(null);
    setNotice(null);
    try {
      const { error: otpError } = await supabase.auth.verifyOtp({ email, token: value, type: "signup" });
      if (otpError) {
        const retry = await supabase.auth.verifyOtp({ email, token: value, type: "email" });
        if (retry.error) {
          const m = (otpError.message ?? "").toLowerCase();
          setCodeError(
            m.includes("expired")
              ? "That code has expired. Request a new verification email below."
              : "That code is incorrect. Please check the code and try again.",
          );
          setVerifying(false);
          return;
        }
      }
      setVerified(true);
    } catch {
      setCodeError("Network error. Please check your connection and try again.");
      setVerifying(false);
    }
  }

  async function resend() {
    if (!email || seconds > 0 || sending) return;
    setSending(true);
    setError(null);
    setNotice(null);
    setCodeError(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?flow=verify` },
      });
      if (resendError) setError(friendlyAuthError(resendError.message));
      else {
        setNotice("New verification code and verification link sent. Check your inbox and spam folder.");
        setSeconds(45);
        setCode("");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    }
    setSending(false);
  }

  if (verified) {
    return (
      <AuthShell title="Verify your email" subtitle="Your LearnOS account is ready.">
        <VerificationSuccess />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle="We've sent a verification link and a 6-digit verification code to your email."
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

        <form
          className="w-full space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void verify(code);
          }}
        >
          <div className="space-y-3">
            <p className="text-sm font-medium">Enter verification code</p>
            <OtpInput
              value={code}
              onChange={(v) => {
                setCode(v);
                setCodeError(null);
              }}
              invalid={!!codeError}
              disabled={verifying}
              onComplete={(v) => void verify(v)}
            />
            {codeError && <FormAlert tone="error">{codeError}</FormAlert>}
          </div>

          <SubmitButton loading={verifying} loadingLabel="Verifying..." disabled={code.length !== 6 || !email}>
            Verify Email
          </SubmitButton>
        </form>

        <div className="w-full space-y-2 border-t border-border pt-5">
          <p className="text-sm text-muted-foreground">Didn't receive the email?</p>
          <button
            type="button"
            onClick={() => void resend()}
            disabled={seconds > 0 || sending || !email}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-card/70 text-sm font-semibold backdrop-blur-xl transition-colors hover:border-primary/40 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Sending..." : seconds > 0 ? `Resend available in ${seconds}s` : "Resend verification email"}
          </button>
        </div>

        <Link to="/signup" className="text-sm font-medium text-primary hover:underline">
          Change email address
        </Link>
      </div>
    </AuthShell>
  );
}
