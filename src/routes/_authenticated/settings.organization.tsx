import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { OrgForm, type OrgType } from "@/components/org/OrgForm";

export const Route = createFileRoute("/_authenticated/settings/organization")({
  component: OrgSettings,
  head: () => ({
    meta: [
      { title: "Organisation settings — LearnOS" },
      { name: "description", content: "Edit your LearnOS organisation profile." },
      { property: "og:title", content: "Organisation settings — LearnOS" },
      { property: "og:description", content: "Edit your LearnOS organisation profile." },
    ],
  }),
});

type Org = { id: string; name: string; org_type: OrgType | null; country: string | null; website: string | null; setup_completed: boolean };

function OrgSettings() {
  const [org, setOrg] = useState<Org | null | undefined>(undefined);

  useEffect(() => {
    void supabase.rpc("my_organization").then(({ data }) => setOrg((data as Org | null) ?? null));
  }, []);

  if (org === undefined) {
    return (
      <AuthShell title="Organisation settings">
        <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      </AuthShell>
    );
  }
  if (!org || !org.setup_completed) {
    return (
      <AuthShell title="Organisation settings" subtitle="Only organisation admins can edit these settings.">
        <Link to="/onboarding/$role" params={{ role: "organization" }} className="block text-center text-sm font-medium text-primary hover:underline">
          Set up your organisation
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Organisation settings"
      subtitle="This name appears on invitations, your dashboard and across LearnOS."
      footer={<Link to="/dashboard" className="font-medium text-primary hover:underline">Back to dashboard</Link>}
    >
      <OrgForm
        initial={{ name: org.name, org_type: org.org_type ?? "school", country: org.country ?? "", website: org.website ?? "" }}
        submitLabel="Save changes"
        loadingLabel="Saving..."
        onSubmit={async (v) => {
          const { error } = await supabase.rpc("update_organization_profile", {
            _org: org.id, _name: v.name, _type: v.org_type, _country: v.country, _website: v.website,
          });
          if (error) return error.message;
          toast.success("Organisation updated");
          return null;
        }}
      />
      <p className="mt-4 text-center text-[0.8125rem] text-muted-foreground">Organisation logo upload is coming soon.</p>
    </AuthShell>
  );
}
