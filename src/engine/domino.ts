/**
 * Domino utilities: generates all 28 tiles, checks connectivity, etc.
 */
import type { Tile } from './types';

/** Generate the full set of 28 domino tiles (0–6) */
export function fullDominoSet(): Tile[] {
  const tiles: Tile[] = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      tiles.push([i, j]);
    }
  }
  return tiles;
}

/** Check if a tile has a given pip value on either side */
export function tileHasPip(tile: Tile, pip: number): boolean {
  return tile[0] === pip || tile[1] === pip;
}

/** Get the other side of a tile given one matching side's pip */
export function getOtherSide(tile: Tile, pip: number): number {
  if (tile[0] === pip) return tile[1];
  if (tile[1] === pip) return tile[0];
  throw new Error(`Tile [${tile}] does not have pip ${pip}`);
}

/** Total pip count of a tile */
export function tilePips(tile: Tile): number {
  return tile[0] + tile[1];
}

/** Whether two tiles are equal (order-independent) */
export function tilesEqual(a: Tile, b: Tile): boolean {
  return (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);
}

/** Count how many tiles in a set have a given pip value */
export function countTilesWithPip(tiles: Tile[], pip: number): number {
  return tiles.filter((t) => tileHasPip(t, pip)).length;
}

/** Infer which tiles are still "unseen" given played tiles and hand */
export function unseenTiles(played: Tile[], hand: Tile[]): Tile[] {
  const all = fullDominoSet();
  return all.filter(
    (t) => !played.some((p) => tilesEqual(p, t)) && !hand.some((h) => tilesEqual(h, t)),
  );
}
