import { describe, it, expect } from 'vitest';
import { getRecommendations, rankMoves } from '../engine/scorer';
import type { GameContext } from '../engine/types';

describe('getRecommendations', () => {
  it('returns empty array when no legal moves', () => {
    const ctx: GameContext = {
      hand: [[1, 2], [3, 4]],
      board: { left: 5, right: 6 },
      playedTiles: [],
      passInfo: [],
    };
    expect(getRecommendations(ctx)).toHaveLength(0);
  });

  it('returns at most topN recommendations', () => {
    const ctx: GameContext = {
      hand: [[3, 5], [1, 5], [5, 6], [0, 5], [2, 5]],
      board: { left: 5, right: 3 },
      playedTiles: [],
      passInfo: [],
    };
    const recs = getRecommendations(ctx, 3);
    expect(recs.length).toBeLessThanOrEqual(3);
    expect(recs.length).toBeGreaterThan(0);
  });

  it('first recommendation has highest or equal score', () => {
    const ctx: GameContext = {
      hand: [[3, 5], [1, 5], [5, 6]],
      board: { left: 5, right: 3 },
      playedTiles: [],
      passInfo: [],
    };
    const recs = getRecommendations(ctx, 3);
    for (let i = 1; i < recs.length; i++) {
      expect(recs[0].score).toBeGreaterThanOrEqual(recs[i].score);
    }
  });

  it('gives bonus for pass exploitation', () => {
    const ctxWithPass: GameContext = {
      hand: [[3, 5], [1, 4]],
      board: { left: 5, right: 4 },
      playedTiles: [],
      passInfo: [{ playerIndex: 1, endNumber: 3 }],
    };
    const ctxWithoutPass: GameContext = {
      ...ctxWithPass,
      passInfo: [],
    };
    const withPass = rankMoves(ctxWithPass);
    const withoutPass = rankMoves(ctxWithoutPass);

    // Find the move that leads to end=3 in both rankings
    const moveToEnd3WithPass = withPass.find((m) => m.move.newEnd === 3);
    const moveToEnd3WithoutPass = withoutPass.find((m) => m.move.newEnd === 3);

    if (moveToEnd3WithPass && moveToEnd3WithoutPass) {
      expect(moveToEnd3WithPass.score).toBeGreaterThan(moveToEnd3WithoutPass.score);
    }
  });

  it('each recommendation has a non-empty reason string', () => {
    const ctx: GameContext = {
      hand: [[3, 5], [5, 6]],
      board: { left: 5, right: 2 },
      playedTiles: [],
      passInfo: [],
    };
    const recs = getRecommendations(ctx, 3);
    for (const rec of recs) {
      expect(rec.reason.length).toBeGreaterThan(0);
    }
  });

  it('works with empty board (first move)', () => {
    const ctx: GameContext = {
      hand: [[6, 6], [5, 5], [3, 4]],
      board: { left: -1, right: -1 },
      playedTiles: [],
      passInfo: [],
    };
    const recs = getRecommendations(ctx, 3);
    expect(recs.length).toBeGreaterThan(0);
  });
});
