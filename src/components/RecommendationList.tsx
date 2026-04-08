'use client';

import type { ScoredMove } from '@/engine/types';

interface RecommendationListProps {
  recommendations: ScoredMove[];
}

const rankLabel: Record<'best' | 'alt1' | 'alt2', { text: string; classes: string }> = {
  best: { text: '⭐ Saran Terbaik', classes: 'bg-green-50 border-green-500' },
  alt1: { text: '2️⃣ Alternatif 1', classes: 'bg-blue-50 border-blue-400' },
  alt2: { text: '3️⃣ Alternatif 2', classes: 'bg-gray-50 border-gray-400' },
};

export function RecommendationList({ recommendations }: RecommendationListProps) {
  if (recommendations.length === 0) {
    return (
      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 text-center text-red-700">
        <p className="font-semibold">Tidak ada langkah yang tersedia</p>
        <p className="text-sm mt-1">Kamu harus pass (ketuk) pada giliran ini.</p>
      </div>
    );
  }

  const ranks: Array<'best' | 'alt1' | 'alt2'> = ['best', 'alt1', 'alt2'];

  return (
    <div className="space-y-3">
      {recommendations.slice(0, 3).map((rec, i) => {
        const rank = ranks[i] ?? 'alt2';
        const { text, classes } = rankLabel[rank];
        const { tile, side, newEnd } = rec.move;
        const sideLabel = side === 'left' ? 'kiri' : 'kanan';

        return (
          <div key={i} className={`rounded-lg border-2 p-4 ${classes}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">{text}</span>
              <span className="text-xs text-gray-500">skor: {rec.score.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center bg-white border-2 border-gray-300 rounded-lg p-1 shadow-sm">
                <span className="text-xl font-bold leading-none">{tile[0]}</span>
                <div className="w-5 border-t border-gray-400 my-0.5" />
                <span className="text-xl font-bold leading-none">{tile[1]}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  [{tile[0]}-{tile[1]}] ke <span className="text-blue-600">{sideLabel}</span>
                  <span className="text-gray-500 text-sm"> → ujung {newEnd}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
