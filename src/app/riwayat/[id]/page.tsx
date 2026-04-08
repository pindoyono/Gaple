'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getMatch, getRoundsForMatch, saveMatch, saveRound,
  type Match, type Round,
  exportMatchAsJSON, exportMatchAsCSV,
} from '@/lib/storage';
import { generateId, formatDate, downloadFile } from '@/lib/utils';

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [match, setMatch] = useState<Match | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRound, setShowAddRound] = useState(false);

  // Round form state
  const [winnerTeam, setWinnerTeam] = useState<0 | 1>(0);
  const [pointsA, setPointsA] = useState('');
  const [pointsB, setPointsB] = useState('');
  const [boardLeft, setBoardLeft] = useState('');
  const [boardRight, setBoardRight] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(() => {
    Promise.all([getMatch(id), getRoundsForMatch(id)]).then(([m, r]) => {
      setMatch(m ?? null);
      setRounds(r);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, loadData]);

  const handleAddRound = async () => {
    if (!match) return;
    setSaving(true);

    const round: Round = {
      id: generateId(),
      matchId: id,
      roundNumber: rounds.length + 1,
      createdAt: new Date().toISOString(),
      boardLeft: boardLeft !== '' ? parseInt(boardLeft) : -1,
      boardRight: boardRight !== '' ? parseInt(boardRight) : -1,
      winnerTeam,
      pointsTeamA: pointsA !== '' ? parseInt(pointsA) : undefined,
      pointsTeamB: pointsB !== '' ? parseInt(pointsB) : undefined,
      notes: notes.trim() || undefined,
    };

    await saveRound(round);
    await loadData();
    setShowAddRound(false);
    setSaving(false);
    setPointsA(''); setPointsB(''); setBoardLeft(''); setBoardRight(''); setNotes('');
  };

  const handleFinishMatch = async () => {
    if (!match) return;
    const totalA = rounds.reduce((s, r) => s + (r.pointsTeamA ?? 0), 0);
    const totalB = rounds.reduce((s, r) => s + (r.pointsTeamB ?? 0), 0);
    const updated: Match = {
      ...match,
      status: 'finished',
      winnerTeam: totalA >= totalB ? 0 : 1,
    };
    await saveMatch(updated);
    setMatch(updated);
  };

  const handleExportJSON = async () => {
    const json = await exportMatchAsJSON(id);
    downloadFile(json, `gaple-${id}.json`, 'application/json');
  };

  const handleExportCSV = async () => {
    const csv = await exportMatchAsCSV(id);
    downloadFile(csv, `gaple-${id}.csv`, 'text/csv');
  };

  if (loading) return <p className="text-center text-gray-400 py-10">Memuat...</p>;
  if (!match) return <p className="text-center text-gray-500 py-10">Match tidak ditemukan.</p>;

  const teamAPoints = rounds.reduce((s, r) => s + (r.pointsTeamA ?? 0), 0);
  const teamBPoints = rounds.reduce((s, r) => s + (r.pointsTeamB ?? 0), 0);
  const teamAWins = rounds.filter((r) => r.winnerTeam === 0).length;
  const teamBWins = rounds.filter((r) => r.winnerTeam === 1).length;

  return (
    <div className="space-y-5">
      {/* Back + title */}
      <div>
        <button type="button" onClick={() => router.back()} className="text-sm text-blue-600 hover:underline mb-2 block">
          ← Kembali
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-gray-800">{match.name}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full ${match.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {match.status === 'active' ? 'Aktif' : 'Selesai'}
          </span>
        </div>
        <p className="text-xs text-gray-400">{formatDate(match.createdAt)}</p>
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
          <p className="text-xs font-semibold text-blue-600 mb-1">Tim A</p>
          <p className="font-bold text-sm">{match.players[0].name} + {match.players[2].name}</p>
          <p className="text-3xl font-extrabold text-blue-700 mt-2">{teamAPoints}</p>
          <p className="text-xs text-blue-500">{teamAWins} ronde menang</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
          <p className="text-xs font-semibold text-red-600 mb-1">Tim B</p>
          <p className="font-bold text-sm">{match.players[1].name} + {match.players[3].name}</p>
          <p className="text-3xl font-extrabold text-red-700 mt-2">{teamBPoints}</p>
          <p className="text-xs text-red-500">{teamBWins} ronde menang</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {match.status === 'active' && (
          <>
            <button
              type="button"
              onClick={() => setShowAddRound(true)}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700"
            >
              + Tambah Ronde
            </button>
            <button
              type="button"
              onClick={handleFinishMatch}
              className="flex-1 py-2.5 bg-gray-700 text-white rounded-xl font-semibold text-sm hover:bg-gray-800"
            >
              ✓ Selesai
            </button>
          </>
        )}
        <button type="button" onClick={handleExportJSON} className="px-3 py-2.5 border border-gray-300 rounded-xl text-xs hover:bg-gray-50">
          JSON
        </button>
        <button type="button" onClick={handleExportCSV} className="px-3 py-2.5 border border-gray-300 rounded-xl text-xs hover:bg-gray-50">
          CSV
        </button>
      </div>

      {/* Add round form */}
      {showAddRound && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
          <h2 className="font-bold text-gray-800">Ronde {rounds.length + 1}</h2>

          <div>
            <label className="text-sm font-medium text-gray-600">Pemenang Ronde</label>
            <div className="flex gap-2 mt-1">
              {([0, 1] as const).map((team) => (
                <button
                  key={team}
                  type="button"
                  onClick={() => setWinnerTeam(team)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all
                    ${winnerTeam === team
                      ? team === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-600 border-gray-300'
                    }`}
                >
                  {team === 0 ? `Tim A (${match.players[0].name})` : `Tim B (${match.players[1].name})`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Poin Tim A</label>
              <input type="number" value={pointsA} onChange={(e) => setPointsA(e.target.value)} placeholder="0"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Poin Tim B</label>
              <input type="number" value={pointsB} onChange={(e) => setPointsB(e.target.value)} placeholder="0"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Ujung kiri papan</label>
              <input type="number" min="0" max="6" value={boardLeft} onChange={(e) => setBoardLeft(e.target.value)} placeholder="-"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Ujung kanan papan</label>
              <input type="number" min="0" max="6" value={boardRight} onChange={(e) => setBoardRight(e.target.value)} placeholder="-"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Catatan (opsional)</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="mis. mati, tutup balak..."
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setShowAddRound(false)}
              className="flex-1 py-2.5 border-2 border-gray-300 rounded-xl text-gray-600 font-semibold">
              Batal
            </button>
            <button type="button" onClick={handleAddRound} disabled={saving}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-40">
              {saving ? 'Menyimpan...' : '✅ Simpan Ronde'}
            </button>
          </div>
        </div>
      )}

      {/* Rounds list */}
      <div>
        <h2 className="font-bold text-gray-700 mb-3">Daftar Ronde ({rounds.length})</h2>
        {rounds.length === 0 ? (
          <p className="text-center text-gray-400 py-6 border-2 border-dashed border-gray-200 rounded-xl">
            Belum ada ronde
          </p>
        ) : (
          <div className="space-y-2">
            {rounds.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Ronde {r.roundNumber}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.winnerTeam === 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                    Tim {r.winnerTeam === 0 ? 'A' : 'B'} menang
                  </span>
                </div>
                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                  {r.pointsTeamA !== undefined && <span>Tim A: {r.pointsTeamA} poin</span>}
                  {r.pointsTeamB !== undefined && <span>Tim B: {r.pointsTeamB} poin</span>}
                  {r.boardLeft !== undefined && r.boardLeft >= 0 && (
                    <span>Papan: {r.boardLeft}-{r.boardRight}</span>
                  )}
                </div>
                {r.notes && <p className="text-xs text-gray-400 mt-1 italic">{r.notes}</p>}
                <p className="text-xs text-gray-300 mt-1">{formatDate(r.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
