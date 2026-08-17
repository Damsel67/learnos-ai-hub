import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Building2, GraduationCap, Users, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  Divider,
  Field,
  FormAlert,
  PasswordChecklist,
  PasswordInput,
  SocialButtons,
  SubmitButton,
  isStrongPassword,
} from "@/components/auth/fields";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { friendlyAuthError } from "@/lib/auth-errors";
import type { AccountType } from "@/hooks/use-auth";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({
    meta: [
      { title: "Create your LearnOS account — Smart Learning OS" },
      { name: "description", content: "Create a LearnOS account as a student, parent, tutor or school and start building a smarter learning experience today." },
      { property: "og:title", content: "Create your LearnOS account" },
      { property: "og:description", content: "Sign up as a student, parent, tutor or organization on LearnOS." },
    ],
  }),
});

const accountTypes: { value: AccountType; label: string; desc: string; Icon: typeof Users }[] = [
  { value: "student", label: "Student", desc: "Learn, practice and track your progress.", Icon: GraduationCap },
  { value: "parent", label: "Parent", desc: "Manage your child's learning and progress.", Icon: UserRound },
  { value: "tutor", label: "Tutor", desc: "Teach, manage classes and track learners.", Icon: Users },
  { value: "organization", label: "School / Organization", desc: "Manage your institution, tutors and learners.", Icon: Building2 },
];

function SignupPage() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<AccountType>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const nameValid = fullName.trim().length >= 2;
  const strong = isStrongPassword(password);
  const matches = password.length > 0 && password === confirm;
  const valid = nameValid && emailValid && strong && matches && agreed;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: fullName.trim(), account_type: accountType },
        },
      });
      if (signUpError) {
        setError(friendlyAuthError(signUpError.message));
        setLoading(false);
        return;
      }
      if (!data.session) {
        navigate({ to: "/verify-email", search: { email } });
        return;
      }
      navigate({ to: "/onboarding/$role", params: { role: accountType } });
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      wide
      title="Create your LearnOS account"
      subtitle="Start building a smarter learning experience today."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign In
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {error && <FormAlert tone="error">{error}</FormAlert>}

        <div>
          <p className="mb-3 text-sm font-medium">What type of account are you creating?</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {accountTypes.map(({ value, label, desc, Icon }) => {
              const active = accountType === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setAccountType(value)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    active
                      ? "border-primary bg-accent/60 shadow-glow"
                      : "border-border bg-surface/50 hover:border-primary/40"
                  }`}
                >
                  <span
                    className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${
                      active ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="fullName" label="Full name" error={touched && !nameValid ? "Enter your full name." : undefined}>
            <Input
              id="fullName"
              autoComplete="name"
              placeholder="Ada Obi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              aria-invalid={touched && !nameValid ? true : undefined}
            />
          </Field>
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
          <Field id="password" label="Password" error={touched && !strong ? "Password does not meet the requirements." : undefined}>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              invalid={touched && !strong}
            />
          </Field>
          <Field id="confirm" label="Confirm password" error={touched && !matches ? "Passwords do not match." : undefined}>
            <PasswordInput
              id="confirm"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
              invalid={touched && !matches}
            />
          </Field>
        </div>

        <PasswordChecklist value={password} />

        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground">
          <Checkbox className="mt-0.5" checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
          <span>
            I agree to the <span className="text-foreground underline">Terms of Service</span> and{" "}
            <span className="text-foreground underline">Privacy Policy</span>
          </span>
        </label>

        <SubmitButton loading={loading} loadingLabel="Creating account..." disabled={!valid}>
          Create Account <ArrowRight className="h-4 w-4" />
        </SubmitButton>
      </form>

      <Divider />
      <SocialButtons onError={setError} intent="Continue" />
    </AuthShell>
  );
}
