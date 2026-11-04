import React, { useState } from 'react';
import { LatheGearConfig } from '../types/machining';
import { DEFAULT_LATHE_CONFIGS } from '../data/lathes';
import { haptics } from '../utils/haptics';
import { X, Check, Cog, Plus, Trash2 } from 'lucide-react';

interface MachineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLathe: LatheGearConfig;
  onSelectLathe: (lathe: LatheGearConfig) => void;
}

import { getStoredItem, setStoredItem } from '../utils/storage';

export const MachineSettingsModal: React.FC<MachineSettingsModalProps> = ({
  isOpen,
  onClose,
  activeLathe,
  onSelectLathe,
}) => {
  const [customConfigs, setCustomConfigs] = useState<LatheGearConfig[]>(() => {
    try {
      const saved = getStoredItem('custom_lathes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newLatheName, setNewLatheName] = useState<string>('');
  const [newStepsInput, setNewStepsInput] = useState<string>('42, 60, 85, 120, 170, 240, 340, 480, 680, 950, 1200, 1600');
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLatheName.trim()) return;

    const parsedSteps = newStepsInput
      .split(/[,;\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0)
      .sort((a, b) => a - b);

    if (parsedSteps.length === 0) return;

    const newConfig: LatheGearConfig = {
      id: `custom_${Date.now()}`,
      name: newLatheName.trim(),
      isStepless: false,
      steps: parsedSteps,
    };

    const updated = [...customConfigs, newConfig];
    setCustomConfigs(updated);
    try {
      setStoredItem('custom_lathes', JSON.stringify(updated));
    } catch {}

    haptics.select();
    onSelectLathe(newConfig);
    setNewLatheName('');
    setShowAddCustom(false);
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.tick();
    const updated = customConfigs.filter((c) => c.id !== id);
    setCustomConfigs(updated);
    try {
      setStoredItem('custom_lathes', JSON.stringify(updated));
    } catch {}
    if (activeLathe.id === id) {
      onSelectLathe(DEFAULT_LATHE_CONFIGS[0]);
    }
  };

  const allConfigs = [...DEFAULT_LATHE_CONFIGS, ...customConfigs];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250">
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Cog className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Meine Drehbank & Getriebestufen
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Wähle die passende Maschine für automatische Drehzahl-Rundung
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {allConfigs.map((config) => {
            const isSelected = activeLathe.id === config.id;
            const isCustom = config.id.startsWith('custom_');

            return (
              <div
                key={config.id}
                onClick={() => {
                  haptics.select();
                  onSelectLathe(config);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {config.name}
                    </span>
                    {config.isStepless ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-medium">
                        Stufenlos
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                        {config.steps.length} Stufen
                      </span>
                    )}
                  </div>

                  {!config.isStepless && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate mt-1">
                      {config.steps.join(' · ')} U/min
                    </div>
                  )}
                  {config.isStepless && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate mt-1">
                      {config.minRpm ?? 40} – {config.maxRpm ?? 3000} U/min kontinuierlich
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isCustom && (
                    <button
                      onClick={(e) => handleDeleteCustom(config.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Custom Lathe Toggle */}
          {!showAddCustom ? (
            <button
              onClick={() => {
                haptics.tick();
                setShowAddCustom(true);
              }}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Eigene Drehbank mit Getriebestufen hinzufügen</span>
            </button>
          ) : (
            <form
              onSubmit={handleAddCustom}
              className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Eigene Maschine anlegen
              </h4>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                  Maschinenname (z.B. &quot;Optimum D250x550&quot; oder &quot;Alte Weiler&quot;):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Meine Drehbank"
                  value={newLatheName}
                  onChange={(e) => setNewLatheName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                  Verfügbare Drehzahlen (kommagetrennt in U/min):
                </label>
                <input
                  type="text"
                  required
                  placeholder="70, 115, 190, 310, 500, 850, 1400, 2300"
                  value={newStepsInput}
                  onChange={(e) => setNewStepsInput(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddCustom(false)}
                  className="flex-1 py-2 text-xs font-medium rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-medium rounded-xl bg-blue-600 text-white"
                >
                  Speichern
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
