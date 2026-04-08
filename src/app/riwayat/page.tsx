'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getAllMatches, saveMatch, exportAllAsJSON, type Match, type Player } from '@/lib/storage';
import { generateId, formatDate, downloadFile } from '@/lib/utils';

function RiwayatContent() {
  const searchParams = useSearchParams();
  const showNew = searchParams.get('new') === '1';

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(showNew);

  // New match form state
  const [matchName, setMatchName] = useState('');
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [saving, setSaving] = useState(false);

  const loadMatches = useCallback(() => {
    getAllMatches().then((all) => {
      setMatches(all);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const handleCreateMatch = async () => {
    if (!matchName.trim() || playerNames.some((n) => !n.trim())) return;
    setSaving(true);

    const players: [Player, Player, Player, Player] = playerNames.map((name) => ({
      id: generateId(),
      name: name.trim(),
    })) as [Player, Player, Player, Player];

    const match: Match = {
      id: generateId(),
      name: matchName.trim(),
      createdAt: new Date().toISOString(),
      players,
      teams: [
        [players[0].id, players[2].id],
        [players[1].id, players[3].id],
      ],
      status: 'active',
    };

    await saveMatch(match);
    await loadMatches();
    setShowForm(false);
    setMatchName('');
    setPlayerNames(['', '', '', '']);
    setSaving(false);
  };

  const handleExportAll = async () => {
    const json = await exportAllAsJSON();
    downloadFile(json, `gaple-semua-match-${Date.now()}.json`, 'application/json');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-blue-700">📋 Riwayat Match</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportAll}
            className="text-xs px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ↓ Export
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            + Baru
          </button>
        </div>
      </div>

      {/* New match form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-800">Buat Match Baru</h2>

          <div>
            <label className="text-sm font-medium text-gray-600">Nama Match</label>
            <input
              type="text"
              value={matchName}
              onChange={(e) => setMatchName(e.target.value)}
              placeholder="mis. Gaple Sabtu Malam"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">4 Pemain (Tim A: P1+P3, Tim B: P2+P4)</label>
            <div className="grid grid-cols-2 gap-2">
              {playerNames.map((name, i) => (
                <div key={i} className="relative">
                  <span className={`absolute left-2 top-2 text-xs font-bold ${i % 2 === 0 ? 'text-blue-500' : 'text-red-500'}`}>
                    P{i + 1}
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setPlayerNames((prev) => { const n = [...prev]; n[i] = e.target.value; return n; })}
                    placeholder={`Nama pemain ${i + 1}`}
                    className="w-full pl-7 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">Tim A (biru): P1 + P3 | Tim B (merah): P2 + P4</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 border-2 border-gray-300 rounded-xl text-gray-600 font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleCreateMatch}
              disabled={saving || !matchName.trim() || playerNames.some((n) => !n.trim())}
              className="flex-1 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-40"
            >
              {saving ? 'Menyimpan...' : '✅ Buat Match'}
            </button>
          </div>
        </div>
      )}

      {/* Match list */}
      {loading ? (
        <p className="text-center text-gray-400 py-8">Memuat...</p>
      ) : matches.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-10 text-center text-gray-400">
          <p className="text-lg font-semibold">Belum ada match</p>
          <p className="text-sm mt-1">Tap &quot;+ Baru&quot; untuk mulai</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <Link
              key={m.id}
              href={`/riwayat/${m.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{m.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(m.createdAt)}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      Tim A: {m.players[0].name} + {m.players[2].name}
                    </span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Tim B: {m.players[1].name} + {m.players[3].name}
                    </span>
                  </div>
                </div>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {m.status === 'active' ? 'Aktif' : 'Selesai'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RiwayatPage() {
  return (
    <Suspense fallback={<p className="text-center text-gray-400 py-10">Memuat...</p>}>
      <RiwayatContent />
    </Suspense>
  );
}

