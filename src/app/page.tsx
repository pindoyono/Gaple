'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAllMatches, type Match } from '@/lib/storage';
import { formatDate } from '@/lib/utils';

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllMatches().then((m) => {
      setMatches(m.slice(0, 5));
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pt-4">
        <h1 className="text-3xl font-extrabold text-blue-700">🀱 Asisten Gaple</h1>
        <p className="text-gray-500 text-sm mt-1">4 pemain · 2 vs 2 · Set domino 0–6</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/asisten"
          className="flex flex-col items-center gap-2 bg-blue-600 text-white rounded-2xl p-5 shadow-md hover:bg-blue-700 active:scale-95 transition-all"
        >
          <span className="text-3xl">🎯</span>
          <span className="font-semibold">Minta Saran</span>
          <span className="text-xs opacity-80 text-center">Input ubin &amp; papan, dapatkan rekomendasi</span>
        </Link>
        <Link
          href="/riwayat?new=1"
          className="flex flex-col items-center gap-2 bg-green-600 text-white rounded-2xl p-5 shadow-md hover:bg-green-700 active:scale-95 transition-all"
        >
          <span className="text-3xl">➕</span>
          <span className="font-semibold">Match Baru</span>
          <span className="text-xs opacity-80 text-center">Catat pertandingan baru</span>
        </Link>
      </div>

      {/* Recent matches */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">Match Terakhir</h2>
          <Link href="/riwayat" className="text-sm text-blue-600 hover:underline">
            Lihat semua →
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-6">Memuat...</p>
        ) : matches.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center text-gray-400">
            <p className="text-lg">Belum ada match</p>
            <p className="text-sm mt-1">Buat match baru untuk mulai mencatat</p>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((m) => (
              <Link
                key={m.id}
                href={`/riwayat/${m.id}`}
                className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="font-semibold text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(m.createdAt)}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {m.status === 'active' ? 'Aktif' : 'Selesai'}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{m.players.map((p) => p.name).join(', ')}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">Cara pakai:</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Buka <strong>Asisten</strong> → pilih ubin di tangan → isi ujung papan → Minta Saran</li>
          <li>Buat <strong>Match Baru</strong> → catat setiap ronde</li>
          <li>Lihat <strong>Riwayat</strong> &amp; <strong>Analitik</strong> untuk statistik</li>
        </ol>
      </div>
    </div>
  );
}

