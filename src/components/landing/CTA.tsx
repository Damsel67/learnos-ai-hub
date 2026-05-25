import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="px-6 py-20">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-gradient-primary p-10 text-center shadow-glow md:p-16">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative">
          <h2 className="text-4xl font-semibold text-primary-foreground md:text-5xl">
            Ready to teach <span className="font-display italic">smarter?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Join thousands of educators using LearnOS to deliver better learning outcomes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" className="bg-card text-foreground hover:bg-card/90">
              Start free trial <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
              Talk to sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
