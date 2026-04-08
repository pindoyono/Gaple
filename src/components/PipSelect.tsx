'use client';

interface PipSelectProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

export function PipSelect({ label, value, onChange }: PipSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-1">
        {Array.from({ length: 7 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`w-9 h-9 rounded-full border-2 text-sm font-bold transition-all
              ${value === i ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}
          >
            {i}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(-1)}
          className={`px-2 h-9 rounded-full border-2 text-xs font-bold transition-all
            ${value === -1 ? 'bg-gray-600 text-white border-gray-600 shadow' : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'}`}
        >
          ∅
        </button>
      </div>
    </div>
  );
}
