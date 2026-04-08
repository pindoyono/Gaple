import { describe, it, expect } from 'vitest';
import { fullDominoSet, tileHasPip, tilePips, tilesEqual, unseenTiles, countTilesWithPip } from '../engine/domino';
import type { Tile } from '../engine/types';

describe('fullDominoSet', () => {
  it('generates exactly 28 tiles', () => {
    expect(fullDominoSet()).toHaveLength(28);
  });

  it('all tiles have low <= high', () => {
    for (const [a, b] of fullDominoSet()) {
      expect(a).toBeLessThanOrEqual(b);
    }
  });

  it('includes double-six', () => {
    const set = fullDominoSet();
    expect(set.some((t) => t[0] === 6 && t[1] === 6)).toBe(true);
  });

  it('includes 0-0', () => {
    const set = fullDominoSet();
    expect(set.some((t) => t[0] === 0 && t[1] === 0)).toBe(true);
  });
});

describe('tileHasPip', () => {
  it('detects pip on first side', () => {
    expect(tileHasPip([3, 5], 3)).toBe(true);
  });
  it('detects pip on second side', () => {
    expect(tileHasPip([3, 5], 5)).toBe(true);
  });
  it('returns false when pip absent', () => {
    expect(tileHasPip([3, 5], 4)).toBe(false);
  });
});

describe('tilePips', () => {
  it('sums both sides', () => {
    expect(tilePips([3, 5])).toBe(8);
    expect(tilePips([6, 6])).toBe(12);
    expect(tilePips([0, 0])).toBe(0);
  });
});

describe('tilesEqual', () => {
  it('equal when same order', () => {
    expect(tilesEqual([3, 5], [3, 5])).toBe(true);
  });
  it('equal when reversed', () => {
    expect(tilesEqual([3, 5], [5, 3])).toBe(true);
  });
  it('not equal for different tiles', () => {
    expect(tilesEqual([3, 5], [3, 4])).toBe(false);
  });
});

describe('countTilesWithPip', () => {
  it('counts correctly', () => {
    // [1,2] has pip 1; [1,1] has pip 1 → 2 tiles with pip 1
    const tiles: Tile[] = [[1, 2], [2, 3], [3, 4], [1, 1]];
    expect(countTilesWithPip(tiles, 1)).toBe(2);
    expect(countTilesWithPip(tiles, 2)).toBe(2);
    expect(countTilesWithPip(tiles, 5)).toBe(0);
  });
});

describe('unseenTiles', () => {
  it('excludes played and hand tiles', () => {
    const played: Tile[] = [[0, 0], [1, 1]];
    const hand: Tile[] = [[2, 2], [3, 3]];
    const unseen = unseenTiles(played, hand);
    expect(unseen).toHaveLength(24);
    expect(unseen.some((t) => tilesEqual(t, [0, 0]))).toBe(false);
    expect(unseen.some((t) => tilesEqual(t, [1, 1]))).toBe(false);
    expect(unseen.some((t) => tilesEqual(t, [2, 2]))).toBe(false);
    expect(unseen.some((t) => tilesEqual(t, [3, 3]))).toBe(false);
  });
});
