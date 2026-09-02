import { useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Standard WhatsApp click-to-chat URL only. No WhatsApp API integration.
// Number resolved from the existing wa.link/yk5oa4 destination.
const WHATSAPP_PHONE = "2349165621724";

function buildWhatsAppUrl(label: string) {
  const message = `Hello, I am interested in LearnOS services as a ${label}. I would like to learn more.`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

const OPTIONS = [
  {
    label: "Institution / School",
    phrase: "an Institution / School",
    description: "I’m interested in LearnOS for my school or institution.",
  },
  {
    label: "Tutoring Company",
    phrase: "a Tutoring Company",
    description: "I’m interested in LearnOS for my tutoring company.",
  },
  {
    label: "Independent Tutor",
    phrase: "an Independent Tutor",
    description: "I’m interested in LearnOS as an independent tutor.",
  },
  {
    label: "Parent",
    phrase: "a Parent",
    description: "I’m interested in LearnOS for my child.",
  },
  {
    label: "Student",
    phrase: "a Student",
    description: "I’m interested in LearnOS as a student.",
  },
  {
    label: "Training Organization",
    phrase: "a Training Organization",
    description: "I’m interested in LearnOS for my training organization.",
  },
  {
    label: "Other",
    phrase: "Other",
    description: "I have another question about LearnOS.",
  },
] as const;

export function CustomerCareModal({
  children,
  open,
  onOpenChange,
}: {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = (v: boolean) => {
    if (!v) setSelected(null);
    if (isControlled) onOpenChange?.(v);
    else setInternalOpen(v);
  };

  function handleContinue() {
    if (!selected) return;
    // Standard wa.me click-to-chat: works on mobile (app) and desktop (WhatsApp Web).
    window.open(buildWhatsAppUrl(selected), "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="max-w-md border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <DialogTitle>How can we help?</DialogTitle>
          <DialogDescription>
            Tell us what you’re interested in and our team will be happy to assist.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-80 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {OPTIONS.map((o) => {
            const active = selected === o.label;
            return (
              <button
                key={o.label}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(o.label)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left shadow-soft transition-colors",
                  active
                    ? "border-primary/60 bg-primary/10"
                    : "border-border bg-surface/60 hover:border-primary/40",
                )}
              >
                <span className={cn("block text-sm font-medium", active ? "text-foreground" : "text-foreground")}>
                  {o.label}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{o.description}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!selected}
            onClick={handleContinue}
            className="bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-95"
          >
            Continue to WhatsApp <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
