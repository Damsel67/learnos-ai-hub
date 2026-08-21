import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { destinationFor, type Profile } from "@/hooks/use-auth";

export function VerificationSuccess({
  title = "Email verification complete",
  lines = ["Your email has been successfully verified.", "You can now continue to your LearnOS account."],
}: {
  title?: string;
  lines?: string[];
}) {
  const navigate = useNavigate();
  const [going, setGoing] = useState(false);

  const [destination, setDestination] = useState("/login");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      if (!userId) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, account_type, onboarding_completed")
        .eq("id", userId)
        .maybeSingle();
      if (!cancelled) setDestination(destinationFor((profile as Profile | null) ?? null));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
        <CheckCircle2 className="h-7 w-7" />
      </span>
      <div className="space-y-1.5">
        <p className="text-lg font-semibold tracking-tight">{title}</p>
        {lines.map((l) => (
          <p key={l} className="text-[0.9375rem] leading-relaxed text-muted-foreground">
            {l}
          </p>
        ))}
      </div>
      <button
        type="button"
        disabled={going}
        onClick={() => {
          setGoing(true);
          navigate({ to: destination as never, replace: true });
        }}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-95 disabled:opacity-60"
      >
        {going && <Loader2 className="h-4 w-4 animate-spin" />}
        Continue to LearnOS <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
