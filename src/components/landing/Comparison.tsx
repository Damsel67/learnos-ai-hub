import { Check, Minus } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";

const columns = ["Zoom", "Google Classroom", "MeritHub", "LearnOS"];

const rows: { feature: string; values: (boolean | "partial")[] }[] = [
  { feature: "Live Teaching", values: [true, "partial", true, true] },
  { feature: "Course Management", values: [false, true, "partial", true] },
  { feature: "AI Monitoring", values: [false, false, false, true] },
  { feature: "Attendance Automation", values: ["partial", false, "partial", true] },
  { feature: "Quiz Builder", values: [false, "partial", "partial", true] },
  { feature: "Certificates", values: [false, false, "partial", true] },
  { feature: "CRM", values: [false, false, false, true] },
  { feature: "Parent Portal", values: [false, "partial", false, true] },
  { feature: "Payments", values: [false, false, "partial", true] },
  { feature: "Analytics", values: ["partial", "partial", "partial", true] },
  { feature: "Workflow Automation", values: [false, false, false, true] },
];

function Cell({ v, highlight }: { v: boolean | "partial"; highlight?: boolean }) {
  return (
    <td className={`px-4 py-3.5 text-center ${highlight ? "bg-primary/5" : ""}`}>
      {v === true ? (
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${highlight ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-surface text-mint"}`}>
          <Check className="h-3.5 w-3.5" />
        </span>
      ) : v === "partial" ? (
        <span className="text-xs text-muted-foreground">Partial</span>
      ) : (
        <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />
      )}
    </td>
  );
}

export function Comparison() {
  return (
    <section id="compare" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Comparison"
          title="Compare"
          accent="LearnOS"
          subtitle="Point tools solve one problem. LearnOS runs the whole institution."
        />

        <Reveal className="mt-16">
          <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card/60 shadow-card backdrop-blur-xl">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Feature
                  </th>
                  {columns.map((c) => (
                    <th
                      key={c}
                      className={`px-4 py-4 text-center text-xs font-semibold ${
                        c === "LearnOS" ? "bg-primary/5 text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {c === "LearnOS" ? <span className="text-gradient text-sm">LearnOS</span> : c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.feature} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface/50">
                    <td className="px-4 py-3.5 font-medium">{r.feature}</td>
                    {r.values.map((v, i) => (
                      <Cell key={i} v={v} highlight={i === 3} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
