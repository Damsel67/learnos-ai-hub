import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { PlatformGrid } from "@/components/landing/PlatformGrid";
import { Roles } from "@/components/landing/Roles";
import { AIFeatures } from "@/components/landing/AIFeatures";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Stats } from "@/components/landing/Stats";
import { Comparison } from "@/components/landing/Comparison";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "LearnOS — The AI Operating System for Education" },
      {
        name: "description",
        content:
          "LearnOS unifies live classrooms, AI classroom intelligence, course management, assessments, parent portals and analytics for schools and tutoring companies.",
      },
      { property: "og:title", content: "LearnOS — The AI Operating System for Education" },
      {
        property: "og:description",
        content:
          "Live classrooms, AI monitoring, assessments, automation and analytics — one enterprise platform for every role in education.",
      },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <PlatformGrid />
        <Roles />
        <AIFeatures />
        <HowItWorks />
        <Stats />
        <Comparison />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
