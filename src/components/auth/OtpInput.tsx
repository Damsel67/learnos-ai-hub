import { useRef } from "react";

export function OtpInput({
  value,
  onChange,
  invalid,
  disabled,
  onComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  onComplete?: (v: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const set = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, 6);
    onChange(clean);
    if (clean.length === 6) onComplete?.(clean);
    return clean;
  };

  const handleChange = (i: number, raw: string) => {
    const typed = raw.replace(/\D/g, "");
    if (!typed) return;
    if (typed.length > 1) {
      const clean = set((value.slice(0, i) + typed).slice(0, 6));
      refs.current[Math.min(clean.length, 5)]?.focus();
      return;
    }
    const arr = digits.slice();
    arr[i] = typed;
    set(arr.join("").slice(0, 6));
    refs.current[Math.min(i + 1, 5)]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const arr = digits.slice();
      if (arr[i]) {
        arr[i] = "";
        set(arr.join(""));
      } else if (i > 0) {
        arr[i - 1] = "";
        set(arr.join(""));
        refs.current[i - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      refs.current[i + 1]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" role="group" aria-label="Verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => {
            e.preventDefault();
            const clean = set(e.clipboardData.getData("text"));
            refs.current[Math.min(clean.length, 5)]?.focus();
          }}
          onFocus={(e) => e.currentTarget.select()}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          className={`h-12 w-11 rounded-xl border bg-surface/60 text-center text-lg font-semibold tabular-nums shadow-card backdrop-blur-xl outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-60 sm:h-14 sm:w-12 ${
            invalid ? "border-destructive focus:border-destructive focus:ring-destructive/30" : "border-border"
          }`}
        />
      ))}
    </div>
  );
}
