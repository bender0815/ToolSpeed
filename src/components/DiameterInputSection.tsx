import React from 'react';
import { STANDARD_BAR_DIAMETERS } from '../data/lathes';
import { haptics } from '../utils/haptics';
import { Minus, Plus } from 'lucide-react';

interface DiameterInputSectionProps {
  diameter: number;
  onChangeDiameter: (d: number) => void;
}

export const DiameterInputSection: React.FC<DiameterInputSectionProps> = ({
  diameter,
  onChangeDiameter,
}) => {
  const handleStep = (delta: number) => {
    haptics.tick();
    const next = Math.max(1, Math.min(500, diameter + delta));
    onChangeDiameter(next);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      haptics.tick();
      onChangeDiameter(val);
    }
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= 1000) {
      onChangeDiameter(val);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors overflow-hidden w-full max-w-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
            Werkstück-Durchmesser
          </span>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Drehdurchmesser (d)
          </h2>
        </div>
        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
          in Millimeter (mm)
        </span>
      </div>

      {/* Main Big Number & Steppers Area */}
      <div className="flex items-center justify-between gap-1 sm:gap-3 bg-slate-50 dark:bg-slate-950/70 p-2 sm:p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 w-full">
        {/* Minus Step Group */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={() => handleStep(-5)}
            className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] sm:text-xs flex items-center justify-center active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
            title="Minus 5 mm"
          >
            -5
          </button>
          <button
            onClick={() => handleStep(-1)}
            className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
            title="Minus 1 mm"
          >
            <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Center Big Display with Direct Edit */}
        <div className="flex items-baseline justify-center gap-0.5 sm:gap-1 min-w-0">
          <span className="text-xl sm:text-2xl font-light text-slate-400 dark:text-slate-500">Ø</span>
          <input
            type="number"
            min={1}
            max={500}
            step={1}
            value={diameter}
            onChange={handleDirectInput}
            onFocus={() => haptics.tick()}
            className="w-14 sm:w-24 text-center text-3xl sm:text-5xl font-extrabold font-mono text-slate-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 p-0 tabular-nums"
          />
          <span className="text-xs sm:text-base font-semibold text-slate-500 dark:text-slate-400">mm</span>
        </div>

        {/* Plus Step Group */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={() => handleStep(1)}
            className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
            title="Plus 1 mm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <button
            onClick={() => handleStep(5)}
            className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] sm:text-xs flex items-center justify-center active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
            title="Plus 5 mm"
          >
            +5
          </button>
        </div>
      </div>

      {/* Tactile Range Slider for continuous sweep */}
      <div className="mt-4 px-1">
        <input
          type="range"
          min={4}
          max={150}
          value={diameter <= 150 ? diameter : 150}
          onChange={handleSliderChange}
          className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
          <span>Ø 4mm</span>
          <span>Ø 40mm</span>
          <span>Ø 80mm</span>
          <span>Ø 150mm+</span>
        </div>
      </div>

      {/* Common Stangenmaterial Bar Presets Carousel */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 font-medium">
          Gängiges Stangenmaterial (Schnellwahl):
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full max-w-full">
          {STANDARD_BAR_DIAMETERS.map((preset) => {
            const isSelected = diameter === preset;
            return (
              <button
                key={preset}
                onClick={() => {
                  haptics.tick();
                  onChangeDiameter(preset);
                }}
                className={`min-w-[44px] h-9 px-2.5 rounded-xl font-mono text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Ø{preset}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
