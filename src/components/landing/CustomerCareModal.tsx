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

const WHATSAPP_URL = "https://wa.link/yk5oa4";

const OPTIONS = [
  { label: "Institution / School", phrase: "an Institution / School" },
  { label: "Tutoring Company", phrase: "a Tutoring Company" },
  { label: "Independent Tutor", phrase: "an Independent Tutor" },
  { label: "Parent", phrase: "a Parent" },
  { label: "Student", phrase: "a Student" },
  { label: "Training Organization", phrase: "a Training Organization" },
  { label: "Other", phrase: "Other" },
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
    const opt = OPTIONS.find((o) => o.label === selected);
    if (!opt) return;
    const message = `Hello, I am interested in your LearnOS services as ${opt.phrase}.`;
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
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
          <DialogTitle>Customer Care</DialogTitle>
          <DialogDescription>
            Tell us a little about yourself so we can connect you with the right LearnOS team.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-2">
          {OPTIONS.map((o) => {
            const active = selected === o.label;
            return (
              <button
                key={o.label}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(o.label)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left text-sm font-medium shadow-soft transition-colors",
                  active
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border bg-surface/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {o.label}
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
