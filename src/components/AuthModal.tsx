import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  auth,
} from '../lib/firebase';
import { User, LogIn, UserPlus, KeyRound, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { haptics } from '../utils/haptics';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any | null;
  onSignOut: () => void;
  onSuccessToast: (msg: string) => void;
}

type AuthMode = 'login' | 'register' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignOut,
  onSuccessToast,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const getGermanErrorMessage = (errCode: string): string => {
    switch (errCode) {
      case 'auth/invalid-email':
        return 'Ungültige E-Mail-Adresse.';
      case 'auth/user-disabled':
        return 'Dieses Benutzerkonto wurde deaktiviert.';
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'E-Mail oder Passwort falsch.';
      case 'auth/wrong-password':
        return 'Falsches Passwort.';
      case 'auth/email-already-in-use':
        return 'Diese E-Mail-Adresse wird bereits verwendet.';
      case 'auth/weak-password':
        return 'Das Passwort ist zu schwach (mindestens 6 Zeichen erforderlich).';
      default:
        return 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    haptics.select();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        onSuccessToast('Erfolgreich angemeldet!');
        onClose();
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          setErrorMsg('Die Passwörter stimmen nicht überein.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Das Passwort muss mindestens 6 Zeichen lang sein.');
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
        onSuccessToast('Konto erfolgreich erstellt!');
        onClose();
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email);
        setResetSent(true);
        onSuccessToast('E-Mail zum Zurücksetzen gesendet.');
      }
    } catch (err: any) {
      console.error(err);
      const code = err?.code || '';
      setErrorMsg(getGermanErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {currentUser ? 'Mein Benutzerkonto' : 'Benutzeranmeldung'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser ? currentUser.email : 'Cloud-Synchronisation für Werkzeuge & Merkzettel'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {currentUser ? (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-700 dark:text-emerald-400 text-sm font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Angemeldet als <strong>{currentUser.email}</strong></span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ihre Werkzeuge, Maschinen und Merkzettel-Einträge werden automatisch mit Ihrem Cloud-Konto synchronisiert.
              </p>
              <button
                onClick={() => {
                  haptics.tick();
                  onSignOut();
                  onClose();
                }}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm transition-colors shadow-lg shadow-rose-600/20"
              >
                Abmelden
              </button>
            </div>
          ) : (
            <>
              {/* Tab Selector */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    haptics.tick();
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className={`py-2 rounded-xl transition-all ${
                    mode === 'login'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Anmelden
                </button>
                <button
                  type="button"
                  onClick={() => {
                    haptics.tick();
                    setMode('register');
                    setErrorMsg(null);
                  }}
                  className={`py-2 rounded-xl transition-all ${
                    mode === 'register'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Registrieren
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {mode === 'reset' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      E-Mail-Adresse
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@beispiel.de"
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {resetSent ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs text-center font-medium">
                      E-Mail gesendet! Bitte überprüfen Sie Ihren Posteingang.
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                      {loading ? 'Senden...' : 'Passwort-Zurücksetzen anfordern'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full text-center text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Zurück zur Anmeldung
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      E-Mail-Adresse
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@beispiel.de"
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Passwort
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('reset');
                            setErrorMsg(null);
                          }}
                          className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Passwort vergessen?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {mode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Passwort wiederholen
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Lädt...</span>
                    ) : mode === 'login' ? (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Anmelden</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Konto erstellen</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer / Guest Mode */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800/80 text-center">
          <button
            onClick={() => {
              haptics.tick();
              onClose();
            }}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Als Gast ohne Konto fortfahren
          </button>
        </div>
      </div>
    </div>
  );
};
