import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  Field,
  FormAlert,
  PasswordChecklist,
  PasswordInput,
  SubmitButton,
  isStrongPassword,
} from "@/components/auth/fields";
import { friendlyAuthError } from "@/lib/auth-errors";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Create a new password — LearnOS" },
      { name: "description", content: "Choose a new, secure password for your LearnOS account and get back to teaching and learning." },
      { property: "og:title", content: "Create a new password — LearnOS" },
      { property: "og:description", content: "Set a new secure password for your LearnOS account." },
    ],
  }),
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const strong = isStrongPassword(password);
  const matches = password.length > 0 && password === confirm;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!strong || !matches || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(friendlyAuthError(updateError.message));
        setLoading(false);
        return;
      }
      await supabase.auth.signOut();
      setDone(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <AuthShell title="Password updated successfully." subtitle="You can now sign in with your new password.">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-mint text-background">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <Link
            to="/login"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95"
          >
            Sign In
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create a new password"
      subtitle="Choose a strong password you haven't used before."
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to Sign In
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {error && <FormAlert tone="error">{error}</FormAlert>}
        <Field id="password" label="New password" error={touched && !strong ? "Password does not meet the requirements." : undefined}>
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="new-password" invalid={touched && !strong} />
        </Field>
        <Field id="confirm" label="Confirm new password" error={touched && !matches ? "Passwords do not match." : undefined}>
          <PasswordInput id="confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" invalid={touched && !matches} />
        </Field>
        <PasswordChecklist value={password} />
        <SubmitButton loading={loading} loadingLabel="Resetting..." disabled={!strong || !matches}>
          Reset Password
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
