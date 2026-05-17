import { useMemo } from "react";
import { Board, Move, Square, VariantConfig } from "@/lib/checkers/engine";
import { cn } from "@/lib/utils";

interface Props {
  board: Board;
  variant: VariantConfig;
  selected: Square | null;
  legalMoves: Move[];
  onSquareClick: (s: Square) => void;
  flipped?: boolean;
}

export function CheckersBoard({ board, variant, selected, legalMoves, onSquareClick, flipped }: Props) {
  const N = variant.size;
  const targets = useMemo(() => {
    if (!selected) return new Set<string>();
    return new Set(legalMoves.filter(m => m.from.r === selected.r && m.from.c === selected.c).map(m => `${m.to.r},${m.to.c}`));
  }, [selected, legalMoves]);

  const rows = flipped ? [...Array(N).keys()].reverse() : [...Array(N).keys()];
  const cols = flipped ? [...Array(N).keys()].reverse() : [...Array(N).keys()];

  return (
    <div
      className="grid rounded-2xl p-3 shadow-[var(--shadow-soft)] aspect-square w-full max-w-[560px] mx-auto"
      style={{ background: "var(--board-frame)" }}
    >
      <div className="grid w-full h-full rounded-lg overflow-hidden" style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }}>
        {rows.map(r => cols.map(c => {
          const dark = (r + c) % 2 === 1;
          const p = board[r][c];
          const isSel = selected?.r === r && selected?.c === c;
          const isTarget = targets.has(`${r},${c}`);
          return (
            <button
              key={`${r}-${c}`}
              onClick={() => onSquareClick({ r, c })}
              className={cn(
                "relative flex items-center justify-center transition-all",
                isSel && "ring-2 ring-inset ring-yellow-300/80",
              )}
              style={{ background: dark ? "var(--board-dark)" : "var(--board-light)" }}
            >
              {p && (
                <div
                  className="w-[78%] h-[78%] rounded-full animate-piece-pop flex items-center justify-center"
                  style={{
                    background: p.color === "w" ? "var(--piece-white)" : "var(--piece-black)",
                    boxShadow: "var(--board-glow), inset 0 -4px 8px rgba(0,0,0,0.25), inset 0 3px 6px rgba(255,255,255,0.25)",
                  }}
                >
                  {p.king && (
                    <span className="text-[1.5rem] leading-none" style={{ color: p.color === "w" ? "oklch(0.4 0.1 60)" : "oklch(0.85 0.08 60)" }}>♛</span>
                  )}
                </div>
              )}
              {isTarget && (
                <div className="absolute w-[28%] h-[28%] rounded-full bg-yellow-300/70 animate-pulse pointer-events-none" />
              )}
            </button>
          );
        }))}
      </div>
    </div>
  );
}