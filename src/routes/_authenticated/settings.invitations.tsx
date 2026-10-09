import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Copy, GraduationCap, Loader2, RefreshCw, ShieldCheck, Users, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LogoMark } from "@/components/landing/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { inviteLabel, invitePath, type InviteType } from "@/lib/invite";

export const Route = createFileRoute("/_authenticated/settings/invitations")({
  component: InvitationsPage,
  head: () => ({
    meta: [
      { title: "Invitations — LearnOS" },
      { name: "description", content: "Invite administrators, tutors and learners to your LearnOS workspace." },
      { property: "og:title", content: "Invitations — LearnOS" },
      { property: "og:description", content: "Invite people to join your LearnOS workspace." },
    ],
  }),
});

type Ctx = { organization_name: string | null; can_invite_staff: boolean; can_invite_learner: boolean; is_parent: boolean };
type Row = {
  id: string;
  token: string | null;
  invitation_type: InviteType;
  email: string;
  first_name: string | null;
  last_name: string | null;
  status: string;
  expires_at: string;
  inviter_name: string | null;
};

const cards: { type: InviteType; title: string; desc: string; Icon: typeof Users }[] = [
  { type: "admin", title: "Invite Admin", desc: "Add another administrator to your organisation.", Icon: ShieldCheck },
  { type: "tutor", title: "Invite Tutor", desc: "Invite a tutor or instructor to your organisation.", Icon: Users },
  { type: "learner", title: "Invite Learner", desc: "Invite a learner to your organisation.", Icon: GraduationCap },
];

const statusStyle: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  accepted: "bg-secondary/15 text-secondary",
  expired: "bg-muted text-muted-foreground",
  revoked: "bg-destructive/10 text-destructive",
};

function InvitationsPage() {
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<InviteType | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [c, l] = await Promise.all([supabase.rpc("my_invite_context"), supabase.rpc("list_my_invitations")]);
    if (c.data) setCtx(c.data as unknown as Ctx);
    if (l.data) setRows(l.data as Row[]);
    if (c.error || l.error) toast.error("Couldn't load invitations.");
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = cards.filter((c) => (c.type === "learner" ? ctx?.can_invite_learner : ctx?.can_invite_staff));

  async function copy(r: Row) {
    if (!r.token) return;
    await navigator.clipboard.writeText(window.location.origin + invitePath(r.invitation_type, r.token));
    toast.success("Invitation link copied");
  }

  async function act(r: Row, fn: "resend_invitation" | "revoke_invitation") {
    setBusy(r.id + fn);
    const { error } = await supabase.rpc(fn, { _id: r.id });
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(
      fn === "revoke_invitation"
        ? "Invitation revoked. The link no longer works."
        : "Invitation renewed for 7 more days. Copy the link to share it.",
    );
    void load();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-surface/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/"><LogoMark /></Link>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Invitations</h1>
        <p className="mt-2 text-muted-foreground">
          Invite people to join your LearnOS workspace{ctx?.organization_name ? ` · ${ctx.organization_name}` : ""}.
        </p>

        {loading ? (
          <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : visible.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border bg-surface/50 p-6 text-sm text-muted-foreground">
            Your account can't send invitations yet. Invitations are available to organisation administrators and parents.{" "}
            <Link to="/onboarding/$role" params={{ role: "organization" }} className="font-medium text-primary hover:underline">
              Organisation account? Set up your organisation first.
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map(({ type, title, desc, Icon }) => (
                <div key={type} className="flex flex-col rounded-2xl border border-border bg-surface/50 p-6 shadow-card backdrop-blur-xl">
                  <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1.5 flex-1 text-sm text-muted-foreground">
                    {type === "learner" && ctx?.is_parent && !ctx.can_invite_staff ? "Invite your child to their own LearnOS account." : desc}
                  </p>
                  <Button className="mt-5 bg-gradient-primary text-primary-foreground shadow-glow" onClick={() => setOpen(type)}>
                    {title}
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-12 overflow-x-auto rounded-2xl border border-border bg-surface/50 shadow-card backdrop-blur-xl">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-border text-muted-foreground">
                  <tr>{["Person", "Type", "Email", "Status", "Expires", "Invited By", "Actions"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No invitations yet.</td></tr>
                  )}
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 font-medium">{[r.first_name, r.last_name].filter(Boolean).join(" ") || "—"}</td>
                      <td className="px-4 py-3">{inviteLabel[r.invitation_type]}</td>
                      <td className="px-4 py-3">{r.email}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyle[r.status] ?? ""}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(r.expires_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.inviter_name ?? "—"}</td>
                      <td className="px-4 py-3">
                        {r.status === "pending" ? (
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => void copy(r)} className="gap-1"><Copy className="h-3.5 w-3.5" />Copy Link</Button>
                            <Button size="sm" variant="outline" disabled={!!busy} onClick={() => void act(r, "resend_invitation")} className="gap-1"><RefreshCw className="h-3.5 w-3.5" />Resend</Button>
                            <Button size="sm" variant="outline" disabled={!!busy} onClick={() => void act(r, "revoke_invitation")} className="gap-1 text-destructive"><XCircle className="h-3.5 w-3.5" />Revoke</Button>
                          </div>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {open && <CreateDialog type={open} onClose={() => setOpen(null)} onCreated={() => void load()} />}
    </div>
  );
}

function CreateDialog({ type, onClose, onCreated }: { type: InviteType; onClose: () => void; onCreated: () => void }) {
  const [email, setEmail] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [saving, setSaving] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("create_invitation", { _type: type, _email: email, _first: first, _last: last });
    setSaving(false);
    if (rpcError) return setError(rpcError.message);
    const res = data as unknown as { token: string };
    setLink(window.location.origin + invitePath(type, res.token));
    onCreated();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a{type === "admin" ? "n" : ""} {inviteLabel[type]}</DialogTitle>
          <DialogDescription>Send an invitation to join your organisation on LearnOS.</DialogDescription>
        </DialogHeader>
        {link ? (
          <div className="space-y-3">
            <p className="text-sm">Invitation created. Share this link with the person you invited — it expires in 7 days.</p>
            <Input readOnly value={link} onFocus={(e) => e.target.select()} />
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Done</Button>
              <Button
                className="bg-gradient-primary text-primary-foreground"
                onClick={() => void navigator.clipboard.writeText(link).then(() => toast.success("Invitation link copied"))}
              >
                <Copy className="mr-1.5 h-4 w-4" /> Copy Link
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <div className="space-y-1.5">
              <Label htmlFor="inv-email">Email address</Label>
              <Input id="inv-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="inv-first">First name (optional)</Label>
                <Input id="inv-first" value={first} onChange={(e) => setFirst(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-last">Last name (optional)</Label>
                <Input id="inv-last" value={last} onChange={(e) => setLast(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-gradient-primary text-primary-foreground">
                {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Create Invitation
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
