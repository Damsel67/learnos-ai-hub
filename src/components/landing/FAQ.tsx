import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal, SectionHeading } from "./Reveal";

const faqs = [
  {
    q: "How is LearnOS priced?",
    a: "Pricing scales with active learners, with a flat platform fee for institutions. Tutoring companies typically start on a per-seat plan, while schools and training organizations move to an annual enterprise agreement that includes onboarding and support.",
  },
  {
    q: "How secure is the platform?",
    a: "LearnOS is SOC 2 Type II compliant with 256-bit encryption in transit and at rest, role-based permissions, audit logs, SSO and optional regional data residency.",
  },
  {
    q: "Who owns the data we put in LearnOS?",
    a: "You do. Your institution owns all learner, session and financial data, can export it at any time in open formats, and we never sell or share it with third parties.",
  },
  {
    q: "How does the AI actually work?",
    a: "AI models handle attention and participation signals, grading, summarisation and reporting. Every AI output is reviewable and editable by a human, and AI monitoring can be disabled per class or per organisation.",
  },
  {
    q: "Is LearnOS suitable for schools?",
    a: "Yes. Schools use LearnOS for timetabling, classroom delivery, assessments, parent communication and administrative reporting across multiple campuses and year groups.",
  },
  {
    q: "What about independent tutors and tutoring companies?",
    a: "Tutoring businesses get scheduling, tutor matching, payments, CRM and parent portals out of the box — the same platform, configured for a commercial teaching model.",
  },
  {
    q: "Can we migrate from our current system?",
    a: "Our migration team imports courses, users, historic attendance and grades from spreadsheets or existing LMS exports, usually within two weeks and with no downtime for live classes.",
  },
  {
    q: "What support is included?",
    a: "All plans include in-app chat and documentation. Enterprise customers get a dedicated success manager, 24/7 priority support and guaranteed response SLAs.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading eyebrow="Resources" title="Frequently asked" accent="questions" />

        <Reveal className="mx-auto mt-14 max-w-3xl">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`item-${i}`}
                className="rounded-2xl border border-border/70 bg-card/60 px-5 shadow-soft backdrop-blur-xl transition-colors hover:border-primary/40"
              >
                <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
