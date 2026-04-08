/**
 * Heuristic scorer for Gaple moves.
 *
 * Scoring components:
 * 1. End control: prefer board ends that are well-supported in remaining tiles.
 * 2. Pip reduction: prefer discarding high-pip tiles to reduce hand weight.
 * 3. Deadlock avoidance: penalize moves that create ends with few/no follow-ups.
 * 4. Pass exploitation: bonus if move directs an end toward a pip the opponent knocked on.
 *
 * Returns a ScoredMove for each Move, sorted best-first.
 */
import type { Tile, ScoredMove, GameContext, PassInfo } from './types';
import { tileHasPip, tilePips, unseenTiles, countTilesWithPip } from './domino';
import { getLegalMoves } from './moves';

const WEIGHTS = {
  endControl: 3.0,
  pipReduction: 1.5,
  deadlockPenalty: -4.0,
  passExploit: 5.0,
  balak: 0.5, // small bonus for playing doubles (balak)
};

function scoreEndControl(newEnd: number, remainingTiles: Tile[]): number {
  // How many unseen tiles can follow this end?
  const support = countTilesWithPip(remainingTiles, newEnd);
  return (support / 6) * WEIGHTS.endControl; // max 6 tiles of any single number
}

function scorePipReduction(tile: Tile): number {
  const pips = tilePips(tile);
  return (pips / 12) * WEIGHTS.pipReduction; // max 12 pips (6-6)
}

function scoreDeadlockRisk(newEnd: number, hand: Tile[], remainingTiles: Tile[]): number {
  // Count how many tiles in hand + unseen can continue from newEnd
  const handSupport = hand.filter((t) => tileHasPip(t, newEnd)).length;
  const unseenSupport = countTilesWithPip(remainingTiles, newEnd);
  if (handSupport === 0 && unseenSupport === 0) {
    return WEIGHTS.deadlockPenalty;
  }
  return 0;
}

function scorePassExploit(newEnd: number, passInfo: PassInfo[]): number {
  // If an opponent knocked when this number was an end, they likely lack it
  // → directing the end there blocks them
  const knockCount = passInfo.filter((p) => p.endNumber === newEnd).length;
  return knockCount * WEIGHTS.passExploit;
}

function scoreBalak(tile: Tile): number {
  return tile[0] === tile[1] ? WEIGHTS.balak : 0;
}

/**
 * Build a human-readable reason for a move score.
 */
function buildReason(
  endControlScore: number,
  pipScore: number,
  deadlockScore: number,
  passScore: number,
  tile: Tile,
  side: 'left' | 'right',
  newEnd: number,
): string {
  const parts: string[] = [];

  if (passScore > 0) {
    parts.push(`arahkan ujung ke ${newEnd} (lawan pernah ketuk di sini)`);
  }
  if (endControlScore >= 2) {
    parts.push(`angka ${newEnd} banyak didukung ubin tersisa`);
  } else if (endControlScore < 1) {
    parts.push(`angka ${newEnd} sedikit dukungan`);
  }
  if (pipScore >= 1) {
    parts.push(`buang pip tinggi (${tilePips(tile)})`);
  }
  if (deadlockScore < 0) {
    parts.push(`⚠️ risiko buntu di ${newEnd}`);
  }

  const tileStr = `[${tile[0]}-${tile[1]}]`;
  const sideStr = side === 'left' ? 'kiri' : 'kanan';
  const base = `Mainkan ${tileStr} ke ${sideStr} → ujung jadi ${newEnd}`;
  return parts.length > 0 ? `${base}. ${parts.join(', ')}.` : `${base}.`;
}

/**
 * Score and rank all legal moves for the given game context.
 * Returns top moves sorted by score descending.
 */
export function rankMoves(context: GameContext): ScoredMove[] {
  const { hand, board, playedTiles, passInfo } = context;
  const moves = getLegalMoves(hand, board);

  if (moves.length === 0) return [];

  const remaining = unseenTiles(playedTiles, hand);

  const scored: ScoredMove[] = moves.map((move) => {
    // After this move, remove the tile from hand temporarily
    const handAfter = hand.filter(
      (t) => !(t[0] === move.tile[0] && t[1] === move.tile[1]),
    );

    const endControlScore = scoreEndControl(move.newEnd, remaining);
    const pipScore = scorePipReduction(move.tile);
    const deadlockScore = scoreDeadlockRisk(move.newEnd, handAfter, remaining);
    const passScore = scorePassExploit(move.newEnd, passInfo);
    const balakScore = scoreBalak(move.tile);

    const total = endControlScore + pipScore + deadlockScore + passScore + balakScore;

    const reason = buildReason(
      endControlScore,
      pipScore,
      deadlockScore,
      passScore,
      move.tile,
      move.side,
      move.newEnd,
    );

    return { move, score: total, reason };
  });

  // Sort by score descending, break ties by pip reduction (higher pips first)
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return tilePips(b.move.tile) - tilePips(a.move.tile);
  });

  // Deduplicate: if the same tile appears for both left and right, keep only the best
  const seen = new Set<string>();
  const deduped: ScoredMove[] = [];
  for (const sm of scored) {
    const key = `${sm.move.tile[0]}-${sm.move.tile[1]}-${sm.move.side}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(sm);
    }
  }

  return deduped;
}

/**
 * Get top N recommended moves (default 3: 1 best + 2 alternatives).
 */
export function getRecommendations(context: GameContext, topN = 3): ScoredMove[] {
  return rankMoves(context).slice(0, topN);
}
