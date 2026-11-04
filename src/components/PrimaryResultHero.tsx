import React, { useState } from 'react';
import { CalculationResult, Material, LatheGearConfig, MachineEnvironment } from '../types/machining';
import { Gauge, ArrowRight, Zap, Info, Droplet, Sparkles, AlertTriangle, BookmarkPlus, Calculator, ShieldCheck } from 'lucide-react';
import { haptics } from '../utils/haptics';

interface PrimaryResultHeroProps {
  result: CalculationResult;
  material: Material;
  diameter: number;
  latheConfig: LatheGearConfig;
  environment: MachineEnvironment;
  onChangeEnvironment: (env: MachineEnvironment) => void;
  onSaveJob: () => void;
}

export const PrimaryResultHero: React.FC<PrimaryResultHeroProps> = ({
  result,
  material,
  diameter,
  latheConfig,
  environment,
  onChangeEnvironment,
  onSaveJob,
}) => {
  const [showFormulaCheck, setShowFormulaCheck] = useState<boolean>(false);

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 dark:from-slate-900 dark:via-slate-950 dark:to-black rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-800/80 text-white relative overflow-hidden w-full max-w-full">
      {/* Background Subtle Accent Glow */}
      <div className="absolute -top-16 -right-16 w-44 h-44 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar inside Hero: Mode Selector & Actions */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-3 relative z-10 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1 p-0.5 bg-slate-800/90 rounded-xl border border-slate-700 shrink min-w-0">
          <button
            onClick={() => {
              haptics.tick();
              onChangeEnvironment('manual');
            }}
            className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              environment === 'manual'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-blue-200" />
            <span>Manuell (Werkstatt)</span>
          </button>
          <button
            onClick={() => {
              haptics.tick();
              onChangeEnvironment('cnc');
            }}
            className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
              environment === 'cnc'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>CNC / Industrie</span>
          </button>
        </div>

        <button
          onClick={() => {
            haptics.select();
            onSaveJob();
          }}
          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition-all cursor-pointer border border-slate-700 shrink-0"
          title="Aktuelle Schnittdaten auf Merkzettel speichern"
        >
          <BookmarkPlus className="w-3.5 h-3.5 text-blue-400" />
          <span>Merken</span>
        </button>
      </div>

      {/* Main KPI: Drehzahl n */}
      <div className="flex flex-col items-center justify-center my-1 py-2">
        <div className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-1 flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-blue-400" />
          <span>Empfohlene Drehzahl (n)</span>
        </div>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-5xl sm:text-6xl font-extrabold tracking-tight font-mono tabular-nums text-white drop-shadow-sm">
            {result.suggestedRpm.toLocaleString('de-DE')}
          </span>
          <span className="text-lg sm:text-xl font-bold text-blue-400">
            min⁻¹
          </span>
        </div>

        {/* Comparison if Gear snapped to nearest discrete step */}
        {!latheConfig.isStepless && result.exactRpm !== result.suggestedRpm && (
          <div className="mt-1.5 text-xs text-slate-300 flex items-center gap-1 font-mono bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/60">
            <span className="text-slate-400">Rechnerisch: {result.exactRpm} min⁻¹</span>
            <ArrowRight className="w-3 h-3 text-slate-500 inline" />
            <span className="text-blue-300 font-semibold">Getriebestufe {result.suggestedRpm}</span>
          </div>
        )}

        {/* Machine Clamping Badge */}
        {result.formulaBreakdown.isClampedByMachine && (
          <div className="mt-2 text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-lg">
            Drehzahlgrenze der Drehbank erreicht ({result.formulaBreakdown.maxLatheRpm} min⁻¹)
          </div>
        )}
      </div>

      {/* Core Secondary Parameters: Vorschub f & Schnitttiefe ap */}
      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/80">
        {/* Vorschub f */}
        <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            Vorschub (f)
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
              {result.feedRate.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-400">mm/U</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            Bereich: {result.feedRateRange.min.toFixed(2)} – {result.feedRateRange.max.toFixed(2)}
          </div>
        </div>

        {/* Schnitttiefe ap */}
        <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            Schnitttiefe (ap)
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-400">
              {result.depthOfCut.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-400">mm</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Zustellung im Radius (Ø {(result.depthOfCut * 2).toFixed(1)}mm)
          </div>
        </div>
      </div>

      {/* Schnittgeschwindigkeit & Abtrag strip */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 font-mono">
        <div>
          <span className="text-slate-400">Schnittgeschw. vc:</span>{' '}
          <strong className="text-white">{result.cuttingSpeed} m/min</strong>
        </div>
        <div className="text-right">
          <span className="text-slate-400">Spanvolumen Q:</span>{' '}
          <strong className="text-white">{result.metalRemovalRateQ} cm³/min</strong>
        </div>
      </div>

      {/* Safety Warning if active */}
      {result.warning && (
        <div className="mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div className="leading-snug">{result.warning}</div>
        </div>
      )}

      {/* Interactive Transparent Formula Verification Dropdown */}
      <div className="mt-3 pt-1">
        <button
          onClick={() => {
            haptics.tick();
            setShowFormulaCheck(!showFormulaCheck);
          }}
          className="w-full flex items-center justify-between text-xs text-blue-400 hover:text-blue-300 py-1 transition-colors cursor-pointer font-medium"
        >
          <span className="flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" />
            <span>Berechnungs-Nachweis &amp; Formel-Check</span>
          </span>
          <span className="text-slate-500">{showFormulaCheck ? '▲' : '▼'}</span>
        </button>

        {showFormulaCheck && (
          <div className="mt-2.5 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs space-y-2 font-mono animate-in fade-in duration-150">
            <div className="text-slate-400">
              Formel nach DIN / Fachkunde Metall:
            </div>
            <div className="bg-slate-900 p-2 rounded-xl text-center text-blue-300 font-bold text-sm">
              n = (vc · 1000) / (π · d)
            </div>
            <div className="text-slate-300 leading-relaxed text-[11px] space-y-1">
              <div>• Schnittgeschwindigkeit: <strong className="text-white">{result.cuttingSpeed} m/min</strong> ({environment === 'manual' ? 'Werkstatt-Modus / konventionell' : 'CNC-Katalogwert'})</div>
              <div>• Werkstück-Durchmesser: <strong className="text-white">Ø {diameter} mm</strong></div>
              <div>• Exakte Rechnung: <span className="text-slate-300">({result.cuttingSpeed} · 1000) / (3.1416 · {diameter})</span> = <strong className="text-emerald-400">{result.formulaBreakdown.rawRpm} min⁻¹</strong></div>
              {!latheConfig.isStepless && (
                <div>• Eingestellte Maschine: <strong className="text-blue-300">{latheConfig.name}</strong> ➔ wählt die am besten passende Getriebestufe <strong className="text-white">{result.suggestedRpm} min⁻¹</strong></div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Always-visible Workshop Insights & Cooling Section */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium flex items-center gap-1.5 mb-0.5">
          <Droplet className="w-3.5 h-3.5 text-cyan-400" />
          <span>Werkstatt-Details &amp; Kühlung</span>
        </div>

        {/* Cooling recommendation */}
        <div className="flex items-start gap-2 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
          <Droplet className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-cyan-300 block mb-0.5">Empfohlene Kühlschmierung (KSS):</strong>
            <span className="text-slate-200 leading-snug">{result.cooling}</span>
          </div>
        </div>

        {/* Motor Power & Surface Finish */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50 flex items-start gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-medium">Motorleistung</div>
              <div className="font-mono font-bold text-slate-100 mt-0.5">
                ca. {result.requiredPowerKw} kW
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-medium">Rauhtiefe Rz (theor.)</div>
              <div className="font-mono font-bold text-slate-100 mt-0.5">
                ca. {result.theoreticalRz} µm
              </div>
            </div>
          </div>
        </div>

        {/* Material Specific Tip */}
        <div className="bg-blue-950/40 border border-blue-900/60 p-2.5 rounded-xl text-blue-200">
          <strong className="text-blue-300 block mb-0.5 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Praxis-Tipp ({material.name}):</span>
          </strong>
          <p className="text-[11px] leading-relaxed text-blue-100/90">{material.notes}</p>
        </div>
      </div>
    </div>
  );
};
