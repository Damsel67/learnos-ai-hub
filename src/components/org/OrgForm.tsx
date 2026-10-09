import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Field, FormAlert, SubmitButton } from "@/components/auth/fields";

export type OrgType = "school" | "tutoring_company" | "training_org";
export const orgTypeLabel: Record<OrgType, string> = {
  school: "School / Institution",
  tutoring_company: "Tutoring Company",
  training_org: "Training Organization",
};

/** Customer type chosen at sign-up → default organisation type. */
export function orgTypeFromCustomer(kind: string | null | undefined): OrgType {
  if (kind === "tutoring_company") return "tutoring_company";
  if (kind === "training_org") return "training_org";
  return "school";
}

export type OrgValues = { name: string; org_type: OrgType; country: string; website: string };

export function OrgForm({
  initial,
  submitLabel,
  loadingLabel,
  onSubmit,
}: {
  initial: OrgValues;
  submitLabel: string;
  loadingLabel: string;
  onSubmit: (v: OrgValues) => Promise<string | null>;
}) {
  const [v, setV] = useState<OrgValues>(initial);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameOk = v.name.trim().length >= 2;
  const countryOk = v.country.trim().length >= 2;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!nameOk || !countryOk || loading) return;
    setLoading(true);
    setError(null);
    const err = await onSubmit(v);
    if (err) setError(err);
    setLoading(false);
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <Field id="orgName" label="Organisation name" error={touched && !nameOk ? "Enter your organisation name." : undefined}>
        <Input id="orgName" placeholder="Northgate Academy" maxLength={120} value={v.name}
          onChange={(e) => setV({ ...v, name: e.target.value })} aria-invalid={touched && !nameOk ? true : undefined} />
      </Field>
      <Field id="orgType" label="Organisation type">
        <select
          id="orgType"
          value={v.org_type}
          onChange={(e) => setV({ ...v, org_type: e.target.value as OrgType })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {(Object.keys(orgTypeLabel) as OrgType[]).map((k) => (
            <option key={k} value={k}>{orgTypeLabel[k]}</option>
          ))}
        </select>
      </Field>
      <Field id="country" label="Country" error={touched && !countryOk ? "Enter your country." : undefined}>
        <Input id="country" autoComplete="country-name" placeholder="Nigeria" maxLength={80} value={v.country}
          onChange={(e) => setV({ ...v, country: e.target.value })} aria-invalid={touched && !countryOk ? true : undefined} />
      </Field>
      <Field id="website" label="Website (optional)">
        <Input id="website" type="url" placeholder="https://northgate.edu" maxLength={200} value={v.website}
          onChange={(e) => setV({ ...v, website: e.target.value })} />
      </Field>
      <SubmitButton loading={loading} loadingLabel={loadingLabel}>{submitLabel}</SubmitButton>
    </form>
  );
}
