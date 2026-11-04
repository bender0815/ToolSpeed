import React, { useState, useMemo } from 'react';
import { Material, MaterialGroup, IsoClassification } from '../types/machining';
import { MATERIALS, MATERIAL_GROUPS } from '../data/materials';
import { haptics } from '../utils/haptics';
import { Search, X, Check, Layers, ChevronRight, Droplet, Sparkles, Loader2, Trash2, Edit3, Save } from 'lucide-react';

interface MaterialBarAndModalProps {
  selectedMaterial: Material;
  onSelectMaterial: (m: Material) => void;
  customMaterials?: Material[];
  onSaveCustomMaterial?: (m: Material) => void;
  onDeleteCustomMaterial?: (id: string) => void;
}

const FAST_MATERIALS = ['pom_c', 'pa6', 'al_2007', 's235jr', 'c45e', '14301_v2a', 'ms58'];

export const MaterialBarAndModal: React.FC<MaterialBarAndModalProps> = ({
  selectedMaterial,
  onSelectMaterial,
  customMaterials = [],
  onSaveCustomMaterial,
  onDeleteCustomMaterial,
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<MaterialGroup | 'all'>('all');

  // AI Assistant State
  const [aiMaterialInput, setAiMaterialInput] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiStatusMsg, setAiStatusMsg] = useState<string>('');
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);
  const [isAiCardExpanded, setIsAiCardExpanded] = useState<boolean>(true);

  // Edit State for Custom Material
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Combine standard and custom materials
  const allMaterials = useMemo(() => {
    return [...customMaterials, ...MATERIALS];
  }, [customMaterials]);

  const filteredMaterials = allMaterials.filter((m) => {
    const matchesGroup = selectedGroupFilter === 'all' || m.group === selectedGroupFilter;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.standardCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const getIsoBadgeStyle = (iso: string) => {
    switch (iso) {
      case 'P':
        return 'bg-blue-600 text-white';
      case 'M':
        return 'bg-amber-500 text-slate-950 font-bold';
      case 'K':
        return 'bg-rose-600 text-white';
      case 'N':
        return 'bg-emerald-600 text-white';
      case 'S':
        return 'bg-orange-600 text-white';
      case 'H':
        return 'bg-slate-700 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const handleAnalyzeMaterialWithAi = async (queryToAnalyze?: string) => {
    const query = (queryToAnalyze || aiMaterialInput).trim();
    if (!query) return;

    haptics.select();
    setIsAiLoading(true);
    setAiErrorMsg(null);
    setAiSuccessMsg(null);
    setAiStatusMsg(`Kataloge & Normen werden nach "${query}" durchsucht...`);

    try {
      const res = await fetch('/api/assist/material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        throw new Error(`Server antwortete mit HTTP-Status ${res.status}`);
      }

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Werkstoffdaten konnten nicht ermittelt werden.');
      }

      const d = json.data;
      const newMat: Material = {
        id: `mat_custom_${Date.now()}`,
        name: d.name || query,
        standardCode: d.standardCode || query,
        shortDesc: d.shortDesc || `KI-Werkstoff (${d.group || 'steel'})`,
        group: (d.group as MaterialGroup) || 'steel',
        isoClass: (d.isoClass as IsoClassification) || 'P',
        kc1_1: typeof d.kc1_1 === 'number' ? d.kc1_1 : 1800,
        hardnessBrinell: d.hardnessBrinell || '',
        cooling: d.cooling || 'KSS / Emulsion',
        notes: d.notes || `Automatisch per KI aus Datenblättern ermittelt für "${query}".`,
        params: d.params,
      };

      // Direct save
      onSaveCustomMaterial?.(newMat);

      // Direct select
      onSelectMaterial(newMat);

      setAiMaterialInput('');
      setAiSuccessMsg(`"${newMat.name}" angelegt und direkt ausgewählt!`);
      haptics.select();

      // Open in edit mode to inspect/tune
      setTimeout(() => {
        setEditingMaterial(newMat);
        setAiSuccessMsg(null);
      }, 700);
    } catch (err: any) {
      console.error('AI Material Assistant Error:', err);
      setAiErrorMsg(err.message || 'Verbindung zum KI-Assistenten fehlgeschlagen.');
    } finally {
      setIsAiLoading(false);
      setAiStatusMsg('');
    }
  };

  const handleSaveEditedMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;

    onSaveCustomMaterial?.(editingMaterial);
    if (selectedMaterial.id === editingMaterial.id) {
      onSelectMaterial(editingMaterial);
    }
    haptics.select();
    setEditingMaterial(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors overflow-hidden w-full max-w-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
            Werkstoff-Auswahl
          </span>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Material
          </h2>
        </div>
        <button
          onClick={() => {
            haptics.select();
            setModalOpen(true);
          }}
          className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer py-1 px-2 -mr-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40"
        >
          <span>Katalog ({allMaterials.length})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Currently Selected Material Display Card */}
      <div
        onClick={() => {
          haptics.select();
          setModalOpen(true);
        }}
        className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-all group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${getIsoBadgeStyle(
              selectedMaterial.isoClass
            )}`}
            title={`ISO Zerspanungsgruppe: ${selectedMaterial.isoClass}`}
          >
            {selectedMaterial.isoClass}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {selectedMaterial.name}
              </span>
              {selectedMaterial.id.startsWith('mat_custom_') && (
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold px-1.5 py-0.5 rounded-full border border-indigo-200/80 dark:border-indigo-800 shrink-0">
                  Eigenes Material
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
              {selectedMaterial.standardCode} {selectedMaterial.hardnessBrinell ? `· ${selectedMaterial.hardnessBrinell}` : ''}
            </div>
            <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium truncate mt-0.5 flex items-center gap-1">
              <Droplet className="w-3 h-3 shrink-0 text-cyan-500" />
              <span>Kühlung: {selectedMaterial.cooling}</span>
            </div>
          </div>
        </div>
        <div className="text-xs font-medium text-blue-600 dark:text-blue-400 shrink-0 ml-2">
          Ändern
        </div>
      </div>

      {/* Fast 1-Tap Material Bar */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 font-medium">
          Schnellzugriff Favoriten:
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full max-w-full">
          {FAST_MATERIALS.map((matId) => {
            const m = allMaterials.find((item) => item.id === matId);
            if (!m) return null;
            const isSelected = selectedMaterial.id === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  haptics.select();
                  onSelectMaterial(m);
                }}
                className={`h-9 px-3 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-blue-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    m.isoClass === 'P'
                      ? 'bg-blue-500'
                      : m.isoClass === 'M'
                      ? 'bg-amber-500'
                      : m.isoClass === 'K'
                      ? 'bg-rose-500'
                      : m.isoClass === 'N'
                      ? 'bg-emerald-500'
                      : 'bg-orange-500'
                  }`}
                />
                <span>{m.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* iOS Bottom Sheet Modal for Full Catalog & AI Assistant */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250">
            {/* Grab handle affordance */}
            <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Werkstoff wählen &amp; erfassen
                </h3>
              </div>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingMaterial(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Schließen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If in Edit Custom Material Mode */}
            {editingMaterial ? (
              <form onSubmit={handleSaveEditedMaterial} className="p-4 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Werkstoff-Parameter anpassen
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingMaterial(null)}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  >
                    Zurück zur Liste
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Name / Bezeichnung
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMaterial.name}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Werkstoff-Norm / WNr.
                    </label>
                    <input
                      type="text"
                      value={editingMaterial.standardCode}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, standardCode: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Spezifische Schnittkraft kc1.1 (N/mm²)
                    </label>
                    <input
                      type="number"
                      value={editingMaterial.kc1_1}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, kc1_1: parseFloat(e.target.value) || 1800 })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                {/* Carbide Roughing / Finishing vc Range */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                    Hartmetall (HM) Schnittdaten (Richtwerte):
                  </h5>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">vc Schruppen (m/min)</span>
                      <input
                        type="number"
                        value={editingMaterial.params.carbide.roughing.vc.rec}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 100;
                          setEditingMaterial({
                            ...editingMaterial,
                            params: {
                              ...editingMaterial.params,
                              carbide: {
                                ...editingMaterial.params.carbide,
                                roughing: {
                                  ...editingMaterial.params.carbide.roughing,
                                  vc: { ...editingMaterial.params.carbide.roughing.vc, rec: val },
                                },
                              },
                            },
                          });
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 font-mono text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">vc Schlichten (m/min)</span>
                      <input
                        type="number"
                        value={editingMaterial.params.carbide.finishing.vc.rec}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 150;
                          setEditingMaterial({
                            ...editingMaterial,
                            params: {
                              ...editingMaterial.params,
                              carbide: {
                                ...editingMaterial.params.carbide,
                                finishing: {
                                  ...editingMaterial.params.carbide.finishing,
                                  vc: { ...editingMaterial.params.carbide.finishing.vc, rec: val },
                                },
                              },
                            },
                          });
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 font-mono text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Vorschub f (mm/U)</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editingMaterial.params.carbide.roughing.f.rec}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0.2;
                          setEditingMaterial({
                            ...editingMaterial,
                            params: {
                              ...editingMaterial.params,
                              carbide: {
                                ...editingMaterial.params.carbide,
                                roughing: {
                                  ...editingMaterial.params.carbide.roughing,
                                  f: { ...editingMaterial.params.carbide.roughing.f, rec: val },
                                },
                              },
                            },
                          });
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 font-mono text-center"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Praxis-Hinweise / Werkstatt-Tipp
                  </label>
                  <textarea
                    rows={2}
                    value={editingMaterial.notes}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, notes: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingMaterial(null)}
                    className="flex-1 py-2.5 text-xs font-medium rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Speichern &amp; Anwenden</span>
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* AI Assistant Material Banner */}
                <div className="p-3.5 bg-gradient-to-br from-indigo-50/90 via-blue-50/50 to-slate-50 dark:from-indigo-950/40 dark:via-blue-950/20 dark:to-slate-900 border-b border-indigo-200/80 dark:border-indigo-900/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>KI-Assistent: Werkstoffdaten automatisch ermitteln</span>
                          <span className="text-[10px] font-mono uppercase bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full">
                            Live-Websuche
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Werkstoffname oder DIN-Nummer eingeben &ndash; KI ermittelt Schnittdaten, Härte und Richtwerte.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAiCardExpanded(!isAiCardExpanded)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      {isAiCardExpanded ? 'Einklappen' : 'Öffnen'}
                    </button>
                  </div>

                  {isAiCardExpanded && (
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="z. B. 1.4404, 42CrMo4, PEEK, Titan Grade 5, CuZn39Pb3..."
                            value={aiMaterialInput}
                            onChange={(e) => setAiMaterialInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !isAiLoading) {
                                e.preventDefault();
                                handleAnalyzeMaterialWithAi();
                              }
                            }}
                            disabled={isAiLoading}
                            className="w-full bg-white dark:bg-slate-900/90 border border-indigo-200 dark:border-indigo-800/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          {aiMaterialInput && !isAiLoading && (
                            <button
                              type="button"
                              onClick={() => setAiMaterialInput('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAnalyzeMaterialWithAi()}
                          disabled={isAiLoading || !aiMaterialInput.trim()}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95 transition-all cursor-pointer"
                        >
                          {isAiLoading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Ermittle...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Mit KI anlegen</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Quick suggestion tags */}
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 font-medium">
                          Beispiele:
                        </span>
                        {[
                          { code: '1.4404 (AISI 316L / V4A)', label: '1.4404 (V4A)' },
                          { code: '42CrMo4+QT (1.7225)', label: '42CrMo4' },
                          { code: 'PEEK (Polyetheretherketon)', label: 'PEEK' },
                          { code: 'Titan Grade 5 (TiAl6V4)', label: 'Titan Grade 5' },
                          { code: 'CuZn39Pb3 (Ms58 Automatenmessing)', label: 'CuZn39Pb3' },
                          { code: '16MnCr5 (Einsatzstahl)', label: '16MnCr5' },
                        ].map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => {
                              setAiMaterialInput(item.code);
                              handleAnalyzeMaterialWithAi(item.code);
                            }}
                            disabled={isAiLoading}
                            className="px-2 py-0.5 text-[10px] font-mono rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shrink-0 transition-colors cursor-pointer"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      {/* AI Loading state or feedback message */}
                      {isAiLoading && (
                        <div className="flex items-center gap-2 p-2 bg-indigo-100/60 dark:bg-indigo-950/60 rounded-xl text-xs text-indigo-800 dark:text-indigo-200 animate-pulse">
                          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-indigo-600 dark:text-indigo-400" />
                          <span className="truncate">{aiStatusMsg}</span>
                        </div>
                      )}

                      {aiSuccessMsg && (
                        <div className="flex items-center gap-2 p-2 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in">
                          <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                          <span>{aiSuccessMsg}</span>
                        </div>
                      )}

                      {aiErrorMsg && (
                        <div className="flex items-center gap-2 p-2 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 animate-in fade-in">
                          <X className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                          <span>{aiErrorMsg}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Search Input */}
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Werkstoff oder DIN suchen (z.B. Alu, S235, 1.4301, POM)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Group Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mt-2.5 pt-0.5">
                    <button
                      onClick={() => {
                        haptics.tick();
                        setSelectedGroupFilter('all');
                      }}
                      className={`px-3 py-1 text-xs font-medium rounded-lg shrink-0 transition-colors ${
                        selectedGroupFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Alle
                    </button>
                    {MATERIAL_GROUPS.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => {
                          haptics.tick();
                          setSelectedGroupFilter(g.id);
                        }}
                        className={`px-3 py-1 text-xs font-medium rounded-lg shrink-0 transition-colors ${
                          selectedGroupFilter === g.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {g.label.split('/')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* List of Materials */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-2">
                  {/* Custom Materials Category Header if present */}
                  {customMaterials.length > 0 && selectedGroupFilter === 'all' && !searchQuery && (
                    <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-lg my-1">
                      Meine eigenen Werkstoffe ({customMaterials.length})
                    </div>
                  )}

                  {filteredMaterials.map((mat) => {
                    const isSelected = selectedMaterial.id === mat.id;
                    const isCustom = mat.id.startsWith('mat_custom_');

                    return (
                      <div
                        key={mat.id}
                        onClick={() => {
                          haptics.select();
                          onSelectMaterial(mat);
                          setModalOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-2xl flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100'
                            : isCustom
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 text-slate-900 dark:text-slate-200'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-900 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${getIsoBadgeStyle(
                              mat.isoClass
                            )}`}
                          >
                            {mat.isoClass}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-sm truncate">
                                {mat.name}
                              </span>
                              {isCustom && (
                                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded-full shrink-0">
                                  KI / Eigen
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                              {mat.standardCode} {mat.hardnessBrinell ? `· ${mat.hardnessBrinell}` : ''} · kc1.1={mat.kc1_1}N/mm²
                            </div>
                            <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium truncate mt-0.5 flex items-center gap-1">
                              <Droplet className="w-3 h-3 shrink-0 text-cyan-500" />
                              <span>Kühlung: {mat.cooling}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                              {mat.shortDesc}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isCustom && (
                            <>
                              <button
                                type="button"
                                title="Parameter bearbeiten"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingMaterial(mat);
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {onDeleteCustomMaterial && (
                                <button
                                  type="button"
                                  title="Werkstoff löschen"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    haptics.tick();
                                    onDeleteCustomMaterial(mat.id);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {filteredMaterials.length === 0 && (
                    <div className="py-12 text-center text-slate-400 text-sm">
                      Kein Werkstoff für &quot;{searchQuery}&quot; gefunden.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
