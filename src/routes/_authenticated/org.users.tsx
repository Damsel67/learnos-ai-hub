import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, Copy, GraduationCap, Loader2, MoreHorizontal, Search, ShieldCheck, UserCog, UserPlus, Users, X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { OrgAdminShell } from "@/components/org/OrgAdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { inviteLabel, invitePath, type InviteType } from "@/lib/invite";

export const Route = createFileRoute("/_authenticated/org/users")({
  head: () => ({
    meta: [
      { title: "User Management — LearnOS" },
      { name: "description", content: "Manage the administrators, tutors and learners in your LearnOS organisation." },
      { property: "og:title", content: "User Management — LearnOS" },
      { property: "og:description", content: "Manage the people in your LearnOS organisation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UsersPage,
});

type Role = "admin" | "tutor" | "learner";
type Member = {
  member_id: string; user_id: string; full_name: string | null; email: string | null;
  role: Role; status: string; joined_at: string; is_self: boolean;
};
type Inv = {
  id: string; token: string | null; invitation_type: InviteType; email: string;
  first_name: string | null; last_name: string | null; status: string; expires_at: string;
};
type Org = { id: string; name: string } | null;

const roleLabel: Record<Role, string> = { admin: "Administrator", tutor: "Tutor", learner: "Learner" };
const roleStyle: Record<Role, string> = {
  admin: "bg-primary/12 text-primary",
  tutor: "bg-accent/15 text-accent-foreground dark:text-accent",
  learner: "bg-secondary/15 text-secondary",
};
const filters: { key: "all" | Role; label: string }[] = [
  { key: "all", label: "All Members" },
  { key: "admin", label: "Administrators" },
  { key: "tutor", label: "Tutors" },
  { key: "learner", label: "Learners" },
];
const PAGE = 20;

type Pending =
  | { kind: "role"; m: Member; role: Role }
  | { kind: "suspend" | "reactivate" | "remove"; m: Member };

function UsersPage() {
  const [org, setOrg] = useState<Org>(null);
  const [orgLoaded, setOrgLoaded] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Inv[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | Role>("all");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Member | null>(null);
  const [confirm, setConfirm] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const o = await supabase.rpc("my_organization");
    const orgData = (o.data as Org) ?? null;
    setOrg(orgData);
    setOrgLoaded(true);
    if (!orgData?.id) { setLoading(false); return; }
    const [m, i] = await Promise.all([
      supabase.rpc("list_org_members", { _org: orgData.id }),
      supabase.rpc("list_my_invitations"),
    ]);
    if (m.error) setError(m.error.message);
    else setMembers((m.data ?? []) as Member[]);
    if (!i.error) setInvites(((i.data ?? []) as Inv[]).filter((r) => r.status === "pending"));
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(() => ({
    total: new Set(members.map((m) => m.user_id)).size,
    admin: members.filter((m) => m.role === "admin").length,
    tutor: members.filter((m) => m.role === "tutor").length,
    learner: members.filter((m) => m.role === "learner").length,
  }), [members]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return members.filter((m) =>
      (filter === "all" || m.role === filter) &&
      (!s || (m.full_name ?? "").toLowerCase().includes(s) || (m.email ?? "").toLowerCase().includes(s)));
  }, [members, q, filter]);
  const shown = filtered.slice(0, page * PAGE);

  async function run(p: Pending) {
    setBusy(true);
    const res =
      p.kind === "role" ? await supabase.rpc("update_member_role", { _member_id: p.m.member_id, _role: p.role })
      : p.kind === "remove" ? await supabase.rpc("remove_org_member", { _member_id: p.m.member_id })
      : await supabase.rpc("set_member_status", { _member_id: p.m.member_id, _status: p.kind === "suspend" ? "suspended" : "active" });
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    const who = p.m.full_name || p.m.email || "Member";
    toast.success(
      p.kind === "role" ? `${who} is now a ${roleLabel[p.role]}.`
      : p.kind === "remove" ? `${who} was removed from your organisation. Their LearnOS account is unchanged.`
      : p.kind === "suspend" ? `${who}'s access has been suspended.` : `${who}'s access has been restored.`,
    );
    setConfirm(null);
    setDetail(null);
    void load();
  }

  async function copyInvite(r: Inv) {
    if (!r.token) return;
    await navigator.clipboard.writeText(window.location.origin + invitePath(r.invitation_type, r.token));
    toast.success("Invitation link copied");
  }

  return (
    <OrgAdminShell orgName={org?.name ?? null}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">User Management</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            See everyone in your organisation, change what they can do, and invite new people.
          </p>
        </div>
        {org && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2 bg-gradient-primary text-primary-foreground shadow-glow"><UserPlus className="h-4 w-4" />Invite people</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(["admin", "tutor", "learner"] as const).map((t) => (
                <DropdownMenuItem key={t} asChild>
                  <a href={`/settings/invitations?invite=${t}`}>Invite {inviteLabel[t]}</a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {orgLoaded && !org && !loading ? (
        <div className="mt-8 rounded-2xl border border-border bg-surface/50 p-6 text-sm text-muted-foreground">
          You need to set up your organisation before managing members.{" "}
          <Link to="/onboarding/$role" params={{ role: "organization" }} className="font-medium text-primary hover:underline">Set up your organisation</Link>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Total Members" value={counts.total} Icon={Users} loading={loading} />
            <Stat label="Administrators" value={counts.admin} Icon={ShieldCheck} loading={loading} />
            <Stat label="Tutors" value={counts.tutor} Icon={UserCog} loading={loading} />
            <Stat label="Learners" value={counts.learner} Icon={GraduationCap} loading={loading} />
          </div>

          <section className="mt-8 rounded-2xl border border-border bg-surface/50 shadow-card backdrop-blur-xl">
            <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
              <div className="relative md:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search by name or email" className="pl-9" aria-label="Search members" />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {filters.map((f) => (
                  <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`}>
                    {f.label}
                  </button>
                ))}
                {(q || filter !== "all") && (
                  <button onClick={() => { setQ(""); setFilter("all"); setPage(1); }} className="ml-1 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <X className="h-3.5 w-3.5" />Clear
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 py-14 text-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <p className="text-sm">We couldn't load your members. {error}</p>
                <Button variant="outline" size="sm" onClick={() => void load()}>Try again</Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-14 text-center">
                <p className="font-medium">{members.length === 0 ? "No members yet" : "No members match your search"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {members.length === 0 ? "Invite administrators, tutors or learners to get started." : "Try a different name, email or filter."}
                </p>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-border">
                  {shown.map((m) => (
                    <li key={m.member_id} className="flex items-center gap-3 px-4 py-3">
                      <button onClick={() => setDetail(m)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                        <Avatar m={m} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{m.full_name || "Unnamed member"}{m.is_self && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}</p>
                          <p className="truncate text-sm text-muted-foreground">{m.email}</p>
                        </div>
                      </button>
                      <span className={`hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline ${roleStyle[m.role]}`}>{roleLabel[m.role]}</span>
                      <StatusPill status={m.status} />
                      <span className="hidden w-24 text-right text-sm text-muted-foreground lg:inline">{new Date(m.joined_at).toLocaleDateString()}</span>
                      <MemberMenu m={m} onDetail={() => setDetail(m)} onAction={setConfirm} />
                    </li>
                  ))}
                </ul>
                {shown.length < filtered.length && (
                  <div className="border-t border-border p-3 text-center">
                    <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)}>Show more ({filtered.length - shown.length} remaining)</Button>
                  </div>
                )}
              </>
            )}
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold">Pending invitations</h2>
            <p className="mt-1 text-sm text-muted-foreground">These people have been invited but haven't joined yet.</p>
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface/40">
              {loading ? null : invites.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">No pending invitations.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {invites.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{[r.first_name, r.last_name].filter(Boolean).join(" ") || r.email}</p>
                        <p className="truncate text-sm text-muted-foreground">{r.email} · {inviteLabel[r.invitation_type]} · expires {new Date(r.expires_at).toLocaleDateString()}</p>
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">Invited</span>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => void copyInvite(r)}><Copy className="h-3.5 w-3.5" />Copy link</Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Link to="/settings/invitations" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">Manage invitations (resend or revoke)</Link>
          </section>
        </>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent>
          {detail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3"><Avatar m={detail} /><DialogTitle>{detail.full_name || "Unnamed member"}</DialogTitle></div>
                <DialogDescription>{detail.email}</DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div><dt className="text-muted-foreground">Role</dt><dd className="mt-1 font-medium">{roleLabel[detail.role]}</dd></div>
                <div><dt className="text-muted-foreground">Status</dt><dd className="mt-1"><StatusPill status={detail.status} /></dd></div>
                <div><dt className="text-muted-foreground">Joined</dt><dd className="mt-1 font-medium">{new Date(detail.joined_at).toLocaleDateString()}</dd></div>
              </dl>
              {detail.is_self ? (
                <p className="text-sm text-muted-foreground">This is you. Another administrator must change your role or access.</p>
              ) : (
                <div>
                  <p className="text-sm font-medium">Change role</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["admin", "tutor", "learner"] as const).map((r) => (
                      <Button key={r} size="sm" variant={detail.role === r ? "default" : "outline"} disabled={detail.role === r}
                        onClick={() => setConfirm({ kind: "role", m: detail, role: r })}>{roleLabel[r]}</Button>
                    ))}
                  </div>
                </div>
              )}
              {!detail.is_self && (
                <DialogFooter className="gap-2 sm:justify-between">
                  <Button variant="outline" onClick={() => setConfirm({ kind: detail.status === "active" ? "suspend" : "reactivate", m: detail })}>
                    {detail.status === "active" ? "Suspend access" : "Restore access"}
                  </Button>
                  <Button variant="outline" className="text-destructive" onClick={() => setConfirm({ kind: "remove", m: detail })}>Remove from organisation</Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirm} onOpenChange={(o) => !o && !busy && setConfirm(null)}>
        <DialogContent>
          {confirm && (
            <>
              <DialogHeader>
                <DialogTitle>{confirmTitle(confirm)}</DialogTitle>
                <DialogDescription>{confirmBody(confirm)}</DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" disabled={busy} onClick={() => setConfirm(null)}>Cancel</Button>
                <Button disabled={busy} onClick={() => void run(confirm)}
                  className={confirm.kind === "remove" || confirm.kind === "suspend" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Confirm
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </OrgAdminShell>
  );
}

function confirmTitle(p: Pending) {
  const who = p.m.full_name || p.m.email || "this member";
  if (p.kind === "role") return `Make ${who} a ${roleLabel[p.role]}?`;
  if (p.kind === "suspend") return `Suspend ${who}?`;
  if (p.kind === "reactivate") return `Restore access for ${who}?`;
  return `Remove ${who}?`;
}
function confirmBody(p: Pending) {
  if (p.kind === "role") return p.role === "admin"
    ? "Administrators can manage members, invitations and organisation settings."
    : "Their access will change to match the new role straight away.";
  if (p.kind === "suspend") return "They'll lose access to your organisation until you restore it. Their LearnOS account stays.";
  if (p.kind === "reactivate") return "They'll regain access to your organisation with their current role.";
  return "They'll be removed from your organisation only. Their LearnOS account and any other organisations they belong to are not affected.";
}

function MemberMenu({ m, onDetail, onAction }: { m: Member; onDetail: () => void; onAction: (p: Pending) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" aria-label={`Actions for ${m.full_name || m.email}`}><MoreHorizontal className="h-4 w-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onDetail}>View details</DropdownMenuItem>
        {!m.is_self && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAction({ kind: m.status === "active" ? "suspend" : "reactivate", m })}>
              {m.status === "active" ? "Suspend access" : "Restore access"}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onAction({ kind: "remove", m })}>Remove from organisation</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Stat({ label, value, Icon, loading }: { label: string; value: number; Icon: typeof Users; loading: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/50 p-4 shadow-card backdrop-blur-xl">
      <div className="flex items-center justify-between text-sm text-muted-foreground">{label}<Icon className="h-4 w-4 text-primary" /></div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{loading ? "—" : value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const active = status === "active";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${active ? "bg-secondary/15 text-secondary" : "bg-destructive/10 text-destructive"}`}>
      {active ? "Active" : status === "suspended" ? "Suspended" : status}
    </span>
  );
}

function Avatar({ m }: { m: Member }) {
  const s = (m.full_name || m.email || "?").trim();
  const initials = s.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">{initials}</span>;
}
