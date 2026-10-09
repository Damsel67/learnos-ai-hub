import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { accountTypeForInvite, inviteLabel, readPendingInvite, type PendingInvite } from "@/lib/invite";
import { ArrowLeft, ArrowRight, Briefcase, Building2, GraduationCap, Presentation, Users, UserRound } from "lucide-react";
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

type SignupKind = "institution" | "tutoring_company" | "independent_tutor" | "parent" | "student" | "training_org";

const kinds: { value: SignupKind; label: string; desc: string; Icon: typeof Users; accountType: AccountType }[] = [
  { value: "institution", label: "Institution / School", desc: "Manage your institution, tutors and learners.", Icon: Building2, accountType: "organization" },
  { value: "tutoring_company", label: "Tutoring Company", desc: "Run your tutoring business, tutors and clients.", Icon: Briefcase, accountType: "organization" },
  { value: "independent_tutor", label: "Independent Tutor", desc: "Teach, manage classes and track learners.", Icon: Users, accountType: "tutor" },
  { value: "parent", label: "Parent", desc: "Manage your child's learning and progress.", Icon: UserRound, accountType: "parent" },
  { value: "student", label: "Student", desc: "Learn, practice and track your progress.", Icon: GraduationCap, accountType: "student" },
  { value: "training_org", label: "Training Organization", desc: "Deliver professional training at scale.", Icon: Presentation, accountType: "organization" },
];

const kindValues = kinds.map((k) => k.value) as [SignupKind, ...SignupKind[]];

export const Route = createFileRoute("/signup")({
  validateSearch: (s: Record<string, unknown>): { type?: SignupKind } =>
    typeof s.type === "string" && (kindValues as string[]).includes(s.type) ? { type: s.type as SignupKind } : {},
  component: SignupPage,
  head: () => ({
    meta: [
      { title: "Create your LearnOS account — Smart Learning OS" },
      { name: "description", content: "Create a LearnOS account as a student, parent, tutor or school and start building a smarter learning experience today." },
      { property: "og:title", content: "Create your LearnOS account" },
      { property: "og:description", content: "Sign up as a student, parent, tutor or organization on LearnOS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const signInFooter = (
  <>
    Already have an account?{" "}
    <Link to="/login" className="font-medium text-primary hover:underline">
      Sign In
    </Link>
  </>
);

function SignupPage() {
  const { type } = Route.useSearch();
  const [invite, setInvite] = useState<PendingInvite | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setInvite(readPendingInvite());
    setChecked(true);
  }, []);

  if (!checked) return <AuthShell wide title="Create your LearnOS account" footer={signInFooter}><div className="h-40" /></AuthShell>;
  if (invite) return <SignupForm invite={invite} />;
  if (!type) return <AccountSelect />;
  return <SignupForm kind={type} />;
}

function AccountSelect() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<SignupKind | null>(null);
  return (
    <AuthShell
      wide
      title="Create your LearnOS account"
      subtitle="First, tell us what type of account you're creating."
      footer={signInFooter}
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {kinds.map(({ value, label, desc, Icon }) => {
            const active = selected === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(value)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  active ? "border-primary bg-accent/60 shadow-glow" : "border-border bg-surface/50 hover:border-primary/40"
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
                <p className="mt-1 text-[0.8125rem] text-muted-foreground">{desc}</p>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          disabled={!selected}
          onClick={() => selected && navigate({ to: "/signup", search: { type: selected } })}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </AuthShell>
  );
}

function SignupForm({ kind, invite }: { kind?: SignupKind; invite?: PendingInvite }) {
  const navigate = useNavigate();
  const kindInfo = kind ? kinds.find((k) => k.value === kind) : undefined;
  const accountType: AccountType = invite ? accountTypeForInvite[invite.type] : (kindInfo?.accountType ?? "student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(invite?.email ?? "");
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
  const inviteEmailMismatch = !!invite?.email && email.trim().toLowerCase() !== invite.email.toLowerCase();
  const valid = nameValid && emailValid && strong && matches && agreed && !inviteEmailMismatch;

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
          emailRedirectTo: `${window.location.origin}/auth/callback?flow=verify`,
          data: {
            full_name: fullName.trim(),
            account_type: accountType,
            ...(kind ? { signup_kind: kind } : {}),
            ...(invite ? { invite_type: invite.type, invite_token: invite.token } : {}),
          },
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
      footer={signInFooter}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {error && <FormAlert tone="error">{error}</FormAlert>}

        {invite ? (
          <FormAlert tone="success">
            You're creating an account from a {inviteLabel[invite.type]} invitation. Your role is set by the invitation.
          </FormAlert>
        ) : kindInfo ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface/50 p-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
                <kindInfo.Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[0.8125rem] text-muted-foreground">Account type</p>
                <p className="text-sm font-semibold">{kindInfo.label}</p>
              </div>
            </div>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Change
            </Link>
          </div>
        ) : null}

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
              readOnly={!!invite?.email}
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

        {inviteEmailMismatch && (
          <FormAlert tone="error">
            This invitation was sent to a different email address. Please sign up using the email address that received this invitation.
          </FormAlert>
        )}

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
