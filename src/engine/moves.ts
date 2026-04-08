/**
 * Move generator: finds all legal moves from a hand given the current board state.
 */
import type { Tile, BoardState, Move } from './types';
import { tileHasPip, getOtherSide } from './domino';

/**
 * Get all legal moves for the given hand and board.
 * When the board is empty (both ends are -1), any tile can be played to the left.
 */
export function getLegalMoves(hand: Tile[], board: BoardState): Move[] {
  const moves: Move[] = [];
  const isEmpty = board.left === -1 && board.right === -1;

  for (const tile of hand) {
    if (isEmpty) {
      // First move: play tile on the left side; left end becomes tile[0], right becomes tile[1]
      moves.push({
        tile,
        side: 'left',
        newEnd: tile[0], // left end after placement
      });
    } else {
      // Try placing on the left
      if (tileHasPip(tile, board.left)) {
        moves.push({
          tile,
          side: 'left',
          newEnd: getOtherSide(tile, board.left),
        });
      }
      // Try placing on the right
      if (tileHasPip(tile, board.right)) {
        moves.push({
          tile,
          side: 'right',
          newEnd: getOtherSide(tile, board.right),
        });
      }
    }
  }

  return moves;
}

/** Check if any move is available (player can play, doesn't need to pass) */
export function canPlay(hand: Tile[], board: BoardState): boolean {
  return getLegalMoves(hand, board).length > 0;
}
