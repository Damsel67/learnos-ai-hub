import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormAlert } from "@/components/auth/fields";
import { useAuth } from "@/hooks/use-auth";
import {
  clearPendingInvite,
  INVITE_TYPES,
  inviteLabel,
  savePendingInvite,
  type InviteType,
} from "@/lib/invite";

export const Route = createFileRoute("/invite/$type/$token")({
  ssr: false,
  component: InvitePage,
  head: () => ({
    meta: [
      { title: "You're invited to LearnOS" },
      { name: "description", content: "Accept your invitation to join a LearnOS workspace." },
      { property: "og:title", content: "You're invited to LearnOS" },
      { property: "og:description", content: "Accept your invitation to join a LearnOS workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Info =
  | { state: "invalid" | "expired" | "revoked" | "accepted" }
  | {
      state: "valid";
      type: InviteType;
      email: string;
      first_name: string | null;
      organization_name: string | null;
      inviter_name: string | null;
      is_parent_invite: boolean;
    };

const onboardingRole: Record<InviteType, string> = { admin: "organization", tutor: "tutor", learner: "student" };

const states = {
  invalid: { title: "Invitation link is invalid", body: "This invitation link is not valid.", cta: "home" },
  expired: {
    title: "Invitation expired",
    body: "This invitation has expired. Please contact the person who invited you for a new invitation.",
    cta: "home",
  },
  revoked: { title: "Invitation revoked", body: "This invitation is no longer available.", cta: "home" },
  accepted: { title: "Invitation already accepted", body: "This invitation has already been used.", cta: "login" },
} as const;

function InvitePage() {
  const { type, token } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const [info, setInfo] = useState<Info | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validType = INVITE_TYPES.includes(type as InviteType);

  useEffect(() => {
    let cancelled = false;
    if (!validType) {
      setInfo({ state: "invalid" });
      return;
    }
    void (async () => {
      const { data, error: rpcError } = await supabase.rpc("get_invitation", {
        _token: token,
        _type: type as InviteType,
      });
      if (cancelled) return;
      if (rpcError || !data) setInfo({ state: "invalid" });
      else setInfo(data as unknown as Info);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, type, validType]);

  useEffect(() => {
    if (info && info.state !== "valid") clearPendingInvite();
  }, [info]);

  async function accept() {
    if (!info || info.state !== "valid" || accepting) return;
    setError(null);
    if (!user) {
      savePendingInvite({ type: info.type, token, email: info.email });
      navigate({ to: "/signup" });
      return;
    }
    setAccepting(true);
    const { data, error: rpcError } = await supabase.rpc("accept_invitation", {
      _token: token,
      _type: info.type,
    });
    if (rpcError) {
      setError(rpcError.message);
      setAccepting(false);
      return;
    }
    clearPendingInvite();
    await refreshProfile();
    const accepted = data as unknown as { type: InviteType };
    navigate({ to: "/onboarding/$role", params: { role: onboardingRole[accepted.type] }, replace: true });
  }

  function signInInstead() {
    if (info?.state !== "valid") return;
    savePendingInvite({ type: info.type, token, email: info.email });
    navigate({ to: "/login" });
  }

  if (!info || authLoading) {
    return (
      <AuthShell title="Checking your invitation" subtitle="One moment while we verify this link.">
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AuthShell>
    );
  }

  if (info.state !== "valid") {
    const s = states[info.state];
    return (
      <AuthShell title={s.title} subtitle={s.body}>
        <div className="flex flex-col items-center gap-5 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </span>
          <Link
            to={s.cta === "login" ? "/login" : "/"}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95"
          >
            {s.cta === "login" ? "Go to Login" : "Go to LearnOS"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </AuthShell>
    );
  }

  const org = info.organization_name ?? (info.inviter_name ? `${info.inviter_name}` : "LearnOS");
  const headline = info.is_parent_invite
    ? `${info.inviter_name ?? "Your parent"} invited you to learn on LearnOS.`
    : info.type === "admin"
      ? `You're invited to join ${org} as an administrator.`
      : info.type === "tutor"
        ? `You're invited to teach with ${org} on LearnOS.`
        : `You're invited to learn with ${org} on LearnOS.`;
  const emailMismatch = !!user?.email && user.email.toLowerCase() !== info.email.toLowerCase();

  return (
    <AuthShell title="You're invited" subtitle={headline}>
      <div className="space-y-5">
        {error && <FormAlert tone="error">{error}</FormAlert>}
        <dl className="divide-y divide-border rounded-2xl border border-border bg-surface/50 text-sm">
          <Row label={info.is_parent_invite ? "Invited by" : "Organisation"} value={org} />
          <Row label="Invitation type" value={inviteLabel[info.type]} />
          <Row label="Invited email" value={info.email} />
        </dl>
        {emailMismatch && (
          <FormAlert tone="error">
            You're signed in as {user?.email}. Sign in with {info.email} to accept this invitation.
          </FormAlert>
        )}
        <button
          type="button"
          onClick={() => void accept()}
          disabled={accepting || emailMismatch}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-95 disabled:opacity-60"
        >
          {accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
          Accept Invitation
        </button>
        {!user && (
          <p className="text-center text-sm text-muted-foreground">
            Already have a LearnOS account?{" "}
            <button type="button" onClick={signInInstead} className="font-medium text-primary hover:underline">
              Sign in to accept
            </button>
          </p>
        )}
      </div>
    </AuthShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
