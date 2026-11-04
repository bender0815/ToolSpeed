import React from 'react';
import { SavedJob } from '../types/machining';
import { haptics } from '../utils/haptics';
import { Bookmark, Trash2, ArrowUpRight, FolderOpen } from 'lucide-react';

interface SavedJobsModalProps {
  savedJobs: SavedJob[];
  onLoadJob: (job: SavedJob) => void;
  onDeleteJob: (id: string) => void;
  onClearAll: () => void;
}

export const SavedJobsModal: React.FC<SavedJobsModalProps> = ({
  savedJobs,
  onLoadJob,
  onDeleteJob,
  onClearAll,
}) => {
  return (
    <div className="space-y-4 pb-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Werkstatt-Merkzettel
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gespeicherte Schnittdaten für deine Bauteile
          </p>
        </div>
        {savedJobs.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Alle gespeicherten Jobs löschen?')) {
                onClearAll();
              }
            }}
            className="text-xs text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
          >
            Alle leeren
          </button>
        )}
      </div>

      {/* List */}
      {savedJobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800">
          <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Noch keine Schnittdaten gespeichert
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Tippe im Drehen-Rechner oben rechts auf &quot;Merken&quot;, um deine aktuellen Einstellungen für später zu sichern.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {savedJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => {
                haptics.select();
                onLoadJob(job);
              }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {job.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    {job.operation === 'roughing'
                      ? 'Schruppen'
                      : job.operation === 'finishing'
                      ? 'Schlichten'
                      : 'Abstechen'}
                  </span>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {job.materialName} · {job.toolType === 'carbide' ? 'HM' : 'HSS'}
                </div>

                <div className="flex items-center gap-3 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mt-2">
                  <span className="text-blue-600 dark:text-blue-400">
                    {job.rpm} min⁻¹
                  </span>
                  <span>f: {job.feedRate} mm/U</span>
                  <span>ap: {job.depthOfCut} mm</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    haptics.tick();
                    onDeleteJob(job.id);
                  }}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
