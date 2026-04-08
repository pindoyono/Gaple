'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllMatches, getMatchAnalytics, type Match, type MatchAnalytics } from '@/lib/storage';

interface MatchWithAnalytics {
  match: Match;
  analytics: MatchAnalytics;
}

export default function AnalitikPage() {
  const [data, setData] = useState<MatchWithAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllMatches().then((matches) =>
      Promise.all(
        matches.map(async (match) => ({
          match,
          analytics: await getMatchAnalytics(match.id),
        })),
      ).then((withAnalytics) => {
        setData(withAnalytics);
        setLoading(false);
      }),
    );
  }, []);

  if (loading) return <p className="text-center text-gray-400 py-10">Memuat...</p>;

  if (data.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold text-blue-700">📊 Analitik</h1>
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-10 text-center text-gray-400">
          <p className="text-lg">Belum ada data</p>
          <p className="text-sm mt-1">Buat match dan catat ronde untuk melihat analitik</p>
          <Link href="/riwayat?new=1" className="mt-4 inline-block bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-semibold">
            Buat Match Baru
          </Link>
        </div>
      </div>
    );
  }

  // Global stats across all matches
  const totalRounds = data.reduce((s, d) => s + d.analytics.totalRounds, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-blue-700">📊 Analitik</h1>

      {/* Global summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h2 className="font-bold text-gray-700 mb-3">Ringkasan Global</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-2xl font-extrabold text-gray-800">{data.length}</p>
            <p className="text-xs text-gray-500">Total Match</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-2xl font-extrabold text-gray-800">{totalRounds}</p>
            <p className="text-xs text-gray-500">Total Ronde</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-2xl font-extrabold text-gray-800">
              {totalRounds > 0 ? Math.round(totalRounds / data.length) : 0}
            </p>
            <p className="text-xs text-gray-500">Ronde/Match</p>
          </div>
        </div>
      </div>

      {/* Per-match analytics */}
      <div className="space-y-4">
        {data.map(({ match, analytics }) => {
          const winRounds = analytics.teamAWins + analytics.teamBWins;
          const teamAWinPct = winRounds > 0 ? Math.round((analytics.teamAWins / winRounds) * 100) : 0;
          const teamBWinPct = winRounds > 0 ? 100 - teamAWinPct : 0;

          return (
            <div key={match.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <Link href={`/riwayat/${match.id}`} className="font-bold text-gray-800 hover:text-blue-600">
                  {match.name}
                </Link>
                <span className="text-xs text-gray-400">{analytics.totalRounds} ronde</span>
              </div>

              {/* Team labels */}
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-600">Tim A: {match.players[0].name} + {match.players[2].name}</span>
                <span className="text-red-600">Tim B: {match.players[1].name} + {match.players[3].name}</span>
              </div>

              {/* Winrate bar */}
              <div className="flex rounded-full overflow-hidden h-6 mb-2">
                <div
                  className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                  style={{ width: `${teamAWinPct}%` }}
                >
                  {teamAWinPct > 10 ? `${teamAWinPct}%` : ''}
                </div>
                <div
                  className="bg-red-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                  style={{ width: `${teamBWinPct}%` }}
                >
                  {teamBWinPct > 10 ? `${teamBWinPct}%` : ''}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-sm font-bold text-blue-700">{analytics.teamAWins}</p>
                  <p className="text-xs text-gray-400">Menang A</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-red-700">{analytics.teamBWins}</p>
                  <p className="text-xs text-gray-400">Menang B</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-700">{analytics.teamAPoints}</p>
                  <p className="text-xs text-gray-400">Poin A</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-red-700">{analytics.teamBPoints}</p>
                  <p className="text-xs text-gray-400">Poin B</p>
                </div>
              </div>

              {match.status === 'finished' && match.winnerTeam !== undefined && (
                <div className={`mt-3 text-center text-sm font-semibold rounded-lg py-1.5 ${match.winnerTeam === 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                  🏆 Tim {match.winnerTeam === 0 ? 'A' : 'B'} Menang!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
