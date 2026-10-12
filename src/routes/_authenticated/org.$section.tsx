import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OrgAdminShell, orgSections, type OrgSection } from "@/components/org/OrgAdminShell";

export const Route = createFileRoute("/_authenticated/org/$section")({
  beforeLoad: ({ params }) => {
    if (!(params.section in orgSections)) throw notFound();
  },
  head: ({ params }) => {
    const s = orgSections[params.section as OrgSection];
    const title = `${s?.title ?? "Organisation"} — LearnOS`;
    return {
      meta: [
        { title },
        { name: "description", content: s?.desc ?? "LearnOS organisation workspace." },
        { property: "og:title", content: title },
        { property: "og:description", content: s?.desc ?? "LearnOS organisation workspace." },
      ],
    };
  },
  component: SectionPage,
});

function SectionPage() {
  const { section } = Route.useParams();
  const s = orgSections[section as OrgSection];
  const [org, setOrg] = useState<string | null>(null);
  useEffect(() => {
    void supabase.rpc("my_organization").then(({ data }) => setOrg((data as { name?: string } | null)?.name ?? null));
  }, []);
  return (
    <OrgAdminShell orgName={org}>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{s.title}</h1>
      <p className="mt-2 text-muted-foreground">{s.desc}</p>
      <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center backdrop-blur-xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><s.Icon className="h-6 w-6" /></div>
        <p className="mt-4 text-lg font-semibold">Coming soon</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">This area is being built and isn't available yet. Nothing here is live data.</p>
        <Link to="/dashboard" className="mt-6 text-sm font-medium text-primary hover:underline">Back to overview</Link>
      </div>
    </OrgAdminShell>
  );
}
