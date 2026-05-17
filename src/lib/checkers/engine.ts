// Checkers engine — supports 6 international variants.
// Board[0] = top row (black home). Rows increase downward.

export type Color = "w" | "b";
export type Piece = { color: Color; king: boolean } | null;
export type Board = Piece[][];
export type Square = { r: number; c: number };
export type Move = { from: Square; to: Square; captures: Square[] };

export type VariantId = "american" | "english" | "russian" | "turkish" | "brazilian" | "canadian";

export interface VariantConfig {
  id: VariantId;
  name: string;
  size: number;
  rowsOfPieces: number;
  flyingKing: boolean;
  menCaptureBackward: boolean;
  mandatoryCapture: boolean;
  orthogonal: boolean;
}

export const VARIANTS: Record<VariantId, VariantConfig> = {
  american:  { id: "american",  name: "American Checkers", size: 8,  rowsOfPieces: 3, flyingKing: false, menCaptureBackward: false, mandatoryCapture: true, orthogonal: false },
  english:   { id: "english",   name: "English Draughts",  size: 8,  rowsOfPieces: 3, flyingKing: false, menCaptureBackward: false, mandatoryCapture: true, orthogonal: false },
  russian:   { id: "russian",   name: "Russian Draughts",  size: 8,  rowsOfPieces: 3, flyingKing: true,  menCaptureBackward: true,  mandatoryCapture: true, orthogonal: false },
  brazilian: { id: "brazilian", name: "Brazilian Draughts",size: 8,  rowsOfPieces: 3, flyingKing: true,  menCaptureBackward: true,  mandatoryCapture: true, orthogonal: false },
  canadian:  { id: "canadian",  name: "Canadian Checkers", size: 12, rowsOfPieces: 5, flyingKing: true,  menCaptureBackward: true,  mandatoryCapture: true, orthogonal: false },
  turkish:   { id: "turkish",   name: "Turkish Draughts",  size: 8,  rowsOfPieces: 2, flyingKing: true,  menCaptureBackward: true,  mandatoryCapture: true, orthogonal: true  },
};

export function initialBoard(v: VariantConfig): Board {
  const N = v.size;
  const b: Board = Array.from({ length: N }, () => Array(N).fill(null));
  if (v.orthogonal) {
    for (let r = 1; r <= v.rowsOfPieces; r++)
      for (let c = 0; c < N; c++) b[r][c] = { color: "b", king: false };
    for (let r = N - 1 - v.rowsOfPieces; r <= N - 2; r++)
      for (let c = 0; c < N; c++) b[r][c] = { color: "w", king: false };
    return b;
  }
  for (let r = 0; r < v.rowsOfPieces; r++)
    for (let c = 0; c < N; c++) if ((r + c) % 2 === 1) b[r][c] = { color: "b", king: false };
  for (let r = N - v.rowsOfPieces; r < N; r++)
    for (let c = 0; c < N; c++) if ((r + c) % 2 === 1) b[r][c] = { color: "w", king: false };
  return b;
}

const DIAG = [[-1,-1],[-1,1],[1,-1],[1,1]];
const ORTHO = [[-1,0],[1,0],[0,-1],[0,1]];
const dirs = (v: VariantConfig) => v.orthogonal ? ORTHO : DIAG;
const inBounds = (N: number, r: number, c: number) => r>=0 && r<N && c>=0 && c<N;
const forwardSign = (color: Color) => color === "w" ? -1 : 1;

export function generateMoves(board: Board, v: VariantConfig, color: Color): Move[] {
  const captures: Move[] = [];
  const quiet: Move[] = [];
  const N = v.size;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const p = board[r][c];
    if (!p || p.color !== color) continue;
    collectCaptures(board, v, { r, c }, { r, c }, p, [], captures);
    if (captures.length === 0) collectQuiet(board, v, { r, c }, p, quiet);
  }
  if (v.mandatoryCapture && captures.length > 0) {
    const max = Math.max(...captures.map(m => m.captures.length));
    return captures.filter(m => m.captures.length === max);
  }
  return captures.length ? captures : quiet;
}

function collectQuiet(board: Board, v: VariantConfig, from: Square, p: NonNullable<Piece>, out: Move[]) {
  const N = v.size;
  for (const [dr, dc] of dirs(v)) {
    if (!p.king) {
      if (!v.orthogonal && dr !== forwardSign(p.color)) continue;
      if (v.orthogonal) {
        if (p.color === "w" && dr === 1) continue;
        if (p.color === "b" && dr === -1) continue;
      }
      const nr = from.r + dr, nc = from.c + dc;
      if (inBounds(N, nr, nc) && !board[nr][nc]) out.push({ from, to: { r: nr, c: nc }, captures: [] });
    } else {
      let nr = from.r + dr, nc = from.c + dc;
      while (inBounds(N, nr, nc) && !board[nr][nc]) {
        out.push({ from, to: { r: nr, c: nc }, captures: [] });
        if (!v.flyingKing) break;
        nr += dr; nc += dc;
      }
    }
  }
}

function collectCaptures(board: Board, v: VariantConfig, origin: Square, from: Square, p: NonNullable<Piece>, path: Square[], out: Move[]) {
  const N = v.size;
  for (const [dr, dc] of dirs(v)) {
    if (!p.king && !v.menCaptureBackward && !v.orthogonal && dr !== forwardSign(p.color)) continue;
    if (!p.king && v.orthogonal && !v.menCaptureBackward) {
      if (p.color === "w" && dr === 1) continue;
      if (p.color === "b" && dr === -1) continue;
    }
    if (!p.king) {
      const er = from.r + dr, ec = from.c + dc;
      const lr = from.r + 2*dr, lc = from.c + 2*dc;
      if (!inBounds(N, lr, lc)) continue;
      const enemy = board[er]?.[ec];
      if (!enemy || enemy.color === p.color) continue;
      if (board[lr][lc] && !(lr === origin.r && lc === origin.c)) continue;
      if (path.some(s => s.r === er && s.c === ec)) continue;
      const nb = board.map(row => row.slice());
      nb[origin.r][origin.c] = null;
      nb[from.r][from.c] = null;
      nb[er][ec] = null;
      nb[lr][lc] = p;
      const newPath = [...path, { r: er, c: ec }];
      const sub: Move[] = [];
      collectCaptures(nb, v, origin, { r: lr, c: lc }, p, newPath, sub);
      if (sub.length === 0) out.push({ from: origin, to: { r: lr, c: lc }, captures: newPath });
      else for (const s of sub) out.push(s);
    } else {
      let er = from.r + dr, ec = from.c + dc;
      while (inBounds(N, er, ec) && !board[er][ec]) { er += dr; ec += dc; }
      if (!inBounds(N, er, ec)) continue;
      const enemy = board[er][ec];
      if (!enemy || enemy.color === p.color) continue;
      if (path.some(s => s.r === er && s.c === ec)) continue;
      let lr = er + dr, lc = ec + dc;
      while (inBounds(N, lr, lc) && (!board[lr][lc] || (lr === origin.r && lc === origin.c))) {
        const nb = board.map(row => row.slice());
        nb[origin.r][origin.c] = null;
        nb[from.r][from.c] = null;
        nb[er][ec] = null;
        nb[lr][lc] = p;
        const newPath = [...path, { r: er, c: ec }];
        const sub: Move[] = [];
        collectCaptures(nb, v, origin, { r: lr, c: lc }, p, newPath, sub);
        if (sub.length === 0) out.push({ from: origin, to: { r: lr, c: lc }, captures: newPath });
        else for (const s of sub) out.push(s);
        if (!v.flyingKing) break;
        lr += dr; lc += dc;
      }
    }
  }
}

export function applyMove(board: Board, v: VariantConfig, move: Move): Board {
  const nb = board.map(row => row.slice());
  const p = nb[move.from.r][move.from.c]!;
  nb[move.from.r][move.from.c] = null;
  for (const cap of move.captures) nb[cap.r][cap.c] = null;
  let king = p.king;
  if (!king) {
    if (p.color === "w" && move.to.r === 0) king = true;
    if (p.color === "b" && move.to.r === v.size - 1) king = true;
  }
  nb[move.to.r][move.to.c] = { color: p.color, king };
  return nb;
}

export function gameStatus(board: Board, v: VariantConfig, toMove: Color): "playing"|"white_wins"|"black_wins"|"draw" {
  const moves = generateMoves(board, v, toMove);
  if (moves.length === 0) return toMove === "w" ? "black_wins" : "white_wins";
  let w = 0, b = 0;
  for (const row of board) for (const p of row) { if (!p) continue; p.color === "w" ? w++ : b++; }
  if (w === 1 && b === 1) return "draw";
  return "playing";
}

function evaluate(board: Board): number {
  let s = 0;
  for (const row of board) for (const p of row) {
    if (!p) continue;
    const val = p.king ? 3 : 1;
    s += p.color === "w" ? val : -val;
  }
  return s;
}

export function bestMove(board: Board, v: VariantConfig, color: Color, depth: number): Move | null {
  const moves = generateMoves(board, v, color);
  if (moves.length === 0) return null;
  // Randomize for variety at low depths
  for (let i = moves.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [moves[i], moves[j]] = [moves[j], moves[i]];
  }
  let best = moves[0];
  let bestScore = color === "w" ? -Infinity : Infinity;
  for (const m of moves) {
    const nb = applyMove(board, v, m);
    const score = minimax(nb, v, color === "w" ? "b" : "w", depth - 1, -Infinity, Infinity);
    if (color === "w" ? score > bestScore : score < bestScore) {
      bestScore = score; best = m;
    }
  }
  return best;
}

function minimax(board: Board, v: VariantConfig, toMove: Color, depth: number, alpha: number, beta: number): number {
  if (depth <= 0) return evaluate(board);
  const moves = generateMoves(board, v, toMove);
  if (moves.length === 0) return toMove === "w" ? -1000 : 1000;
  if (toMove === "w") {
    let value = -Infinity;
    for (const m of moves) {
      value = Math.max(value, minimax(applyMove(board, v, m), v, "b", depth - 1, alpha, beta));
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return value;
  } else {
    let value = Infinity;
    for (const m of moves) {
      value = Math.min(value, minimax(applyMove(board, v, m), v, "w", depth - 1, alpha, beta));
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return value;
  }
}

export const DIFFICULTY_DEPTH: Record<string, number> = {
  beginner: 1,
  intermediate: 3,
  master: 5,
  guru: 6,
};