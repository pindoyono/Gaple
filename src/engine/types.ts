/**
 * Core type definitions for the Gaple game engine.
 * Domino set: 0–6 (28 tiles total)
 */

/** A single domino tile represented as [low, high] where low <= high */
export type Tile = [number, number];

/** A side of the board */
export type Side = 'left' | 'right';

/** A legal move that can be made */
export interface Move {
  tile: Tile;
  side: Side;
  /** The new board end after this move is placed */
  newEnd: number;
}

/** The current state of the game board ends */
export interface BoardState {
  /** Left end of the board (-1 if board is empty) */
  left: number;
  /** Right end of the board (-1 if board is empty) */
  right: number;
}

/** A scored move with reasoning */
export interface ScoredMove {
  move: Move;
  score: number;
  reason: string;
}

/**
 * Information about a player's pass/ketuk (knock).
 * If player passed when a certain number was at one end,
 * they likely don't have that number.
 */
export interface PassInfo {
  /** Player index (0–3) */
  playerIndex: number;
  /** The board end number they knocked on */
  endNumber: number;
}

/** Full game context for recommendation */
export interface GameContext {
  /** Tiles in the user's hand */
  hand: Tile[];
  /** Current board state */
  board: BoardState;
  /** Tiles already played on the table (visible) */
  playedTiles: Tile[];
  /** Pass/knock information from other players */
  passInfo: PassInfo[];
}
