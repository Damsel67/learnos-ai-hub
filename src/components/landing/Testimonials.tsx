import { Star } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";
import photo1 from "@/assets/testimonial-1.jpg";
import photo2 from "@/assets/testimonial-2.jpg";
import photo3 from "@/assets/testimonial-3.jpg";
import photo4 from "@/assets/testimonial-4.jpg";

const testimonials = [
  {
    quote:
      "We replaced five tools with LearnOS. Enrolment, scheduling, live classes and finance finally live in one system — our operations team got a full day back every week.",
    name: "Amara Okafor",
    role: "Founder, Northgate Academy",
    photo: photo1,
  },
  {
    quote:
      "AI grading and lesson planning cut my prep time in half. I spend my evenings teaching better, not marking quizzes.",
    name: "Rohan Mehta",
    role: "Senior Tutor, BrightPath",
    photo: photo2,
  },
  {
    quote:
      "I finally see exactly how my daughter is doing — attendance, homework and a weekly AI summary that actually makes sense.",
    name: "Sofia Marchetti",
    role: "Parent",
    photo: photo3,
  },
  {
    quote:
      "The live classroom feels smooth and my streak and progress bars genuinely keep me showing up. It doesn't feel like school software.",
    name: "Daniel Kim",
    role: "Student, Grade 11",
    photo: photo4,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Testimonials"
          title="Success"
          accent="Stories"
          subtitle="School owners, tutors, parents and students — all on the same platform."
        />


        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={(i % 2) * 0.08}>
              <figure className="group h-full rounded-2xl border border-border/70 bg-card/60 p-7 shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card">
                <div className="flex gap-0.5 text-mint">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-foreground/90">"{t.quote}"</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <img
                    src={t.photo}
                    alt={`${t.name}, ${t.role}`}
                    loading="lazy"
                    width={512}
                    height={512}
                    className="h-11 w-11 rounded-full object-cover ring-1 ring-border"
                  />
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
