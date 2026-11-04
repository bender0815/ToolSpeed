import React, { useState } from 'react';
import { OperationType, ToolType } from '../types/machining';
import { haptics } from '../utils/haptics';
import { Sliders, RotateCcw } from 'lucide-react';

interface OperationToggleProps {
  operation: OperationType;
  onChangeOperation: (op: OperationType) => void;
  toolType: ToolType;
  onChangeToolType: (tool: ToolType) => void;
  customVcOverride?: number;
  onUpdateVcOverride: (vc: number | undefined) => void;
  customFeedOverride?: number;
  onUpdateFeedOverride: (f: number | undefined) => void;
  customApOverride?: number;
  onUpdateApOverride: (ap: number | undefined) => void;
  defaultVc: number;
  defaultFeed: number;
  defaultAp: number;
}

export const OperationToggle: React.FC<OperationToggleProps> = ({
  operation,
  onChangeOperation,
  toolType,
  onChangeToolType,
  customVcOverride,
  onUpdateVcOverride,
  customFeedOverride,
  onUpdateFeedOverride,
  customApOverride,
  onUpdateApOverride,
  defaultVc,
  defaultFeed,
  defaultAp,
}) => {
  const [showOverrides, setShowOverrides] = useState<boolean>(false);

  const hasOverrides =
    customVcOverride !== undefined ||
    customFeedOverride !== undefined ||
    customApOverride !== undefined;

  const handleResetOverrides = () => {
    haptics.tick();
    onUpdateVcOverride(undefined);
    onUpdateFeedOverride(undefined);
    onUpdateApOverride(undefined);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors overflow-hidden w-full max-w-full">
      {/* Operation Type: iOS Segmented Control */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
            Bearbeitung
          </span>
          <span className="text-xs text-slate-400">
            {operation === 'roughing'
              ? 'Maximaler Materialabtrag'
              : operation === 'finishing'
              ? 'Hohe Oberflächengüte'
              : 'Einstechen & Trennen'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200/60 dark:border-slate-800">
          <button
            onClick={() => {
              haptics.tick();
              onChangeOperation('roughing');
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              operation === 'roughing'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Schruppen
          </button>
          <button
            onClick={() => {
              haptics.tick();
              onChangeOperation('finishing');
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              operation === 'finishing'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Schlichten
          </button>
          <button
            onClick={() => {
              haptics.tick();
              onChangeOperation('parting');
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              operation === 'parting'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Abstechen
          </button>
        </div>
      </div>

      {/* Tool Material: HM (Carbide) vs HSS */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
            Schneidstoff Werkzeug
          </span>
          <span className="text-xs text-slate-400">
            {toolType === 'carbide' ? 'Wendeplatte / Hartmetall' : 'Schnellarbeitsstahl'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200/60 dark:border-slate-800">
          <button
            onClick={() => {
              haptics.tick();
              onChangeToolType('carbide');
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              toolType === 'carbide'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Hartmetall (HM)</span>
          </button>
          <button
            onClick={() => {
              haptics.tick();
              onChangeToolType('hss');
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              toolType === 'hss'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>HSS Meißel</span>
          </button>
        </div>
      </div>

      {/* Optional Fine-Tune Sliders Collapsible */}
      <div className="mt-3 pt-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              haptics.tick();
              setShowOverrides(!showOverrides);
            }}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-500" />
            <span>{showOverrides ? 'Feinjustierung verbergen' : 'Schnittdaten manuell feintunen'}</span>
          </button>

          {hasOverrides && (
            <button
              onClick={handleResetOverrides}
              className="text-xs text-amber-500 hover:text-amber-600 flex items-center gap-1 cursor-pointer font-medium"
              title="Auf Standard zurücksetzen"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {showOverrides && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 animate-in fade-in duration-150">
            {/* vc Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>Schnittgeschwindigkeit (vc)</span>
                <span className="font-mono">{customVcOverride ?? defaultVc} m/min</span>
              </div>
              <input
                type="range"
                min={10}
                max={Math.max(600, defaultVc * 2)}
                step={5}
                value={customVcOverride ?? defaultVc}
                onChange={(e) => onUpdateVcOverride(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* feed f Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>Vorschub (f)</span>
                <span className="font-mono">{(customFeedOverride ?? defaultFeed).toFixed(2)} mm/U</span>
              </div>
              <input
                type="range"
                min={0.02}
                max={0.8}
                step={0.02}
                value={customFeedOverride ?? defaultFeed}
                onChange={(e) => onUpdateFeedOverride(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* depth ap Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>Schnitttiefe (ap)</span>
                <span className="font-mono">{(customApOverride ?? defaultAp).toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={6.0}
                step={0.1}
                value={customApOverride ?? defaultAp}
                onChange={(e) => onUpdateApOverride(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
