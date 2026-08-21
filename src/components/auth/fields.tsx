import { useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lovable } from "@/integrations/lovable/index";

export function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[0.9375rem] font-medium text-foreground">
        {label}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-destructive">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = "••••••••",
  invalid,
  autoComplete = "current-password",
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  invalid?: boolean;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`pr-10 ${invalid ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function FormAlert({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  const error = tone === "error";
  return (
    <div
      role={error ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
        error
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-mint/40 bg-mint/10 text-foreground"
      }`}
    >
      {error ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
      )}
      <span>{children}</span>
    </div>
  );
}

export function SubmitButton({
  loading,
  loadingLabel,
  children,
  disabled,
}: {
  loading: boolean;
  loadingLabel: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading ? loadingLabel : children}
    </button>
  );
}

export function Divider({ label = "OR" }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
      <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
      <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
      <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
    </svg>
  );
}

export function SocialButtons({
  onError,
  intent = "Continue",
}: {
  onError: (message: string) => void;
  intent?: string;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  const start = async (provider: "google" | "microsoft") => {
    setBusy(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/auth/callback`,
      });
      if (result.error) {
        onError(result.error.message ?? "We couldn't start that sign-in. Please try again.");
        setBusy(null);
        return;
      }
      if (result.redirected) return;
      window.location.assign("/auth/callback");
    } catch {
      onError("Network error. Please check your connection and try again.");
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(["google", "microsoft"] as const).map((p) => (
        <button
          key={p}
          type="button"
          disabled={busy !== null}
          onClick={() => void start(p)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card/70 px-4 text-sm font-medium backdrop-blur-xl transition-colors hover:border-primary/40 hover:bg-surface disabled:opacity-60"
        >
          {busy === p ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : p === "google" ? (
            <GoogleIcon />
          ) : (
            <MicrosoftIcon />
          )}
          <span>
            {intent} with {p === "google" ? "Google" : "Microsoft"}
          </span>
        </button>
      ))}
    </div>
  );
}

export const passwordRules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /\d/.test(v) },
  { label: "One special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export function isStrongPassword(v: string) {
  return passwordRules.every((r) => r.test(v));
}

export function PasswordChecklist({ value }: { value: string }) {
  return (
    <ul className="grid gap-1.5 rounded-xl border border-border bg-surface/70 p-3 text-[0.8125rem]">
      {passwordRules.map((r) => {
        const ok = r.test(value);
        return (
          <li
            key={r.label}
            className={`flex items-center gap-2 ${ok ? "text-mint" : "text-muted-foreground"}`}
          >
            <CheckCircle2 className={`h-3.5 w-3.5 ${ok ? "opacity-100" : "opacity-40"}`} />
            {r.label}
          </li>
        );
      })}
    </ul>
  );
}
