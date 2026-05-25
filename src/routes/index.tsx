import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "LearnOS — The Smart Learning Operating System" },
      { name: "description", content: "AI-powered tutoring, live sessions, and academic intelligence for modern education. Live virtual classrooms, smart scheduling, parent tracking and gamified learning." },
      { property: "og:title", content: "LearnOS — The Smart Learning Operating System" },
      { property: "og:description", content: "AI-powered tutoring, live sessions, and academic intelligence for modern education." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <DashboardPreview />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
