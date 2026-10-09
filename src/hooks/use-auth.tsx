import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { invitePath, readPendingInvite } from "@/lib/invite";

export type AccountType = "student" | "parent" | "tutor" | "organization";

export type Profile = {
  id: string;
  full_name: string | null;
  account_type: AccountType;
  onboarding_completed: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function destinationFor(profile: Profile | null): string {
  // An invitation opened before signing in/up takes priority so it survives verification.
  const pending = readPendingInvite();
  if (pending) return invitePath(pending.type, pending.token);
  if (!profile) return "/onboarding/student";
  if (profile.onboarding_completed) return "/dashboard";
  return `/onboarding/${profile.account_type}`;
}

/**
 * Like destinationFor, but also restores an invitation saved on the account at sign-up,
 * so it works when the verification link is opened on a different device/browser.
 */
export async function resolveDestination(profile: Profile | null): Promise<string> {
  if (readPendingInvite()) return destinationFor(profile);
  const { data } = await supabase.rpc("my_pending_invite");
  const inv = data as { type: "admin" | "tutor" | "learner"; token: string } | null;
  if (inv?.token) return invitePath(inv.type, inv.token);
  return destinationFor(profile);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, account_type, onboarding_completed")
      .eq("id", userId)
      .maybeSingle();
    setProfile((data as Profile | null) ?? null);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      // defer supabase calls out of the callback
      setTimeout(() => {
        void loadProfile(newSession?.user?.id);
      }, 0);
    });

    void (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      await loadProfile(data.session?.user?.id);
      setLoading(false);
    })();

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      refreshProfile: () => loadProfile(session?.user?.id),
      signOut: async () => {
        await supabase.auth.signOut();
        setProfile(null);
      },
    }),
    [session, profile, loading, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
