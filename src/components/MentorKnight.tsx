import { cn } from "@/lib/utils";

type Mood = "idle" | "happy" | "thinking" | "sad" | "wow";

/**
 * Navy mentor — a stylized knight character (not childish).
 * Inline SVG so it animates without external assets.
 */
export function MentorKnight({ mood = "idle", size = 96, className }: { mood?: Mood; size?: number; className?: string }) {
  const eyeShift = mood === "thinking" ? -2 : mood === "wow" ? 0 : 0;
  const browAngle = mood === "happy" ? -8 : mood === "sad" ? 12 : mood === "wow" ? -14 : 0;
  const mouthPath =
    mood === "happy" ? "M 38 64 Q 50 74 62 64"
    : mood === "sad" ? "M 38 70 Q 50 60 62 70"
    : mood === "wow" ? "M 50 66 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0"
    : "M 40 66 Q 50 70 60 66";

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("animate-breath drop-shadow-[0_8px_18px_rgba(80,50,20,0.25)]", className)}
      aria-label="Navy mentor"
    >
      <defs>
        <linearGradient id="helm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.55 0.06 55)" />
          <stop offset="100%" stopColor="oklch(0.32 0.05 50)" />
        </linearGradient>
        <linearGradient id="face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.92 0.04 75)" />
          <stop offset="100%" stopColor="oklch(0.82 0.05 70)" />
        </linearGradient>
      </defs>
      {/* shadow */}
      <ellipse cx="50" cy="94" rx="28" ry="3" fill="oklch(0.3 0.04 50 / 0.2)" />
      {/* knight body / base */}
      <path d="M 22 90 Q 50 78 78 90 L 78 96 L 22 96 Z" fill="url(#helm)" />
      {/* head shape — horse silhouette */}
      <path
        d="M 30 50 Q 22 28 42 18 Q 58 12 70 24 Q 80 38 76 56 L 76 74 Q 76 82 68 82 L 32 82 Q 24 82 24 74 Z"
        fill="url(#face)"
        stroke="oklch(0.3 0.04 50)"
        strokeWidth="1.5"
      />
      {/* mane */}
      <path d="M 22 40 Q 14 50 22 64 Q 26 56 30 58 Z" fill="oklch(0.45 0.06 55)" />
      {/* ear */}
      <path d="M 64 16 L 70 8 L 74 20 Z" fill="oklch(0.5 0.06 55)" />
      {/* eyebrows */}
      <g transform={`rotate(${browAngle} 50 40)`}>
        <rect x="34" y="38" width="10" height="2.5" rx="1" fill="oklch(0.25 0.04 50)" />
        <rect x="56" y="38" width="10" height="2.5" rx="1" fill="oklch(0.25 0.04 50)" />
      </g>
      {/* eyes */}
      <g transform={`translate(${eyeShift} 0)`}>
        <circle cx="40" cy="48" r="3.5" fill="oklch(0.2 0.04 50)" />
        <circle cx="60" cy="48" r="3.5" fill="oklch(0.2 0.04 50)" />
        <circle cx="41" cy="47" r="1" fill="white" />
        <circle cx="61" cy="47" r="1" fill="white" />
      </g>
      {/* mouth */}
      <path d={mouthPath} fill="none" stroke="oklch(0.25 0.04 50)" strokeWidth="2" strokeLinecap="round" />
      {/* crown */}
      <path d="M 38 18 L 42 12 L 46 16 L 50 10 L 54 16 L 58 12 L 62 18 Z" fill="oklch(0.78 0.12 80)" stroke="oklch(0.45 0.08 60)" strokeWidth="1" />
      <circle cx="50" cy="13" r="1.5" fill="oklch(0.65 0.18 30)" />
    </svg>
  );
}

export function MentorBubble({ children, mood = "idle" }: { children: React.ReactNode; mood?: Mood }) {
  return (
    <div className="flex items-end gap-3">
      <MentorKnight mood={mood} size={72} />
      <div className="relative bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 max-w-xs shadow-[var(--shadow-soft)] text-sm text-foreground">
        {children}
      </div>
    </div>
  );
}