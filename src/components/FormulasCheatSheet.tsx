import React from 'react';
import { BookOpen, HelpCircle, Palette } from 'lucide-react';

export const FormulasCheatSheet: React.FC = () => {
  return (
    <div className="space-y-4 pb-4 animate-in fade-in duration-200">
      {/* Title Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Formelsammlung &amp; Tabellenbuch
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Zerspanungs-Grundlagen nach DIN / ISO für die Werkstattpraxis.
        </p>
      </div>

      {/* Workshop vs CNC Reality Check Card */}
      <div className="bg-blue-50/80 dark:bg-blue-950/40 rounded-3xl p-5 border border-blue-200 dark:border-blue-900/60 text-slate-800 dark:text-slate-200">
        <h3 className="text-sm font-bold text-blue-950 dark:text-blue-300 flex items-center gap-2 mb-2">
          <span>Drehzahl-Check: Werkstattbank vs. Industrie-CNC</span>
        </h3>
        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 mb-2">
          Häufige Verwirrung in der Werkstatt: <strong>Warum erscheinen Katalog-Drehzahlen oft viel zu hoch?</strong>
        </p>
        <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
          <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-blue-100 dark:border-blue-950">
            <strong>1. Industrie-Katalogwerte (CNC):</strong> Moderne Wendeplatten-Hersteller (Sandvik, Iscar, Walter) drucken Richtwerte für gekapselte CNC-Zentren mit massiven Gussbetten und 20–80 bar Flutkühlung ab (z.B. Baustahl vc = 220–280 m/min, Alu 600+ m/min). Bei Ø25mm ergäbe das rechnerisch über 3000 bis 7000 U/min!
          </div>
          <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-blue-100 dark:border-blue-950">
            <strong>2. Konventionelle Werkstatt-Realität:</strong> An manuellen Drehbänken (z.B. Weiler, Optimum, Bernardo) arbeitet man mit bewährten Werkstatt-Schnittgeschwindigkeiten (Baustahl vc ≈ 80–120 m/min, Alu vc ≈ 180–260 m/min). Bei Ø25mm ergibt das angenehm ruhige, sichere 1100–1400 U/min.
          </div>
          <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-blue-100 dark:border-blue-950">
            <strong>3. Futter-Fliehkraft beachten:</strong> An 3-Backenfuttern nimmt die Spannkraft durch die Fliehkraft der Backen bei hohen Drehzahlen drastisch ab! Deshalb haben Werkstatt-Futter oft ein oberes Drehzahllimit von 1800–2500 U/min.
          </div>
        </div>
      </div>

      {/* ISO Colors ISO 513 */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-purple-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            DIN ISO 513 Farbkennzeichnung für Wendeplatten
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                P
              </span>
              <span className="font-bold text-xs text-blue-950 dark:text-blue-200">Blau: Stahl</span>
            </div>
            <div className="text-[11px] text-blue-800/80 dark:text-blue-300/80 mt-1">
              Unlegierte &amp; legierte Baustähle, Vergütungsstähle
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                M
              </span>
              <span className="font-bold text-xs text-amber-950 dark:text-amber-200">Gelb: Edelstahl</span>
            </div>
            <div className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-1">
              Rostfreier austenitischer Stahl (V2A, V4A)
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                K
              </span>
              <span className="font-bold text-xs text-rose-950 dark:text-rose-200">Rot: Gusseisen</span>
            </div>
            <div className="text-[11px] text-rose-800/80 dark:text-rose-300/80 mt-1">
              Grauguss (GJL), Sphäroguss (GJS) – Trocken!
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                N
              </span>
              <span className="font-bold text-xs text-emerald-950 dark:text-emerald-200">Grün: NE-Metalle</span>
            </div>
            <div className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-1">
              Alu, Messing, Bronze, Kupfer &amp; Kunststoffe
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-orange-600 text-white font-bold text-xs flex items-center justify-center">
                S
              </span>
              <span className="font-bold text-xs text-orange-950 dark:text-orange-200">Orange: Sonderleg.</span>
            </div>
            <div className="text-[11px] text-orange-800/80 dark:text-orange-300/80 mt-1">
              Titan, Inconel, hochwarmfeste Legierungen
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-700 text-white font-bold text-xs flex items-center justify-center">
                H
              </span>
              <span className="font-bold text-xs text-slate-900 dark:text-white">Grau: Hartstoffe</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              Gehärteter Stahl (&gt; 45 HRC), Hartguss
            </div>
          </div>
        </div>
      </div>

      {/* Formulas Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Wichtige Formeln
        </h3>

        <div className="space-y-3">
          {/* RPM Formula */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white mb-1">
              <span>Drehzahl (n)</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">in min⁻¹ (U/min)</span>
            </div>
            <div className="font-mono text-sm bg-white dark:bg-slate-900 p-2 rounded-xl text-center border border-slate-200 dark:border-slate-800 font-bold">
              n = (vc · 1000) / (π · d)
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              vc = Schnittgeschwindigkeit [m/min], d = Durchmesser [mm]
            </div>
          </div>

          {/* Cutting Speed Formula */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white mb-1">
              <span>Schnittgeschwindigkeit (vc)</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">in m/min</span>
            </div>
            <div className="font-mono text-sm bg-white dark:bg-slate-900 p-2 rounded-xl text-center border border-slate-200 dark:border-slate-800 font-bold">
              vc = (π · d · n) / 1000
            </div>
          </div>

          {/* Feed Velocity */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white mb-1">
              <span>Vorschubgeschwindigkeit (vf)</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">in mm/min</span>
            </div>
            <div className="font-mono text-sm bg-white dark:bg-slate-900 p-2 rounded-xl text-center border border-slate-200 dark:border-slate-800 font-bold">
              vf = n · f
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              f = Vorschub je Umdrehung [mm/U]
            </div>
          </div>

          {/* Surface Finish Roughness */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white mb-1">
              <span>Theoretische Rauhtiefe (Rz)</span>
              <span className="text-purple-600 dark:text-purple-400 font-mono">in µm</span>
            </div>
            <div className="font-mono text-sm bg-white dark:bg-slate-900 p-2 rounded-xl text-center border border-slate-200 dark:border-slate-800 font-bold">
              Rz ≈ (f² / (8 · rε)) · 1000
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              rε = Eckenradius der Wendeplatte (üblich: 0.4 oder 0.8 mm)
            </div>
          </div>
        </div>
      </div>

      {/* Troubleshooting in the Workshop */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Fehlerbehebung in der Werkstatt
          </h3>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
            <strong className="text-rose-500 block">Problem: Rattermarken &amp; Vibrationen</strong>
            <p className="text-slate-600 dark:text-slate-300 mt-0.5">
              • Auskraglänge des Drehstahls so kurz wie möglich wählen.
              <br />• Werkstück mit Reitstock/Zentrierspitze abstützen.
              <br />• Spitzenhöhe exakt auf Drehmitte prüfen.
              <br />• Wendeplatte mit kleinerem Eckenradius (z.B. 0.4 statt 0.8mm) verringert Passivkräfte.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
            <strong className="text-amber-500 block">Problem: Aufbauschneide (Material backt fest)</strong>
            <p className="text-slate-600 dark:text-slate-300 mt-0.5">
              • Schnittgeschwindigkeit vc deutlich erhöhen (aus dem Aufbauschneiden-Temperaturbereich herauskommen).
              <br />• Intensive Kühlschmierung oder Schneidöl verwenden.
              <br />• Polierte HM-Wendeplatten mit positiver Geometrie für Alu/Edelstahl wählen.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
            <strong className="text-blue-500 block">Problem: Wickelnde Wirrspäne</strong>
            <p className="text-slate-600 dark:text-slate-300 mt-0.5">
              • Vorschub f leicht erhöhen, um den Span dicker zu machen und Spanbrecher zu aktivieren.
              <br />• Schnitttiefe ap erhöhen, damit der Span in die Mulde der Wendeplatte läuft.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
