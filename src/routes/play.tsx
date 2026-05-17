import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckersBoard } from "@/components/CheckersBoard";
import { MentorBubble } from "@/components/MentorKnight";
import { applyMove, bestMove, DIFFICULTY_DEPTH, gameStatus, generateMoves, initialBoard, Move, Square, VARIANTS, VariantId } from "@/lib/checkers/engine";
import { SKINS, SkinId, applySkin } from "@/lib/skins";

export const Route = createFileRoute("/play")({
  head: () => ({ meta: [{ title: "Play — Navy" }, { name: "description", content: "Play checkers against the Navy AI across six international variants." }] }),
  component: PlayPage,
});

type Difficulty = "beginner" | "intermediate" | "master" | "guru";

function PlayPage() {
  const [variantId, setVariantId] = useState<VariantId>("american");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [skin, setSkin] = useState<SkinId>("neon");
  const variant = VARIANTS[variantId];

  const [board, setBoard] = useState(() => initialBoard(variant));
  const [toMove, setToMove] = useState<"w" | "b">("w");
  const [selected, setSelected] = useState<Square | null>(null);
  const [thinking, setThinking] = useState(false);
  const [mentor, setMentor] = useState<string>("Your move. Take your time.");
  const [mentorMood, setMentorMood] = useState<"idle"|"happy"|"thinking"|"sad"|"wow">("idle");

  useEffect(() => { applySkin(skin); }, [skin]);
  useEffect(() => { setBoard(initialBoard(variant)); setToMove("w"); setSelected(null); }, [variantId]);

  const legal = useMemo(() => generateMoves(board, variant, toMove), [board, variant, toMove]);
  const status = useMemo(() => gameStatus(board, variant, toMove), [board, variant, toMove]);

  useEffect(() => {
    if (toMove !== "b" || status !== "playing") return;
    setThinking(true);
    setMentorMood("thinking");
    setMentor("Thinking…");
    const t = setTimeout(() => {
      const m = bestMove(board, variant, "b", DIFFICULTY_DEPTH[difficulty]);
      if (m) {
        const nb = applyMove(board, variant, m);
        setBoard(nb);
        setToMove("w");
        if (m.captures.length > 1) { setMentor(`Multi-jump! ${m.captures.length} pieces gone.`); setMentorMood("wow"); }
        else if (m.captures.length === 1) { setMentor("I took one. Watch your flanks."); setMentorMood("happy"); }
        else { setMentor("Your move."); setMentorMood("idle"); }
      }
      setThinking(false);
    }, 300);
    return () => clearTimeout(t);
  }, [toMove, board, variant, difficulty, status]);

  function handleSquare(s: Square) {
    if (toMove !== "w" || thinking || status !== "playing") return;
    const p = board[s.r][s.c];
    if (selected) {
      const move = legal.find(m => m.from.r === selected.r && m.from.c === selected.c && m.to.r === s.r && m.to.c === s.c);
      if (move) {
        setBoard(applyMove(board, variant, move));
        setToMove("b");
        setSelected(null);
        if (move.captures.length > 1) { setMentor("Beautiful combination!"); setMentorMood("wow"); }
        else if (move.captures.length) { setMentor("Nice capture."); setMentorMood("happy"); }
        else { setMentor("Solid move."); setMentorMood("idle"); }
        return;
      }
    }
    if (p && p.color === "w") setSelected(s);
    else setSelected(null);
  }

  const reset = () => { setBoard(initialBoard(variant)); setToMove("w"); setSelected(null); setMentor("New game. You're white."); setMentorMood("idle"); };

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 flex items-center justify-between border-b border-border">
        <Link to="/" className="font-semibold" style={{ fontFamily: "Fraunces, serif" }}>← Navy</Link>
        <div className="flex gap-2 text-sm">
          <select value={variantId} onChange={e => setVariantId(e.target.value as VariantId)} className="bg-card border border-border rounded-full px-3 py-1.5">
            {Object.values(VARIANTS).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)} className="bg-card border border-border rounded-full px-3 py-1.5">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="master">Master</option>
            <option value="guru">Guru</option>
          </select>
          <select value={skin} onChange={e => setSkin(e.target.value as SkinId)} className="bg-card border border-border rounded-full px-3 py-1.5">
            {SKINS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <CheckersBoard board={board} variant={variant} selected={selected} legalMoves={legal} onSquareClick={handleSquare} />
          {status !== "playing" && (
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold">{status === "white_wins" ? "You won!" : status === "black_wins" ? "Navy wins." : "Draw."}</h2>
              <button onClick={reset} className="pill-btn bg-primary text-primary-foreground mt-4">Play again</button>
            </div>
          )}
        </div>
        <aside className="space-y-4">
          <MentorBubble mood={mentorMood}>{mentor}</MentorBubble>
          <div className="card-soft p-4 text-sm space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Variant</span><span className="font-medium">{variant.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Difficulty</span><span className="font-medium capitalize">{difficulty}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">To move</span><span className="font-medium">{toMove === "w" ? "You" : "Navy"}</span></div>
          </div>
          <button onClick={reset} className="pill-btn bg-card border border-border w-full">Resign / New game</button>
        </aside>
      </main>
    </div>
  );
}