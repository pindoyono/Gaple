'use client';

import { useState, useCallback, useRef } from 'react';
import { DominoPicker } from '@/components/DominoPicker';
import { PipSelect } from '@/components/PipSelect';
import { RecommendationList } from '@/components/RecommendationList';
import { getRecommendations } from '@/engine/scorer';
import type { Tile, ScoredMove, PassInfo, GameContext } from '@/engine/types';
import { tilesEqual } from '@/engine/domino';

type InputMode = 'manual' | 'photo';

export default function AsistenPage() {
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [hand, setHand] = useState<Tile[]>([]);
  const [boardLeft, setBoardLeft] = useState<number>(-1);
  const [boardRight, setBoardRight] = useState<number>(-1);
  const [passInfoList, setPassInfoList] = useState<PassInfo[]>([]);
  const [recommendations, setRecommendations] = useState<ScoredMove[] | null>(null);
  const [newPass, setNewPass] = useState<{ playerIndex: number; endNumber: number }>({ playerIndex: 1, endNumber: 0 });

  // Photo input state
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoDetected, setPhotoDetected] = useState<Tile[]>([]);
  const [showPhotoConfirm, setShowPhotoConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTile = useCallback((tile: Tile) => {
    setHand((prev) => {
      if (prev.some((t) => tilesEqual(t, tile))) {
        return prev.filter((t) => !tilesEqual(t, tile));
      }
      if (prev.length >= 7) return prev;
      return [...prev, tile];
    });
    setRecommendations(null);
  }, []);

  const handleGetRecommendations = () => {
    const context: GameContext = {
      hand,
      board: { left: boardLeft, right: boardRight },
      playedTiles: [],
      passInfo: passInfoList,
    };
    const recs = getRecommendations(context, 3);
    setRecommendations(recs);
  };

  const addPass = () => {
    setPassInfoList((prev) => [...prev, { ...newPass }]);
  };

  const removePass = (i: number) => {
    setPassInfoList((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    // Placeholder: no auto-detection yet
    setPhotoDetected([]);
    setShowPhotoConfirm(true);
  };

  const confirmPhotoTiles = () => {
    setHand(photoDetected);
    setShowPhotoConfirm(false);
    setInputMode('manual');
  };

  const boardIsEmpty = boardLeft === -1 && boardRight === -1;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-blue-700">🎯 Asisten Langkah</h1>

      {/* Input mode toggle */}
      <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
        {(['manual', 'photo'] as InputMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setInputMode(mode)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
              ${inputMode === mode ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {mode === 'manual' ? '✋ Manual' : '📷 Foto Ubin'}
          </button>
        ))}
      </div>

      {/* MANUAL INPUT */}
      {inputMode === 'manual' && (
        <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm">
          <div>
            <h2 className="font-bold text-gray-700 mb-3">Pilih ubin di tangan (maks. 7)</h2>
            <DominoPicker
              selected={hand}
              onToggle={toggleTile}
              maxSelect={7}
              label={`Terpilih: ${hand.length}/7`}
            />
          </div>

          <div className="border-t pt-4 space-y-3">
            <h2 className="font-bold text-gray-700">Kondisi papan</h2>
            <PipSelect label="Ujung kiri papan (∅ = papan kosong)" value={boardLeft} onChange={(v) => { setBoardLeft(v); setRecommendations(null); }} />
            {!boardIsEmpty && (
              <PipSelect label="Ujung kanan papan" value={boardRight} onChange={(v) => { setBoardRight(v); setRecommendations(null); }} />
            )}
            {boardIsEmpty && (
              <p className="text-xs text-gray-400">Pilih ∅ untuk keduanya jika ini langkah pertama.</p>
            )}
          </div>
        </section>
      )}

      {/* PHOTO INPUT */}
      {inputMode === 'photo' && (
        <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm">
          <h2 className="font-bold text-gray-700">Upload foto ubin di tangan</h2>
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="Foto ubin" className="max-h-48 mx-auto rounded-lg object-contain" />
            ) : (
              <div className="space-y-2 text-gray-400">
                <p className="text-4xl">📷</p>
                <p className="font-semibold">Tap untuk upload foto</p>
                <p className="text-xs">Kamera atau galeri</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoUpload}
          />

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <p className="font-semibold">⚠️ Mode semi-manual</p>
            <p className="mt-1">Deteksi otomatis belum tersedia. Setelah upload foto, kamu tetap perlu memilih ubin secara manual di layar konfirmasi. Foto hanya sebagai referensi visual.</p>
          </div>

          {photoUrl && (
            <button
              type="button"
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700"
              onClick={() => setShowPhotoConfirm(true)}
            >
              Lanjut ke konfirmasi ubin →
            </button>
          )}
        </section>
      )}

      {/* Photo confirmation overlay */}
      {showPhotoConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl p-5 w-full max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-gray-800 mb-1">Konfirmasi / Koreksi Ubin</h3>
            <p className="text-xs text-gray-500 mb-4">Pilih ubin yang ada di tangan kamu. Foto di bawah sebagai referensi.</p>

            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="Referensi" className="rounded-xl w-full max-h-40 object-contain mb-4 border" />
            )}

            <DominoPicker
              selected={photoDetected}
              onToggle={(tile) => {
                setPhotoDetected((prev) =>
                  prev.some((t) => tilesEqual(t, tile))
                    ? prev.filter((t) => !tilesEqual(t, tile))
                    : [...prev, tile],
                );
              }}
              maxSelect={7}
              label={`Pilih ubin di tangan (${photoDetected.length}/7)`}
            />

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowPhotoConfirm(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmPhotoTiles}
                className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
              >
                ✅ Konfirmasi ({photoDetected.length} ubin)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pass/ketuk info */}
      <section className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h2 className="font-bold text-gray-700 mb-3">Info Pass/Ketuk (opsional)</h2>
        <p className="text-xs text-gray-400 mb-3">Catat saat pemain lain pass agar saran lebih akurat.</p>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Pemain</label>
            <select
              value={newPass.playerIndex}
              onChange={(e) => setNewPass((p) => ({ ...p, playerIndex: +e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm mt-1"
            >
              <option value={1}>P2</option>
              <option value={2}>P3</option>
              <option value={3}>P4</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Pass di angka</label>
            <select
              value={newPass.endNumber}
              onChange={(e) => setNewPass((p) => ({ ...p, endNumber: +e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm mt-1"
            >
              {Array.from({ length: 7 }, (_, i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={addPass}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600"
          >
            + Tambah
          </button>
        </div>

        {passInfoList.length > 0 && (
          <div className="mt-3 space-y-1">
            {passInfoList.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-orange-50 rounded-lg px-3 py-1.5 text-sm">
                <span>P{p.playerIndex + 1} pass di angka <strong>{p.endNumber}</strong></span>
                <button type="button" onClick={() => removePass(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Get recommendations button */}
      <button
        type="button"
        onClick={handleGetRecommendations}
        disabled={hand.length === 0}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl text-lg font-extrabold shadow-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        🔍 Minta Saran Langkah
      </button>

      {/* Results */}
      {recommendations !== null && (
        <section>
          <h2 className="font-bold text-gray-700 mb-3">Rekomendasi</h2>
          <RecommendationList recommendations={recommendations} />
        </section>
      )}
    </div>
  );
}
