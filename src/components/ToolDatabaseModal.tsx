import React, { useState, useMemo } from 'react';
import { WorkshopTool, ToolCategory, InsertShape, IsoClassification, ToolType } from '../types/machining';
import { DEFAULT_WORKSHOP_TOOLS } from '../data/defaultTools';
import { haptics } from '../utils/haptics';
import { setStoredItem } from '../utils/storage';
import { Wrench, Plus, Trash2, Edit3, X, Check, Search, RotateCcw, Sparkles, Loader2, Database, Layers } from 'lucide-react';

interface ToolDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: WorkshopTool[];
  onSaveTools: (tools: WorkshopTool[]) => void;
  onSelectActiveTool?: (tool: WorkshopTool) => void;
  onOpenBackupModal?: () => void;
}

const CATEGORY_LABELS: { id: ToolCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'roughing_external', label: 'Schruppen' },
  { id: 'finishing_external', label: 'Schlichten' },
  { id: 'parting_grooving', label: 'Abstechen' },
  { id: 'boring_internal', label: 'Bohrstangen' },
  { id: 'threading', label: 'Gewindedrehen' },
  { id: 'hss_custom', label: 'HSS' },
];

export const ToolDatabaseModal: React.FC<ToolDatabaseModalProps> = ({
  isOpen,
  onClose,
  tools,
  onSaveTools,
  onSelectActiveTool,
  onOpenBackupModal,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'owned' | 'unowned'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ToolCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'by_holder'>('list');
  const [editingTool, setEditingTool] = useState<WorkshopTool | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // AI Assistant State
  const [aiToolInput, setAiToolInput] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiStatusMsg, setAiStatusMsg] = useState<string>('');
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);
  const [isAiCardExpanded, setIsAiCardExpanded] = useState<boolean>(true);

  // Form State for Add / Edit
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<ToolCategory>('roughing_external');
  const [formHolder, setFormHolder] = useState<string>('');
  const [formInsert, setFormInsert] = useState<string>('');
  const [formShape, setFormShape] = useState<InsertShape>('C');
  const [formMaterial, setFormMaterial] = useState<ToolType>('carbide');
  const [formRadius, setFormRadius] = useState<number>(0.8);
  const [formBladeWidth, setFormBladeWidth] = useState<number>(2.0);
  const [formShank, setFormShank] = useState<string>('20x20 mm');
  const [formIsoClasses, setFormIsoClasses] = useState<IsoClassification[]>(['P', 'M']);
  const [formAluPolished, setFormAluPolished] = useState<boolean>(false);
  const [formNotes, setFormNotes] = useState<string>('');
  const [formInToolPost, setFormInToolPost] = useState<boolean>(false);
  const [formIsOwned, setFormIsOwned] = useState<boolean>(true);

  if (!isOpen) return null;

  const ownedCount = tools.filter((t) => t.isOwned).length;
  const unownedCount = tools.filter((t) => !t.isOwned).length;

  const filteredTools = tools.filter((t) => {
    const matchesOwnership =
      ownershipFilter === 'all' ||
      (ownershipFilter === 'owned' && t.isOwned) ||
      (ownershipFilter === 'unowned' && !t.isOwned);

    const matchesCat = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.holderDesignation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.insertDesignation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesOwnership && matchesCat && matchesSearch;
  });

  const handleOpenAddForm = () => {
    haptics.tick();
    setEditingTool(null);
    setFormName('');
    setFormCategory('roughing_external');
    setFormHolder('');
    setFormInsert('');
    setFormShape('C');
    setFormMaterial('carbide');
    setFormRadius(0.4);
    setFormBladeWidth(2.0);
    setFormShank('20x20 mm');
    setFormIsoClasses(['P', 'M']);
    setFormAluPolished(false);
    setFormNotes('');
    setFormInToolPost(false);
    setFormIsOwned(true);
    setIsAddingNew(true);
  };

  const handleOpenEditForm = (t: WorkshopTool) => {
    haptics.tick();
    setEditingTool(t);
    setFormName(t.name);
    setFormCategory(t.category);
    setFormHolder(t.holderDesignation);
    setFormInsert(t.insertDesignation);
    setFormShape(t.insertShape);
    setFormMaterial(t.toolMaterial);
    setFormRadius(t.cornerRadiusMm);
    setFormBladeWidth(t.bladeWidthMm ?? 2.0);
    setFormShank(t.shankSize);
    setFormIsoClasses([...t.suitableIsoClasses]);
    setFormAluPolished(Boolean(t.isAluminumPolished));
    setFormNotes(t.notes ?? '');
    setFormInToolPost(Boolean(t.inToolPost));
    setFormIsOwned(Boolean(t.isOwned));
    setIsAddingNew(true);
  };

  const handleAddInsertForHolder = (holderTool: WorkshopTool, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    haptics.tick();
    setEditingTool(null);
    setFormName(`${holderTool.holderDesignation} · Neue Wendeplatte`);
    setFormCategory(holderTool.category);
    setFormHolder(holderTool.holderDesignation);
    setFormInsert('');
    setFormShape(holderTool.insertShape);
    setFormMaterial(holderTool.toolMaterial);
    setFormRadius(holderTool.cornerRadiusMm);
    setFormBladeWidth(holderTool.bladeWidthMm ?? 2.0);
    setFormShank(holderTool.shankSize);
    setFormIsoClasses([...holderTool.suitableIsoClasses]);
    setFormAluPolished(false);
    setFormNotes(`Passend auf Werkzeughalter ${holderTool.holderDesignation}`);
    setFormInToolPost(holderTool.inToolPost ?? false);
    setFormIsOwned(true);
    setIsAddingNew(true);
  };

  const toolsByHolder = useMemo(() => {
    const groups: { [key: string]: { holderName: string; shankSize: string; inToolPost: boolean; isOwned: boolean; tools: WorkshopTool[] } } = {};

    for (const t of filteredTools) {
      const key = t.holderDesignation?.trim() || t.name;
      if (!groups[key]) {
        groups[key] = {
          holderName: key,
          shankSize: t.shankSize || '20x20 mm',
          inToolPost: Boolean(t.inToolPost),
          isOwned: Boolean(t.isOwned),
          tools: [],
        };
      }
      groups[key].tools.push(t);
      if (t.inToolPost) groups[key].inToolPost = true;
      if (t.isOwned) groups[key].isOwned = true;
    }

    return Object.values(groups);
  }, [filteredTools]);

  const handleToggleOwnership = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    haptics.select();
    const updated = tools.map((t) => (t.id === id ? { ...t, isOwned: !t.isOwned } : t));
    onSaveTools(updated);
    try {
      setStoredItem('user_tools', JSON.stringify(updated));
    } catch {}
  };

  const handleAnalyzeToolWithAi = async (codeToAnalyze?: string) => {
    const query = (codeToAnalyze || aiToolInput).trim();
    if (!query) return;

    haptics.select();
    setIsAiLoading(true);
    setAiErrorMsg(null);
    setAiSuccessMsg(null);
    setAiStatusMsg(`Kataloge & Normen werden nach "${query}" durchsucht...`);

    try {
      const res = await fetch('/api/assist/tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        throw new Error(`Server antwortete mit Status ${res.status}`);
      }

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Werkzeugdaten konnten nicht ermittelt werden.');
      }

      const d = json.data;
      const newTool: WorkshopTool = {
        id: `tool_custom_${Date.now()}`,
        name: d.name || query,
        category: (d.category as ToolCategory) || 'roughing_external',
        holderDesignation: d.holderDesignation || '',
        insertDesignation: d.insertDesignation || query,
        insertShape: (d.insertShape as InsertShape) || 'C',
        toolMaterial: (d.toolMaterial as ToolType) || 'carbide',
        cornerRadiusMm: typeof d.cornerRadiusMm === 'number' ? d.cornerRadiusMm : 0.8,
        bladeWidthMm: d.category === 'parting_grooving' ? (d.bladeWidthMm || 2.0) : undefined,
        shankSize: d.shankSize || '20x20 mm',
        suitableIsoClasses: Array.isArray(d.suitableIsoClasses) && d.suitableIsoClasses.length > 0 ? d.suitableIsoClasses : ['P', 'M'],
        isAluminumPolished: Boolean(d.isAluminumPolished),
        notes: d.notes || `Automatisch erfasst via KI-Katalogschnittstelle für "${query}".`,
        inToolPost: false,
        isOwned: true,
      };

      // Direct save to tools array and storage
      const updatedTools = [newTool, ...tools];
      onSaveTools(updatedTools);
      try {
        setStoredItem('user_tools', JSON.stringify(updatedTools));
      } catch {}

      setAiToolInput('');
      setAiSuccessMsg(`"${newTool.name}" erfolgreich angelegt und gespeichert!`);

      // Automatically open in edit form for immediate review / adjustment
      setTimeout(() => {
        handleOpenEditForm(newTool);
        setAiSuccessMsg(null);
      }, 700);
    } catch (err: any) {
      console.error('AI Tool Assistant Error:', err);
      setAiErrorMsg(err.message || 'Verbindung zum KI-Assistenten fehlgeschlagen.');
    } finally {
      setIsAiLoading(false);
      setAiStatusMsg('');
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newOrUpdatedTool: WorkshopTool = {
      id: editingTool ? editingTool.id : `tool_${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      holderDesignation: formHolder.trim() || 'Drehmeißel',
      insertDesignation: formInsert.trim() || 'Wendeplatte',
      insertShape: formShape,
      toolMaterial: formMaterial,
      cornerRadiusMm: formRadius,
      bladeWidthMm: formCategory === 'parting_grooving' ? formBladeWidth : undefined,
      shankSize: formShank.trim() || '20x20 mm',
      suitableIsoClasses: formIsoClasses.length > 0 ? formIsoClasses : ['P'],
      isAluminumPolished: formAluPolished,
      notes: formNotes.trim(),
      inToolPost: formInToolPost,
      isOwned: formIsOwned,
    };

    let updated: WorkshopTool[];
    if (editingTool) {
      updated = tools.map((t) => (t.id === editingTool.id ? newOrUpdatedTool : t));
    } else {
      updated = [newOrUpdatedTool, ...tools];
    }

    onSaveTools(updated);
    try {
      setStoredItem('user_tools', JSON.stringify(updated));
    } catch {}

    haptics.select();
    setIsAddingNew(false);
    setEditingTool(null);
  };

  const handleDeleteTool = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.tick();
    const updated = tools.filter((t) => t.id !== id);
    onSaveTools(updated);
    try {
      setStoredItem('user_tools', JSON.stringify(updated));
    } catch {}
  };

  const handleResetDefaults = () => {
    if (window.confirm('Möchtest du wirklich alle Werkzeuge auf die Standard-Werkstattpalette zurücksetzen?')) {
      haptics.select();
      onSaveTools(DEFAULT_WORKSHOP_TOOLS);
      try {
        setStoredItem('user_tools', JSON.stringify(DEFAULT_WORKSHOP_TOOLS));
      } catch {}
    }
  };

  const toggleIsoClass = (cls: IsoClassification) => {
    haptics.tick();
    if (formIsoClasses.includes(cls)) {
      setFormIsoClasses(formIsoClasses.filter((c) => c !== cls));
    } else {
      setFormIsoClasses([...formIsoClasses, cls]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250">
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3 sm:hidden" />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Meine Werkzeugdatenbank
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {ownedCount} in deiner Werkstatt · {unownedCount} Vorschläge
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onOpenBackupModal && (
              <button
                type="button"
                onClick={onOpenBackupModal}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Lokale Werkzeuge sichern / Backup importieren"
              >
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Backup &amp; Export</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Add / Edit Form Modal Screen */}
          {isAddingNew ? (
            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingTool ? 'Werkzeug bearbeiten' : 'Neues Werkzeug anlegen'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                  Abbrechen
                </button>
              </div>

              {/* Ownership Toggle in Form */}
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    In meiner Werkstatt vorhanden
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Wird für direkte Drehzahl- und Schnittempfehlungen verwendet
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsOwned}
                  onChange={(e) => setFormIsOwned(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 focus:ring-0"
                />
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Bezeichnung / Name im Werkstattkasten *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Drehmeißel 20x20 SCLCR2020K09"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Einsatzzweck *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ToolCategory)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="roughing_external">Außen Schruppen</option>
                    <option value="finishing_external">Außen Schlichten / Kopieren</option>
                    <option value="parting_grooving">Abstechen / Einstechen</option>
                    <option value="boring_internal">Innen-Bohrstange</option>
                    <option value="threading">Gewindedrehen</option>
                    <option value="hss_custom">HSS-Drehmeißel</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Schneidstoff
                  </label>
                  <select
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value as ToolType)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="carbide">Hartmetall (HM / Wendeplatte)</option>
                    <option value="hss">HSS (Schnellarbeitsstahl)</option>
                  </select>
                </div>
              </div>

              {/* Holder & Insert Designation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Halter-Bezeichnung
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. SCLCR 2020 K09"
                    value={formHolder}
                    onChange={(e) => setFormHolder(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Wendeplatten-Code
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. CCGT 09T304-AK-A"
                    value={formInsert}
                    onChange={(e) => setFormInsert(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Plattenform & Eckenradius */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Form (ISO)
                  </label>
                  <select
                    value={formShape}
                    onChange={(e) => setFormShape(e.target.value as InsertShape)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-900 dark:text-white font-mono"
                  >
                    <option value="C">C (80° Rhombus)</option>
                    <option value="D">D (55° Rhombus)</option>
                    <option value="V">V (35° Rhombus)</option>
                    <option value="W">W (80° Trigon)</option>
                    <option value="S">S (90° Quadrat)</option>
                    <option value="T">T (60° Dreieck)</option>
                    <option value="groove">Stechplatte (MGMN)</option>
                    <option value="thread">Gewindeplatte (16ER)</option>
                    <option value="hss">HSS Schneide</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Eckenradius rε
                  </label>
                  <select
                    value={formRadius}
                    onChange={(e) => setFormRadius(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-900 dark:text-white font-mono"
                  >
                    <option value={0.2}>0.2 mm (sehr fein)</option>
                    <option value={0.4}>0.4 mm (Schlichten)</option>
                    <option value={0.8}>0.8 mm (Schruppen)</option>
                    <option value={1.2}>1.2 mm (Großabtrag)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Schaftgröße
                  </label>
                  <input
                    type="text"
                    placeholder="20x20 mm"
                    value={formShank}
                    onChange={(e) => setFormShank(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Parting Blade width if parting */}
              {formCategory === 'parting_grooving' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Stechbreite (Klingenbreite in mm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="6.0"
                    value={formBladeWidth}
                    onChange={(e) => setFormBladeWidth(parseFloat(e.target.value) || 2.0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {/* ISO Suitability Checkboxes */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Geeignet für Werkstoffe nach DIN ISO 513:
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'P' as IsoClassification, label: 'P (Stahl)', color: 'bg-blue-600' },
                    { id: 'M' as IsoClassification, label: 'M (Edelstahl)', color: 'bg-amber-500 text-slate-950' },
                    { id: 'K' as IsoClassification, label: 'K (Gusseisen)', color: 'bg-rose-600' },
                    { id: 'N' as IsoClassification, label: 'N (Alu/NE)', color: 'bg-emerald-600' },
                    { id: 'S' as IsoClassification, label: 'S (Titan)', color: 'bg-orange-600' },
                  ].map((iso) => {
                    const isChecked = formIsoClasses.includes(iso.id);
                    return (
                      <button
                        type="button"
                        key={iso.id}
                        onClick={() => toggleIsoClass(iso.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isChecked
                            ? `${iso.color} text-white shadow-xs`
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                        <span>{iso.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special Flags */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAluPolished}
                    onChange={(e) => setFormAluPolished(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    Hochglanzpolierte Spanmulde (speziell für Alu, Messing &amp; POM)
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formInToolPost}
                    onChange={(e) => setFormInToolPost(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    Aktuell im Schnellwechselhalter (Multifix) eingespannt
                  </span>
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Werkstattnotiz / Artikelnummer / Kasten-Ort
                </label>
                <input
                  type="text"
                  placeholder="z.B. Art.-Nr. 2293, Fach 2"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="flex-1 py-2.5 text-xs font-medium rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20"
                >
                  {editingTool ? 'Änderungen speichern' : 'Werkzeug anlegen'}
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Ownership Mode Segmented Tabs: Alle vs In Werkstatt vs Vorschläge */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <button
                  onClick={() => {
                    haptics.tick();
                    setOwnershipFilter('all');
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    ownershipFilter === 'all'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Alle ({tools.length})
                </button>
                <button
                  onClick={() => {
                    haptics.tick();
                    setOwnershipFilter('owned');
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    ownershipFilter === 'owned'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>In Werkstatt ({ownedCount})</span>
                </button>
                <button
                  onClick={() => {
                    haptics.tick();
                    setOwnershipFilter('unowned');
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    ownershipFilter === 'unowned'
                      ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Vorschläge ({unownedCount})</span>
                </button>
              </div>

              {/* View Mode Toggle: Kombinationen vs Nach Halter gruppiert */}
              <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Gliederung:
                </span>
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tick();
                      setViewMode('list');
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Alle ({filteredTools.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      haptics.tick();
                      setViewMode('by_holder');
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === 'by_holder'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    <span>Nach Halter ({toolsByHolder.length})</span>
                  </button>
                </div>
              </div>

              {/* AI Tool Assistant Card */}
              <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/40 to-slate-50/80 dark:from-indigo-950/40 dark:via-blue-950/20 dark:to-slate-900 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 p-3.5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>KI-Assistent: Werkzeug per ISO-Code erfassen</span>
                        <span className="text-[10px] font-mono uppercase bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full">
                          Live-Websuche
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Code eingeben &ndash; KI liest Datenblatt, Eckenradius, Form &amp; Schnittwerte automatisch aus.
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
                          placeholder="z. B. CNMG 120408, SCLCR 1616 H09, DCMT 070204, MGMN 200..."
                          value={aiToolInput}
                          onChange={(e) => setAiToolInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isAiLoading) {
                              e.preventDefault();
                              handleAnalyzeToolWithAi();
                            }
                          }}
                          disabled={isAiLoading}
                          className="w-full bg-white dark:bg-slate-900/90 border border-indigo-200 dark:border-indigo-800/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {aiToolInput && !isAiLoading && (
                          <button
                            type="button"
                            onClick={() => setAiToolInput('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAnalyzeToolWithAi()}
                        disabled={isAiLoading || !aiToolInput.trim()}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95 transition-all cursor-pointer"
                      >
                        {isAiLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Analysiere...</span>
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
                        { code: 'CNMG 120408', label: 'CNMG 120408 (Schruppen)' },
                        { code: 'DCMT 070204', label: 'DCMT 070204 (Schlichten)' },
                        { code: 'CCGT 09T304-AL', label: 'CCGT 09T304-AL (Alu)' },
                        { code: 'MGMN 200-G', label: 'MGMN 200 (Abstechen 2mm)' },
                        { code: 'SCLCR 1616 H09', label: 'SCLCR 1616 H09 (Halter)' },
                        { code: 'SER 1616 H16', label: 'SER 1616 (Gewinde)' },
                        { code: 'S16R-SCLCR09', label: 'S16R (Bohrstange)' },
                      ].map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setAiToolInput(item.code);
                            handleAnalyzeToolWithAi(item.code);
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

              {/* Search & Add Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Werkzeug, Halter oder Wendeplatte suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleOpenAddForm}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Neues Werkzeug</span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {CATEGORY_LABELS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      haptics.tick();
                      setCategoryFilter(c.id);
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer ${
                      categoryFilter === c.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Tool List or Grouped by Holder View */}
              {viewMode === 'by_holder' ? (
                <div className="space-y-4">
                  {toolsByHolder.map((group) => (
                    <div
                      key={group.holderName}
                      className="p-3.5 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5"
                    >
                      {/* Holder Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800/80 pb-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                              🔩 {group.holderName}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                              Schaft: {group.shankSize}
                            </span>
                            {group.inToolPost && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
                                Im Multifix
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 mt-0.5 block">
                            {group.tools.length} passende Wendeplatte{group.tools.length > 1 ? 'n' : ''} konfiguriert
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleAddInsertForHolder(group.tools[0], e)}
                          className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs shrink-0 active:scale-95 transition-all cursor-pointer"
                          title="Neue Wendeplatte für diesen Halter anlegen"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Wendeplatte</span>
                        </button>
                      </div>

                      {/* Inserts associated with this holder */}
                      <div className="space-y-1.5 pl-2">
                        {group.tools.map((tool) => (
                          <div
                            key={tool.id}
                            onClick={() => {
                              if (onSelectActiveTool && tool.isOwned) {
                                haptics.select();
                                onSelectActiveTool(tool);
                                onClose();
                              }
                            }}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                              tool.isOwned
                                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                                : 'bg-slate-100/60 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                                  💎 {tool.insertDesignation}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  rε={tool.cornerRadiusMm}mm
                                </span>
                                {tool.isAluminumPolished && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                    Alu-Politur
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {tool.name} · ISO: {tool.suitableIsoClasses.join(', ')}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditForm(tool);
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Wendeplatte bearbeiten"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteTool(tool.id, e)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Löschen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {toolsByHolder.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Keine Halter für diese Auswahl gefunden.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredTools.map((tool) => (
                    <div
                      key={tool.id}
                      onClick={() => {
                        if (onSelectActiveTool && tool.isOwned) {
                          haptics.select();
                          onSelectActiveTool(tool);
                          onClose();
                        }
                      }}
                      className={`pt-2.5 first:pt-0 p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 group ${
                        tool.isOwned
                          ? 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer'
                          : 'border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
                      }`}
                    >
                      <div className="min-w-0">
                        {/* Status Badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {tool.isOwned ? (
                            <button
                              onClick={(e) => handleToggleOwnership(tool.id, e)}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 hover:bg-emerald-200 transition-colors"
                              title="Tippen zum Ändern"
                            >
                              <Check className="w-3 h-3" />
                              <span>In Werkstatt</span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleToggleOwnership(tool.id, e)}
                              className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold flex items-center gap-1 shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
                              title="In meine Werkstatt übernehmen"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Ich habe dieses Werkzeug</span>
                            </button>
                          )}

                          {tool.inToolPost && tool.isOwned && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                              Im Multifix
                            </span>
                          )}
                          {tool.isAluminumPolished && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-medium">
                              Alu-Politur
                            </span>
                          )}
                        </div>

                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {tool.name}
                        </div>

                        {/* Distinct Holder & Insert Specs */}
                        <div className="flex items-center gap-2 mt-1 text-xs font-mono text-slate-700 dark:text-slate-300 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                            🔩 Halter: <strong>{tool.holderDesignation}</strong>
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                            💎 Platte: <strong>{tool.insertDesignation}</strong>
                          </span>
                        </div>

                        {/* Technical Specs Strip */}
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 flex-wrap">
                          <span>rε={tool.cornerRadiusMm}mm</span>
                          <span>·</span>
                          <span>Schaft {tool.shankSize}</span>
                          <span>·</span>
                          <span>ISO: {tool.suitableIsoClasses.join(', ')}</span>
                        </div>

                        {tool.notes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {tool.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        <button
                          onClick={(e) => handleAddInsertForHolder(tool, e)}
                          className="px-2 py-1 text-[11px] rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-900 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Weitere Wendeplatte für diesen Halter anlegen"
                        >
                          <Plus className="w-3 h-3" />
                          <span className="hidden sm:inline">Platte</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditForm(tool);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Bearbeiten"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteTool(tool.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredTools.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Keine Werkzeuge für diese Auswahl gefunden.
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Reset Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {ownedCount} im Bestand / {unownedCount} Vorschläge
                </span>
                <button
                  onClick={handleResetDefaults}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer font-medium"
                  title="Auf Werkstatt-Standard zurücksetzen"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Katalog zurücksetzen</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
