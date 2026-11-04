import React, { useState } from 'react';
import { DualRecommendationResult, WorkshopTool } from '../types/machining';
import { Wrench, CheckCircle2, ChevronRight, Sparkles, AlertCircle, ArrowRightLeft, Plus, Check } from 'lucide-react';
import { haptics } from '../utils/haptics';
import { getToolsComparisonNote } from '../utils/toolRecommender';

interface RecommendedToolCardProps {
  dualResult: DualRecommendationResult;
  selectedToolId?: string;
  onSelectTool: (tool: WorkshopTool) => void;
  onOpenToolDatabase: () => void;
  onToggleToolOwnership?: (toolId: string) => void;
}

export const RecommendedToolCard: React.FC<RecommendedToolCardProps> = ({
  dualResult,
  selectedToolId,
  onSelectTool,
  onOpenToolDatabase,
  onToggleToolOwnership,
}) => {
  const [showAlternativePicker, setShowAlternativePicker] = useState<boolean>(false);

  const {
    bestOwned,
    bestOverall,
    hasBetterUnownedAlternative,
    upgradeRationale,
    allOwned,
    allUnowned,
    equallySuitableOwned,
  } = dualResult;

  // Active tool shown: either user-selected, or bestOwned, or bestOverall fallback
  const activeToolRec = selectedToolId
    ? allOwned.find((r) => r.tool.id === selectedToolId) || bestOwned || bestOverall
    : bestOwned || bestOverall;

  // List of top tier equally suitable owned tools (e.g. score within 5 points of bestOwned)
  const topTierOwned = bestOwned
    ? [bestOwned, ...(equallySuitableOwned || [])]
    : [];

  // Comparison note between current active tool and another equally suitable tool
  const alternateTopTool = topTierOwned.find((r) => r.tool.id !== activeToolRec?.tool.id) || topTierOwned[1];
  const comparisonNote = (activeToolRec && alternateTopTool && topTierOwned.length > 1)
    ? getToolsComparisonNote(activeToolRec.tool, alternateTopTool.tool)
    : null;

  const getVerdictBadge = (score: number) => {
    if (score >= 80) {
      return {
        bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
        label: 'Optimales Werkzeug',
      };
    }
    if (score >= 60) {
      return {
        bg: 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400',
        label: 'Gut geeignet',
      };
    }
    if (score >= 35) {
      return {
        bg: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
        label: 'Bedingt geeignet',
      };
    }
    return {
      bg: 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400',
      label: 'Ungeeignet',
    };
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors space-y-3 overflow-hidden w-full max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300">
            Werkzeug-Empfehlung
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              haptics.tick();
              setShowAlternativePicker(!showAlternativePicker);
            }}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Wechseln ({allOwned.length})</span>
          </button>
        </div>
      </div>

      {/* 1. Best Owned Tool Section */}
      {activeToolRec ? (
        <div className="space-y-3">
          {/* Gleichwertig geeignete Werkzeuge aus der Werkstatt */}
          {topTierOwned.length > 1 && (
            <div className="p-3.5 bg-gradient-to-br from-blue-50/90 to-indigo-50/70 dark:from-blue-950/40 dark:to-indigo-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/60 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950 dark:text-blue-100">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>{topTierOwned.length} vorhandene Werkzeuge gleich gut geeignet:</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-200/80 dark:bg-blue-900/80 text-blue-900 dark:text-blue-200 shrink-0">
                  Je ~{bestOwned?.score}% Match
                </span>
              </div>

              {/* Quick-Switch Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {topTierOwned.map((rec) => {
                  const isCurrent = activeToolRec?.tool.id === rec.tool.id;
                  return (
                    <button
                      key={rec.tool.id}
                      onClick={() => {
                        haptics.select();
                        onSelectTool(rec.tool);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isCurrent
                          ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-xs ring-2 ring-blue-500/30'
                          : 'bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isCurrent
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isCurrent ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Aktiv gewählt</span>
                            </>
                          ) : (
                            <span>Tippen zum Wählen</span>
                          )}
                        </span>

                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {rec.score}%
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {rec.tool.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>{rec.tool.holderDesignation}</span>
                          <span>·</span>
                          <span>{rec.tool.insertDesignation}</span>
                          <span>·</span>
                          <span>r={rec.tool.cornerRadiusMm}mm</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Praxis-Unterschied / Entscheidungshilfe */}
              {comparisonNote && (
                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-blue-200/60 dark:border-blue-900/50 text-[11px] text-blue-950 dark:text-blue-200 leading-snug flex items-start gap-2">
                  <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">
                    💡 Praxis-Vergleich:
                  </span>
                  <span>{comparisonNote}</span>
                </div>
              )}
            </div>
          )}

          {/* Detailed Active Tool Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {activeToolRec.isOwned ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{topTierOwned.length > 1 ? 'Ausgewähltes Werkzeug' : 'In deiner Werkstatt'}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-900/60">
                      Vorschlag (Nicht im Bestand)
                    </span>
                  )}

                  {(() => {
                    const b = getVerdictBadge(activeToolRec.score);
                    return (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${b.bg}`}>
                        <Sparkles className="w-3 h-3" />
                        <span>{b.label}</span>
                        <span className="font-mono">({activeToolRec.score}%)</span>
                      </span>
                    );
                  })()}

                  {activeToolRec.tool.inToolPost && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      Im Multifix
                    </span>
                  )}
                </div>

                {/* Tool Name */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {activeToolRec.tool.name}
                </h3>

                {/* Dual Box: Empfohlene Wendeplatte & Passender Halter */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
                  {/* Box 1: Empfohlene Wendeplatte */}
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <span>💎 Empfohlene Wendeplatte</span>
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        activeToolRec.recommendedInsert?.isOwned
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}>
                        {activeToolRec.recommendedInsert?.isOwned ? 'Vorrätig' : 'Nicht im Bestand'}
                      </span>
                    </div>

                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {activeToolRec.recommendedInsert?.designation || activeToolRec.tool.insertDesignation}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        Form {activeToolRec.tool.insertShape}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        rε = {activeToolRec.tool.cornerRadiusMm} mm
                      </span>
                      {activeToolRec.tool.isAluminumPolished && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
                          Alu-Politur
                        </span>
                      )}
                      {activeToolRec.tool.bladeWidthMm && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {activeToolRec.tool.bladeWidthMm} mm Breite
                        </span>
                      )}
                    </div>

                    {activeToolRec.recommendedInsert?.tip && (
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight pt-0.5">
                        {activeToolRec.recommendedInsert.tip}
                      </p>
                    )}
                  </div>

                  {/* Box 2: Passender Halter */}
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <span>🔩 Passender Werkzeughalter</span>
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        activeToolRec.matchingHolder?.inToolPost
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : activeToolRec.matchingHolder?.isOwned
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {activeToolRec.matchingHolder?.inToolPost
                          ? 'Im Multifix'
                          : activeToolRec.matchingHolder?.isOwned
                          ? 'Vorhanden'
                          : 'Fehlt'}
                      </span>
                    </div>

                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
                      {activeToolRec.matchingHolder?.designation || activeToolRec.tool.holderDesignation}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        Schaft: {activeToolRec.tool.shankSize}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {activeToolRec.tool.toolMaterial.toUpperCase()}
                      </span>
                    </div>

                    {activeToolRec.matchingHolder?.tip && (
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight pt-0.5">
                        {activeToolRec.matchingHolder.tip}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reasons */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 space-y-1">
              {activeToolRec.reasons.slice(0, 3).map((r, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300 leading-snug">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}

              {activeToolRec.drawbacks && activeToolRec.drawbacks.length > 0 && (
                <div className="mt-1.5 pt-1 space-y-1">
                  {activeToolRec.drawbacks.map((d, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400 leading-snug">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
          Du hast noch keine Werkzeuge für diesen Bearbeitungsschritt als &quot;vorhanden&quot; markiert.
        </div>
      )}

      {/* 2. Upgrade Recommendation Box (If a better unowned tool exists!) */}
      {hasBetterUnownedAlternative && bestOverall && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/80 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Upgrade-Empfehlung (Nicht in deiner Werkstatt):</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white font-mono">
              +{dualResult.scoreDifference}% besser
            </span>
          </div>

          <div className="text-xs font-bold text-slate-900 dark:text-white">
            {bestOverall.tool.name}
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            {upgradeRationale}
          </p>

          <div className="pt-1 flex items-center justify-between gap-2">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              {bestOverall.tool.holderDesignation} · {bestOverall.tool.insertDesignation}
            </div>

            {onToggleToolOwnership && (
              <button
                onClick={() => {
                  haptics.select();
                  onToggleToolOwnership(bestOverall.tool.id);
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all shrink-0"
                title="Als in meiner Werkstatt vorhanden markieren"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ich habe dieses Werkzeug</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Reassurance badge if owned tool is already the absolute best */}
      {!hasBetterUnownedAlternative && bestOwned && bestOwned.score >= 82 && (
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            {topTierOwned.length > 1
              ? `Top ausgestattet: Du besitzt ${topTierOwned.length} optimal geeignete Werkzeuge im Bestand.`
              : 'Top ausgestattet: Du besitzt bereits das optimale Werkzeug für diesen Job.'}
          </span>
        </div>
      )}

      {/* Alternative Tool Switcher Drawer */}
      {showAlternativePicker && (
        <div className="mt-2 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Vorhandene Werkzeuge ({allOwned.length}):</span>
            <button
              onClick={onOpenToolDatabase}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-0.5"
            >
              <span>Werkzeugdatenbank öffnen</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar">
            {allOwned.map((rec) => {
              const isSelected = rec.tool.id === (activeToolRec?.tool.id);
              const isEquallyTop = topTierOwned.some((t) => t.tool.id === rec.tool.id && topTierOwned.length > 1);
              return (
                <button
                  key={rec.tool.id}
                  onClick={() => {
                    haptics.select();
                    onSelectTool(rec.tool);
                    setShowAlternativePicker(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs truncate font-medium flex items-center gap-1.5">
                      <span>{rec.tool.name}</span>
                      {isEquallyTop && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Gleichwertig
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      {rec.tool.insertDesignation} · r={rec.tool.cornerRadiusMm}mm
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        rec.score >= 80
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : rec.score >= 60
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {rec.score}%
                    </span>
                  </div>
                </button>
              );
            })}

            {allUnowned.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Nicht im Bestand (Katalog-Vorschläge):
                </span>
                {allUnowned.slice(0, 3).map((rec) => (
                  <div
                    key={rec.tool.id}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/40 text-xs text-slate-500 flex items-center justify-between gap-2 mb-1"
                  >
                    <span className="truncate">{rec.tool.name}</span>
                    <span className="text-[10px] font-mono font-bold shrink-0">{rec.score}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
