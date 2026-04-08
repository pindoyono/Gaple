'use client';

import type { Tile } from '@/engine/types';
import { fullDominoSet, tilesEqual } from '@/engine/domino';

interface DominoPickerProps {
  selected: Tile[];
  onToggle: (tile: Tile) => void;
  disabled?: Tile[];
  maxSelect?: number;
  label?: string;
}

function DominoPip({ value }: { value: number }) {
  const dots: Record<number, number[][]> = {
    0: [],
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
  };

  const positions = dots[value] ?? [];

  return (
    <div className="relative w-8 h-8 grid grid-cols-3 grid-rows-3 gap-0 p-0.5">
      {Array.from({ length: 9 }, (_, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const hasDot = positions.some(([r, c]) => r === row && c === col);
        return (
          <div key={i} className="flex items-center justify-center">
            {hasDot && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
          </div>
        );
      })}
    </div>
  );
}

function DominoTile({
  tile,
  selected,
  disabled,
  onClick,
  size = 'md',
}: {
  tile: Tile;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
}) {
  const sizeClass = size === 'sm' ? 'scale-75' : '';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex flex-col items-center border-2 rounded-lg p-0.5 transition-all select-none
        ${sizeClass}
        ${disabled ? 'opacity-40 cursor-not-allowed border-gray-300 bg-gray-100' : 'cursor-pointer hover:scale-105'}
        ${selected ? 'border-green-500 bg-green-50 shadow-md shadow-green-200' : 'border-gray-400 bg-white hover:border-blue-400'}
      `}
      title={`${tile[0]}-${tile[1]}`}
    >
      <DominoPip value={tile[0]} />
      <div className="w-6 border-t border-gray-400 my-0.5" />
      <DominoPip value={tile[1]} />
    </button>
  );
}

export function DominoPicker({ selected, onToggle, disabled = [], maxSelect, label }: DominoPickerProps) {
  const allTiles = fullDominoSet();

  const isSelected = (t: Tile) => selected.some((s) => tilesEqual(s, t));
  const isDisabled = (t: Tile) => {
    if (disabled.some((d) => tilesEqual(d, t))) return true;
    if (maxSelect !== undefined && selected.length >= maxSelect && !isSelected(t)) return true;
    return false;
  };

  // Group tiles by first value
  const groups: Tile[][] = [];
  for (let i = 0; i <= 6; i++) {
    groups.push(allTiles.filter((t) => t[0] === i));
  }

  return (
    <div>
      {label && <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>}
      <div className="space-y-2">
        {groups.map((group, i) => (
          <div key={i} className="flex flex-wrap gap-1 items-center">
            <span className="text-xs text-gray-400 w-3 font-mono">{i}</span>
            {group.map((tile) => (
              <DominoTile
                key={`${tile[0]}-${tile[1]}`}
                tile={tile}
                selected={isSelected(tile)}
                disabled={isDisabled(tile)}
                onClick={() => onToggle(tile)}
              />
            ))}
          </div>
        ))}
      </div>
      {selected.length > 0 && (
        <p className="mt-2 text-xs text-gray-500">
          Terpilih: {selected.map((t) => `[${t[0]}-${t[1]}]`).join(', ')}
        </p>
      )}
    </div>
  );
}

export { DominoTile, DominoPip };
