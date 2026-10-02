import type { AccountType } from "@/hooks/use-auth";

export type InviteType = "admin" | "tutor" | "learner";
export const INVITE_TYPES: InviteType[] = ["admin", "tutor", "learner"];

const KEY = "learnos_pending_invite";

export type PendingInvite = { type: InviteType; token: string; email?: string };

export function savePendingInvite(invite: PendingInvite) {
  try {
    localStorage.setItem(KEY, JSON.stringify(invite));
  } catch {
    /* storage unavailable */
  }
}

export function readPendingInvite(): PendingInvite | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as PendingInvite;
    if (!INVITE_TYPES.includes(v.type) || typeof v.token !== "string") return null;
    return v;
  } catch {
    return null;
  }
}

export function clearPendingInvite() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function invitePath(type: InviteType, token: string) {
  return `/invite/${type}/${encodeURIComponent(token)}`;
}

/** Account type a new account created from this invitation gets. */
export const accountTypeForInvite: Record<InviteType, AccountType> = {
  admin: "organization",
  tutor: "tutor",
  learner: "student",
};

export const inviteLabel: Record<InviteType, string> = {
  admin: "Admin",
  tutor: "Tutor",
  learner: "Learner",
};
