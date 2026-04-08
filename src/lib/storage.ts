/**
 * Local storage layer using IndexedDB (via `idb`).
 * Stores matches, rounds, and move recommendations.
 */
import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'gaple-assistant';
const DB_VERSION = 1;

export interface Player {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  name: string;
  createdAt: string;
  players: [Player, Player, Player, Player]; // exactly 4 players
  teams: [[string, string], [string, string]]; // team A: [p0id, p2id], team B: [p1id, p3id]
  status: 'active' | 'finished';
  winnerTeam?: 0 | 1; // 0 = team A, 1 = team B
}

export interface RoundRecommendation {
  tile: [number, number];
  side: 'left' | 'right';
  reason: string;
  chosen: boolean;
}

export interface Round {
  id: string;
  matchId: string;
  roundNumber: number;
  createdAt: string;
  boardLeft: number;
  boardRight: number;
  playerHand?: [number, number][];
  recommendation?: RoundRecommendation;
  winnerTeam?: 0 | 1;
  pointsTeamA?: number;
  pointsTeamB?: number;
  notes?: string;
}

type GapleDB = {
  matches: {
    key: string;
    value: Match;
  };
  rounds: {
    key: string;
    value: Round;
    indexes: { 'by-match': string };
  };
};

let dbPromise: Promise<IDBPDatabase<GapleDB>> | null = null;

function getDB(): Promise<IDBPDatabase<GapleDB>> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is only available in the browser'));
  }
  if (!dbPromise) {
    dbPromise = openDB<GapleDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('matches')) {
          db.createObjectStore('matches', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('rounds')) {
          const roundStore = db.createObjectStore('rounds', { keyPath: 'id' });
          roundStore.createIndex('by-match', 'matchId');
        }
      },
    });
  }
  return dbPromise;
}

// ── Match operations ──────────────────────────────────────────────────────────

export async function saveMatch(match: Match): Promise<void> {
  const db = await getDB();
  await db.put('matches', match);
}

export async function getMatch(id: string): Promise<Match | undefined> {
  const db = await getDB();
  return db.get('matches', id);
}

export async function getAllMatches(): Promise<Match[]> {
  const db = await getDB();
  const all = await db.getAll('matches');
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteMatch(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['matches', 'rounds'], 'readwrite');
  await tx.objectStore('matches').delete(id);
  const index = tx.objectStore('rounds').index('by-match');
  const keys = await index.getAllKeys(id);
  for (const key of keys) {
    await tx.objectStore('rounds').delete(key);
  }
  await tx.done;
}

// ── Round operations ───────────────────────────────────────────────────────────

export async function saveRound(round: Round): Promise<void> {
  const db = await getDB();
  await db.put('rounds', round);
}

export async function getRoundsForMatch(matchId: string): Promise<Round[]> {
  const db = await getDB();
  const rounds = await db.getAllFromIndex('rounds', 'by-match', matchId);
  return rounds.sort((a, b) => a.roundNumber - b.roundNumber);
}

// ── Export helpers ─────────────────────────────────────────────────────────────

export async function exportMatchAsJSON(matchId: string): Promise<string> {
  const match = await getMatch(matchId);
  const rounds = await getRoundsForMatch(matchId);
  return JSON.stringify({ match, rounds }, null, 2);
}

export async function exportMatchAsCSV(matchId: string): Promise<string> {
  const match = await getMatch(matchId);
  const rounds = await getRoundsForMatch(matchId);

  if (!match) return '';

  const header = 'Ronde,Waktu,Ujung Kiri,Ujung Kanan,Pemenang Tim,Poin Tim A,Poin Tim B,Catatan';
  const rows = rounds.map((r) =>
    [
      r.roundNumber,
      r.createdAt,
      r.boardLeft,
      r.boardRight,
      r.winnerTeam !== undefined ? (r.winnerTeam === 0 ? match.teams[0].join('+') : match.teams[1].join('+')) : '',
      r.pointsTeamA ?? '',
      r.pointsTeamB ?? '',
      r.notes ?? '',
    ].join(','),
  );
  return [header, ...rows].join('\n');
}

export async function exportAllAsJSON(): Promise<string> {
  const matches = await getAllMatches();
  const data = await Promise.all(
    matches.map(async (m) => ({
      match: m,
      rounds: await getRoundsForMatch(m.id),
    })),
  );
  return JSON.stringify(data, null, 2);
}

// ── Analytics helpers ──────────────────────────────────────────────────────────

export interface MatchAnalytics {
  totalRounds: number;
  teamAWins: number;
  teamBWins: number;
  teamAPoints: number;
  teamBPoints: number;
  teamAWinRate: number;
  teamBWinRate: number;
}

export async function getMatchAnalytics(matchId: string): Promise<MatchAnalytics> {
  const rounds = await getRoundsForMatch(matchId);
  const withWinner = rounds.filter((r) => r.winnerTeam !== undefined);
  const teamAWins = withWinner.filter((r) => r.winnerTeam === 0).length;
  const teamBWins = withWinner.filter((r) => r.winnerTeam === 1).length;
  const teamAPoints = rounds.reduce((s, r) => s + (r.pointsTeamA ?? 0), 0);
  const teamBPoints = rounds.reduce((s, r) => s + (r.pointsTeamB ?? 0), 0);
  const total = withWinner.length;

  return {
    totalRounds: rounds.length,
    teamAWins,
    teamBWins,
    teamAPoints,
    teamBPoints,
    teamAWinRate: total > 0 ? teamAWins / total : 0,
    teamBWinRate: total > 0 ? teamBWins / total : 0,
  };
}
