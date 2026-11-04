import React, { useState, useRef } from 'react';
import { Download, Upload, X, Check, AlertCircle, Database, FileText, Wrench, Layers, Bookmark } from 'lucide-react';
import { WorkshopTool, Material, LatheGearConfig, SavedJob } from '../types/machining';
import { haptics } from '../utils/haptics';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: WorkshopTool[];
  customMaterials: Material[];
  lathes: LatheGearConfig[];
  savedJobs: SavedJob[];
  activeLathe: LatheGearConfig;
  onImportData: (data: {
    tools?: WorkshopTool[];
    customMaterials?: Material[];
    lathes?: LatheGearConfig[];
    savedJobs?: SavedJob[];
  }, mode: 'merge' | 'replace') => void;
  showToast: (msg: string) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  tools,
  customMaterials,
  lathes,
  savedJobs,
  activeLathe,
  onImportData,
  showToast,
}) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    haptics.select();
    const backupPayload = {
      appName: 'ToolSpeed',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        tools,
        customMaterials,
        lathes,
        savedJobs,
        activeLatheId: activeLathe.id,
      },
    };

    const jsonString = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `toolspeed_backup_${dateStr}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Backup "${filename}" erfolgreich heruntergeladen!`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setParseError(null);
    setParsedData(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const json = JSON.parse(text);

        // Support both wrapped schema { data: { tools: ... } } and direct format { tools: ... }
        const payload = json.data ? json.data : json;

        if (!payload.tools && !payload.customMaterials && !payload.savedJobs && !payload.lathes) {
          throw new Error('Die Datei enthält keine gültigen ToolSpeed-Daten.');
        }

        setParsedData(payload);
        haptics.select();
      } catch (err: any) {
        console.error('Import parse error:', err);
        setParseError(err.message || 'Die JSON-Datei konnte nicht gelesen werden.');
        setParsedData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleTriggerImport = (mode: 'merge' | 'replace') => {
    if (!parsedData) return;
    haptics.select();

    onImportData(parsedData, mode);
    showToast(
      mode === 'merge'
        ? 'Daten erfolgreich zusammengeführt!'
        : 'Datenbank erfolgreich wiederhergestellt!'
    );

    // Reset and close
    setImportFile(null);
    setParsedData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg max-h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250">
        {/* Grab affordance */}
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daten Sichern &amp; Importieren
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lokal, ohne Anmeldung &ndash; 100% deine Daten
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Section 1: Export Local Database */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Lokale Datenbank exportieren (Backup)</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Sichere deinen aktuellen Bestand als JSON-Datei auf deinem Computer oder Smartphone.
                </p>
              </div>
            </div>

            {/* Current Summary Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 block">
                  {tools.length}
                </span>
                <span className="text-[10px] text-slate-500">Werkzeuge</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 block">
                  {customMaterials.length}
                </span>
                <span className="text-[10px] text-slate-500">Eigene Werkstoffe</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                  {savedJobs.length}
                </span>
                <span className="text-[10px] text-slate-500">Merkzettel-Jobs</span>
              </div>
              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 block">
                  {lathes.length}
                </span>
                <span className="text-[10px] text-slate-500">Drehbänke</span>
              </div>
            </div>

            <button
              onClick={handleExport}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Backup-Datei herunterladen (.json)</span>
            </button>
          </div>

          {/* Section 2: Import Backup File */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Backup-Datei importieren</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Lade eine zuvor exportierte ToolSpeed-JSON-Datei hoch.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-1 text-xs text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <FileText className="w-5 h-5 text-slate-400" />
              <span className="font-semibold">
                {importFile ? importFile.name : 'JSON-Datei auswählen oder hierher ziehen'}
              </span>
              <span className="text-[11px] text-slate-400">
                Unterstützt alle ToolSpeed Backups
              </span>
            </button>

            {parseError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Parsed summary preview */}
            {parsedData && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Backup-Inhalt erfolgreich analysiert:</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-mono">
                  <div>• {parsedData.tools?.length || 0} Werkzeuge</div>
                  <div>• {parsedData.customMaterials?.length || 0} Eigene Werkstoffe</div>
                  <div>• {parsedData.savedJobs?.length || 0} Merkzettel-Jobs</div>
                  <div>• {parsedData.lathes?.length || 0} Drehbänke</div>
                </div>

                {/* Import Mode Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleTriggerImport('merge')}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Zusammenführen (Merge)</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Achtung: Dies überschreibt deine bestehenden lokalen Werkzeuge und Einstellungen mit den Daten aus der Datei. Fortfahren?')) {
                        handleTriggerImport('replace');
                      }
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Komplett Ersetzen</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
