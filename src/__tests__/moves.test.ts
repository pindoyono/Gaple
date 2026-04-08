import { describe, it, expect } from 'vitest';
import { getLegalMoves, canPlay } from '../engine/moves';
import type { Tile, BoardState } from '../engine/types';

describe('getLegalMoves - empty board', () => {
  it('returns one move per tile (all tiles valid for first move)', () => {
    const hand: Tile[] = [[3, 5], [1, 2], [6, 6]];
    const board: BoardState = { left: -1, right: -1 };
    const moves = getLegalMoves(hand, board);
    expect(moves).toHaveLength(3);
    moves.forEach((m) => expect(m.side).toBe('left'));
  });
});

describe('getLegalMoves - board with ends', () => {
  it('finds tile matching left end', () => {
    const hand: Tile[] = [[3, 5], [1, 2]];
    const board: BoardState = { left: 5, right: 2 };
    const moves = getLegalMoves(hand, board);
    // [3,5] matches left=5 and right doesn't match
    // [1,2] matches right=2 only
    expect(moves.some((m) => m.tile[0] === 3 && m.side === 'left')).toBe(true);
    expect(moves.some((m) => m.tile[1] === 2 && m.side === 'right')).toBe(true);
  });

  it('returns empty when no tiles match', () => {
    const hand: Tile[] = [[1, 2], [3, 4]];
    const board: BoardState = { left: 5, right: 6 };
    const moves = getLegalMoves(hand, board);
    expect(moves).toHaveLength(0);
  });

  it('double tile can play on either matching side', () => {
    const hand: Tile[] = [[5, 5]];
    const board: BoardState = { left: 5, right: 5 };
    const moves = getLegalMoves(hand, board);
    expect(moves).toHaveLength(2);
    expect(moves.some((m) => m.side === 'left')).toBe(true);
    expect(moves.some((m) => m.side === 'right')).toBe(true);
  });

  it('newEnd is the other pip after placement', () => {
    const hand: Tile[] = [[3, 5]];
    const board: BoardState = { left: 3, right: 6 };
    const moves = getLegalMoves(hand, board);
    expect(moves).toHaveLength(1);
    expect(moves[0].side).toBe('left');
    expect(moves[0].newEnd).toBe(5);
  });
});

describe('canPlay', () => {
  it('returns true when moves exist', () => {
    expect(canPlay([[3, 5]], { left: 5, right: 2 })).toBe(true);
  });
  it('returns false when no moves', () => {
    expect(canPlay([[1, 2]], { left: 5, right: 6 })).toBe(false);
  });
});
