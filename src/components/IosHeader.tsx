import { Settings, Sun, Moon, Volume2, VolumeX, ShieldAlert, User, Database } from 'lucide-react';
import { LatheGearConfig } from '../types/machining';

interface IosHeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  activeLathe: LatheGearConfig;
  hasWarning?: boolean;
  currentUser: any | null;
  onOpenAuthModal: () => void;
  onOpenBackupModal: () => void;
}

export const IosHeader: React.FC<IosHeaderProps> = ({
  darkMode,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  activeLathe,
  hasWarning,
  currentUser,
  onOpenAuthModal,
  onOpenBackupModal,
}) => {
  return (
    <header className="sticky top-0 z-30 pt-safe px-4 pb-2.5 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 text-slate-100 transition-colors">
      <div className="flex items-center justify-between h-12">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 font-bold text-white tracking-wider text-sm">
            TS
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-none">
              ToolSpeed
            </h1>
            <button
              onClick={onOpenSettings}
              className="text-[11px] text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 mt-0.5"
              title="Maschinen-Getriebestufe ändern"
            >
              <span className="truncate max-w-[110px] sm:max-w-[200px]">
                {activeLathe.name}
              </span>
              <span className="text-[9px] text-blue-400">▾</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {hasWarning && (
            <div
              className="p-2 text-amber-400 flex items-center justify-center animate-pulse"
              title="Sicherheitshinweis aktiv"
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
          )}

          {/* User / Auth Toggle */}
          <button
            onClick={onOpenAuthModal}
            className="h-9 px-2.5 rounded-full flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-200 active:scale-95 transition-all border border-slate-700/60"
            title={currentUser ? `Angemeldet als ${currentUser.email}` : 'Anmelden oder Gastmodus'}
          >
            <div className="relative">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span
                className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border border-slate-900 ${
                  currentUser ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              />
            </div>
            <span className="font-semibold text-[11px] hidden xs:inline max-w-[80px] truncate">
              {currentUser ? currentUser.email.split('@')[0] : 'Gast'}
            </span>
          </button>

          {/* Backup / Export / Import */}
          <button
            onClick={onOpenBackupModal}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 active:scale-95 transition-all"
            aria-label="Lokale Daten sichern & importieren"
            title="Lokale Daten exportieren / importieren (ohne Anmeldung)"
          >
            <Database className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 active:scale-95 transition-all"
            aria-label={soundEnabled ? 'Klick-Töne stummschalten' : 'Klick-Töne einschalten'}
            title={soundEnabled ? 'Klick-Töne an' : 'Klick-Töne aus'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-blue-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 active:scale-95 transition-all"
            aria-label="Design-Modus wechseln"
            title={darkMode ? 'Heller Modus' : 'Dunkler Werkstatt-Modus'}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-300" />
            )}
          </button>

          {/* Lathe Settings */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/80 active:scale-95 transition-all"
            aria-label="Drehbank-Einstellungen öffnen"
            title="Drehbank konfigurieren"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
