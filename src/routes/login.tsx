import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Divider, Field, FormAlert, PasswordInput, SocialButtons, SubmitButton } from "@/components/auth/fields";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { friendlyAuthError } from "@/lib/auth-errors";
import { destinationFor, type Profile } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in to LearnOS — The Smart Learning Operating System" },
      { name: "description", content: "Sign in to your LearnOS account to access live classes, AI classroom intelligence and your learning dashboards." },
      { property: "og:title", content: "Sign in to LearnOS" },
      { property: "og:description", content: "Access your LearnOS classrooms, dashboards and AI learning tools." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const valid = emailValid && password.length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid || loading) return;
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        const msg = friendlyAuthError(signInError.message);
        setError(msg);
        if (msg.startsWith("Please verify")) {
          navigate({ to: "/verify-email", search: { email } });
        }
        setLoading(false);
        return;
      }
      if (remember) {
        try { localStorage.setItem("learnos-remember-email", email); } catch { /* ignore */ }
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, account_type, onboarding_completed")
        .eq("id", data.user!.id)
        .maybeSingle();
      setNotice("Signed in successfully. Redirecting…");
      navigate({ to: destinationFor((profile as Profile | null) ?? null) as never });
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your LearnOS account."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Get Started
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {error && <FormAlert tone="error">{error}</FormAlert>}
        {notice && <FormAlert tone="success">{notice}</FormAlert>}

        <Field id="email" label="Email address" error={touched && !emailValid ? "Enter a valid email address." : undefined}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@school.edu"
            value={email}
            aria-invalid={touched && !emailValid ? true : undefined}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field id="password" label="Password" error={touched && !password ? "Enter your password." : undefined}>
          <PasswordInput id="password" value={password} onChange={setPassword} invalid={touched && !password} />
        </Field>

        <div className="flex items-center justify-between gap-3 pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <div className="pt-2">
          <SubmitButton loading={loading} loadingLabel="Signing in..." disabled={!valid}>
            Sign In <ArrowRight className="h-4 w-4" />
          </SubmitButton>
        </div>
      </form>

      <Divider />
      <SocialButtons onError={setError} />
    </AuthShell>
  );
}
