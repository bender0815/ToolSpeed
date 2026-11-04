import React, { useState } from 'react';
import { Material, LatheGearConfig } from '../types/machining';
import { calculateDrillingParams } from '../utils/calculator';
import { haptics } from '../utils/haptics';
import { Droplet, ArrowRight, Disc } from 'lucide-react';

interface DrillingCalculatorProps {
  material: Material;
  latheConfig: LatheGearConfig;
  onOpenMaterialPicker: () => void;
}

const COMMON_DRILLS = [
  { label: 'Zentrierbohrer Ø 2.5', d: 2.5 },
  { label: 'Ø 3.3 (M4)', d: 3.3 },
  { label: 'Ø 4.2 (M5)', d: 4.2 },
  { label: 'Ø 5.0 (M6)', d: 5.0 },
  { label: 'Ø 6.8 (M8)', d: 6.8 },
  { label: 'Ø 8.5 (M10)', d: 8.5 },
  { label: 'Ø 10.2 (M12)', d: 10.2 },
  { label: 'Ø 12.0', d: 12.0 },
  { label: 'Ø 16.0', d: 16.0 },
  { label: 'Ø 20.0', d: 20.0 },
];

import { getStoredItem, setStoredItem } from '../utils/storage';

export const DrillingCalculator: React.FC<DrillingCalculatorProps> = ({
  material,
  latheConfig,
  onOpenMaterialPicker,
}) => {
  const [drillDiameter, setDrillDiameter] = React.useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = getStoredItem('drill_diameter');
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val > 0) return val;
      }
    }
    return 6.8;
  });

  const [isVhm, setIsVhm] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = getStoredItem('drill_is_vhm');
      if (saved !== null) return saved === 'true';
    }
    return false;
  });

  React.useEffect(() => {
    setStoredItem('drill_diameter', String(drillDiameter));
  }, [drillDiameter]);

  React.useEffect(() => {
    setStoredItem('drill_is_vhm', String(isVhm));
  }, [isVhm]);

  const result = calculateDrillingParams(material, drillDiameter, isVhm, latheConfig);

  const handleStep = (delta: number) => {
    haptics.tick();
    const next = Math.max(0.5, Math.min(60, Math.round((drillDiameter + delta) * 10) / 10));
    setDrillDiameter(next);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Material Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="min-w-0">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">
            Aktueller Werkstoff
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-white truncate block">
            {material.name}
          </span>
        </div>
        <button
          onClick={onOpenMaterialPicker}
          className="text-xs text-blue-600 dark:text-blue-400 font-semibold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shrink-0"
        >
          Wechseln
        </button>
      </div>

      {/* Hero Drill RPM Result Card */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-5 shadow-2xl border border-slate-800 text-white relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Disc className="w-4 h-4" />
            Reitstock-Bohren
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {isVhm ? 'VHM Vollhartmetall' : 'HSS Spiralbohrer'}
          </span>
        </div>

        {/* Big RPM */}
        <div className="flex flex-col items-center justify-center my-3">
          <div className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-1">
            Empfohlene Bohrdrehzahl (n)
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl sm:text-6xl font-extrabold tracking-tight font-mono tabular-nums text-white">
              {result.rpm.toLocaleString('de-DE')}
            </span>
            <span className="text-xl font-bold text-cyan-400">min⁻¹</span>
          </div>

          {!latheConfig.isStepless && result.nearestGearRpm && (
            <div className="mt-1.5 text-xs text-slate-300 flex items-center gap-1 font-mono bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/60">
              <span className="text-slate-400">Rechnerisch: {result.exactRpm} min⁻¹</span>
              <ArrowRight className="w-3 h-3 text-slate-500 inline" />
              <span className="text-cyan-300 font-semibold">Getriebestufe {result.nearestGearRpm} min⁻¹</span>
            </div>
          )}

          {result.isClampedByMachine && (
            <div className="mt-2 text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-lg">
              Die Matra D10 ist auf max. {result.rpm} min⁻¹ begrenzt (rechnerisch wären {result.exactRpm} min⁻¹ nötig).
            </div>
          )}
        </div>

        {/* Parameters strip */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              Vorschub je Umdrehung
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold font-mono tabular-nums text-cyan-400">
                {result.feedRateMmRev.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-slate-400">mm/U</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              Schnittgeschwindigkeit
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold font-mono tabular-nums text-white">
                {result.vc}
              </span>
              <span className="text-xs font-semibold text-slate-400">m/min</span>
            </div>
          </div>
        </div>

        {/* Cooling advice */}
        <div className="mt-3 bg-slate-800/40 p-2.5 rounded-xl flex items-start gap-2 text-xs text-slate-300">
          <Droplet className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-cyan-300">Kühlschmierung beim Bohren:</strong> {result.cooling}
            <span className="block text-[11px] text-slate-400 mt-0.5">
              Tipp: Bei tiefen Bohrungen (&gt; 3×d) regelmäßig lüften (Spanentlastung), um Klemmen und Bruch zu verhindern!
            </span>
          </div>
        </div>
      </div>

      {/* Drill Diameter & Type Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden w-full max-w-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
            Bohrer-Durchmesser
          </span>
          <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400">
            Ø {drillDiameter.toFixed(1)} mm
          </span>
        </div>

        {/* Steppers */}
        <div className="flex items-center justify-between gap-1 sm:gap-3 bg-slate-50 dark:bg-slate-950/70 p-2 sm:p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 w-full">
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={() => handleStep(-1)}
              className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] sm:text-xs flex items-center justify-center active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              -1.0
            </button>
            <button
              onClick={() => handleStep(-0.1)}
              className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] sm:text-xs flex items-center justify-center active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              -0.1
            </button>
          </div>

          <div className="text-center min-w-0">
            <div className="text-2xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
              Ø {drillDiameter.toFixed(1)}
            </div>
            <span className="text-xs text-slate-400">mm</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={() => handleStep(0.1)}
              className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] sm:text-xs flex items-center justify-center active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              +0.1
            </button>
            <button
              onClick={() => handleStep(1)}
              className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] sm:text-xs flex items-center justify-center active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              +1.0
            </button>
          </div>
        </div>

        {/* Drill Type (HSS vs VHM) */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
            Bohrertyp:
          </div>
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <button
              onClick={() => {
                haptics.tick();
                setIsVhm(false);
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                !isVhm
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              HSS Spiralbohrer (Standard)
            </button>
            <button
              onClick={() => {
                haptics.tick();
                setIsVhm(true);
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                isVhm
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              VHM Vollhartmetall
            </button>
          </div>
        </div>

        {/* Quick Kernloch & Standard Bohrer presets */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 font-medium">
            Gewinde-Kernlochmaße & Standardgrößen:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {COMMON_DRILLS.map((b) => (
              <button
                key={b.label}
                onClick={() => {
                  haptics.tick();
                  setDrillDiameter(b.d);
                }}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  Math.abs(drillDiameter - b.d) < 0.05
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-semibold">{b.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
