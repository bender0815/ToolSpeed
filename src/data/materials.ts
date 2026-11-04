import { Material, MaterialGroup } from '../types/machining';

export const MATERIAL_GROUPS: { id: MaterialGroup; label: string; isoCode: string; color: string }[] = [
  { id: 'plastics', label: 'Kunststoffe (POM, PA, etc.)', isoCode: 'N', color: '#0284c7' },
  { id: 'aluminum', label: 'Aluminium-Legierungen', isoCode: 'N', color: '#16a34a' },
  { id: 'steel', label: 'Stahl / Baustahl', isoCode: 'P', color: '#2563eb' },
  { id: 'stainless', label: 'Edelstahl / Rostfrei', isoCode: 'M', color: '#eab308' },
  { id: 'brass_bronze', label: 'Kupfer / Messing / Bronze', isoCode: 'N', color: '#d97706' },
  { id: 'cast_iron', label: 'Gusseisen / Grauguss', isoCode: 'K', color: '#dc2626' },
  { id: 'special', label: 'Titan / Sonderwerkstoffe', isoCode: 'S', color: '#ea580c' },
];

/**
 * Richtwerte für Schnittgeschwindigkeit vc, Vorschub f und Schnitttiefe ap
 * Kalibriert für konventionelle Werkstatt-Drehbänke (z.B. Weiler, Optimum, Bernardo, Colchester)
 * mit Standard-Wendeplatten (HM) oder HSS-Meißeln ohne extreme Industrie-Hochdruckkühlung.
 *
 * Sortierung:
 * 1. Kunststoffe (POM-C, PA6)
 * 2. Aluminium-Legierungen (Alu 2007, Alu 6060, Alu 7075)
 * 3. Stahl / Baustahl (S235JR, C45, 11SMn30, 42CrMo4, 16MnCr5)
 * 4. Edelstahl / Rostfrei (1.4301 V2A, 1.4571 V4A)
 * 5. Kupfer / Messing / Bronze (Ms58, CuSn8)
 * 6. Gusseisen / Grauguss (GG-25)
 * 7. Titan / Sonderwerkstoffe (Grade 5)
 */
export const MATERIALS: Material[] = [
  // =========================================================================
  // 1. KUNSTSTOFFE
  // =========================================================================
  {
    id: 'pom_c',
    name: 'POM-C (Polyacetal / Delrin)',
    standardCode: 'POM-C Natur / Schwarz',
    shortDesc: 'Der Lieblings-Kunststoff im Maschinenbau: maßhaltig & perfekt spanbar',
    group: 'plastics',
    isoClass: 'N',
    kc1_1: 280,
    hardnessBrinell: '~80 Shore D',
    cooling: 'Druckluft oder trocken',
    notes: 'Sehr scharfe Schneide wählen. Drehzahlen bei 150–220 m/min halten, um Überhitzung/Schmelzen zu vermeiden.',
    params: {
      carbide: {
        roughing: {
          vc: { min: 130, rec: 180, max: 250 },
          f: { min: 0.18, rec: 0.28, max: 0.42 },
          ap: { min: 1.2, rec: 2.2, max: 4.5 },
        },
        finishing: {
          vc: { min: 180, rec: 250, max: 350 },
          f: { min: 0.06, rec: 0.11, max: 0.16 },
          ap: { min: 0.25, rec: 0.6, max: 1.5 },
        },
        parting: {
          vc: { min: 100, rec: 150, max: 200 },
          f: { min: 0.06, rec: 0.10, max: 0.15 },
          ap: { min: 1.8, rec: 2.5, max: 3.5 },
        },
      },
      hss: {
        roughing: {
          vc: { min: 50, rec: 80, max: 120 },
          f: { min: 0.14, rec: 0.22, max: 0.32 },
          ap: { min: 1.0, rec: 1.8, max: 2.8 },
        },
        finishing: {
          vc: { min: 70, rec: 110, max: 150 },
          f: { min: 0.05, rec: 0.08, max: 0.12 },
          ap: { min: 0.2, rec: 0.4, max: 0.8 },
        },
        parting: {
          vc: { min: 40, rec: 65, max: 90 },
          f: { min: 0.04, rec: 0.07, max: 0.10 },
          ap: { min: 1.2, rec: 2.0, max: 2.6 },
        },
      },
    },
  },
  {
    id: 'pa6',
    name: 'PA6 (Polyamid / Nylon)',
    standardCode: 'PA 6 Natur / Guß-PA',
    shortDesc: 'Zäher, abriebfester Konstruktionskunststoff für Buchsen & Rollen',
    group: 'plastics',
    isoClass: 'N',
    kc1_1: 320,
    hardnessBrinell: '~75 Shore D',
    cooling: 'Druckluft oder Emulsion (Hitze führt zum Schmelzen)',
    notes: 'Zähe Fließspäne wickeln gerne um das Werkstück. Scharfe Schneide mit großem Spanwinkel nutzen.',
    params: {
      carbide: {
        roughing: {
          vc: { min: 110, rec: 160, max: 220 },
          f: { min: 0.15, rec: 0.24, max: 0.36 },
          ap: { min: 1.0, rec: 2.0, max: 4.0 },
        },
        finishing: {
          vc: { min: 150, rec: 220, max: 300 },
          f: { min: 0.05, rec: 0.09, max: 0.14 },
          ap: { min: 0.2, rec: 0.5, max: 1.2 },
        },
        parting: {
          vc: { min: 80, rec: 120, max: 160 },
          f: { min: 0.05, rec: 0.08, max: 0.12 },
          ap: { min: 1.5, rec: 2.2, max: 3.0 },
        },
      },
      hss: {
        roughing: {
          vc: { min: 40, rec: 65, max: 95 },
          f: { min: 0.12, rec: 0.18, max: 0.26 },
          ap: { min: 0.8, rec: 1.5, max: 2.2 },
        },
        finishing: {
          vc: { min: 55, rec: 85, max: 125 },
          f: { min: 0.04, rec: 0.07, max: 0.10 },
          ap: { min: 0.15, rec: 0.3, max: 0.6 },
        },
        parting: {
          vc: { min: 30, rec: 50, max: 70 },
          f: { min: 0.03, rec: 0.05, max: 0.08 },
          ap: { min: 1.2, rec: 1.8, max: 2.2 },
        },
      },
    },
  },

  // =========================================================================
  // 2. ALUMINIUM-LEGIERUNGEN
  // =========================================================================
  {
    id: 'al_2007',
    name: 'Automaten-Alu (AlCuMgPb / EN AW-2007)',
    standardCode: '3.1645 / EN AW-2007',
    shortDesc: 'Bester Spanbruch aller Aluminiumlegierungen für Drehteile',
    group: 'aluminum',
    isoClass: 'N',
    kc1_1: 700,
    hardnessBrinell: '~100-120 HB',
    cooling: 'Emulsion, Spiritus oder trocken',
    notes: 'Auf manuellen Werkstattbänken sind 200–260 m/min angenehm handhabbar (ergibt ca. 1600–2200 U/min bei Ø35mm). Auf CNC sind 600+ m/min üblich.',
    params: {
      carbide: {
        roughing: {
          vc: { min: 160, rec: 220, max: 300 },
          f: { min: 0.18, rec: 0.28, max: 0.40 },
          ap: { min: 1.5, rec: 2.5, max: 4.5 },
        },
        finishing: {
          vc: { min: 220, rec: 300, max: 420 },
          f: { min: 0.06, rec: 0.11, max: 0.16 },
          ap: { min: 0.25, rec: 0.5, max: 1.2 },
        },
        parting: {
          vc: { min: 120, rec: 170, max: 240 },
          f: { min: 0.06, rec: 0.09, max: 0.14 },
          ap: { min: 1.8, rec: 2.5, max: 3.5 },
        },
      },
      hss: {
        roughing: {
          vc: { min: 50, rec: 75, max: 105 },
          f: { min: 0.12, rec: 0.20, max: 0.28 },
          ap: { min: 1.0, rec: 1.8, max: 2.8 },
        },
        finishing: {
          vc: { min: 65, rec: 95, max: 135 },
          f: { min: 0.05, rec: 0.08, max: 0.12 },
          ap: { min: 0.2, rec: 0.4, max: 0.8 },
        },
        parting: {
          vc: { min: 40, rec: 60, max: 85 },
          f: { min: 0.04, rec: 0.06, max: 0.09 },
          ap: { min: 1.5, rec: 2.0, max: 2.5 },
        },
      },
    },
  },
  {
    id: 'al_6060',
    name: 'Konstruktions-Alu (AlMgSi0.5 / EN AW-6060)',
    standardCode: '3.3206 / EN AW-6060',
    shortDesc: 'Sehr gängig (Profile, Rohre), weich & schmierend',
    group: 'aluminum',
    isoClass: 'N',
    kc1_1: 750,
    hardnessBrinell: '~65-75 HB',
    cooling: 'Schmierung zwingend (Spiritus, Emulsion, WD-40)',
    notes: 'Neigt zum Festkleben an der Schneide. Scharfe Aluschneide und ausreichend Drehzahl wählen.',
    params: {
      carbide: {
        roughing: {
          vc: { min: 140, rec: 190, max: 260 },
          f: { min: 0.15, rec: 0.24, max: 0.35 },
          ap: { min: 1.2, rec: 2.0, max: 3.5 },
        },
        finishing: {
          vc: { min: 180, rec: 250, max: 350 },
          f: { min: 0.05, rec: 0.09, max: 0.13 },
          ap: { min: 0.2, rec: 0.4, max: 0.9 },
        },
        parting: {
          vc: { min: 100, rec: 140, max: 190 },
          f: { min: 0.05, rec: 0.08, max: 0.11 },
          ap: { min: 1.5, rec: 2.2, max: 3.0 },
        },
      },
      hss: {
        roughing: {
          vc: { min: 40, rec: 65, max: 90 },
          f: { min: 0.10, rec: 0.16, max: 0.22 },
          ap: { min: 0.8, rec: 1.4, max: 2.2 },
        },
        finishing: {
          vc: { min: 55, rec: 80, max: 110 },
          f: { min: 0.04, rec: 0.07, max: 0.10 },
          ap: { min: 0.15, rec: 0.3, max: 0.6 },
        },
        parting: {
          vc: { min: 30, rec: 50, max: 70 },
          f: { min: 0.03, rec: 0.05, max: 0.08 },
          ap: { min: 1.2, rec: 1.8, max: 2.2 },
        },
      },
    },
  },
  {
    id: 'al_7075',
    name: 'Flugzeug-Alu (AlZnMgCu1.5 / EN AW-7075)',
    standardCode: '3.4365 / EN AW-7075',
    shortDesc: 'Hochfestes Konstruktions-Aluminium (stahlharte Festigkeit)',
    group: 'aluminum',
    isoClass: 'N',
    kc1_1: 1050,
    hardnessBrinell: '~150 HB',
    cooling: 'Emulsion empfohlen',
    notes: 'Spanbildung ähnlich wie Stahl, splittert nicht, schmiert kaum.',
    params: {
      carbide: {
        roughing: {
          vc: { min: 130, rec: 180, max: 240 },
          f: { min: 0.15, rec: 0.24, max: 0.35 },
          ap: { min: 1.2, rec: 2.0, max: 3.5 },
        },
        finishing: {
          vc: { min: 180, rec: 240, max: 320 },
          f: { min: 0.05, rec: 0.09, max: 0.14 },
          ap: { min: 0.2, rec: 0.45, max: 1.0 },
        },
        parting: {
          vc: { min: 90, rec: 130, max: 170 },
          f: { min: 0.045, rec: 0.07, max: 0.10 },
          ap: { min: 1.5, rec: 2.2, max: 2.8 },
        },
      },
      hss: {
        roughing: {
          vc: { min: 35, rec: 55, max: 75 },
          f: { min: 0.10, rec: 0.15, max: 0.22 },
          ap: { min: 0.8, rec: 1.4, max: 2.0 },
        },
        finishing: {
          vc: { min: 45, rec: 70, max: 95 },
          f: { min: 0.04, rec: 0.065, max: 0.09 },
          ap: { min: 0.15, rec: 0.3, max: 0.6 },
        },
        parting: {
          vc: { min: 25, rec: 40, max: 55 },
          f: { min: 0.03, rec: 0.045, max: 0.07 },
          ap: { min: 1.2, rec: 1.8, max: 2.2 },
        },
      },
    },
  },

  // =========================================================================
  // 3. STAHL / BAUSTAHL
  // =========================================================================
  {
    id: 's235jr',
    name: 'Baustahl (S235JR / St37-2)',
    standardCode: '1.0038 / S235JR',
    shortDesc: 'Universeller, unlegierter Baustahl für Schweiß- & Drehteile',
    group: 'steel',
    isoClass: 'P',
    kc1_1: 1780,
    hardnessBrinell: '~130 HB',
    cooling: 'Emulsion empfohlen (Trocken mit HM möglich)',
    notes: 'Auf manuellen Werkstattbänken bewährt sich vc ≈ 90–120 m/min für vibrationsfreies Drehen. Bei zu geringer Drehzahl neigt Baustahl zur Aufbauschneide.',
    params: {
      carbide: {
        roughing: {
          vc: { min: 80, rec: 105, max: 140 },
          f: { min: 0.18, rec: 0.25, max: 0.35 },
          ap: { min: 1.0, rec: 2.0, max: 3.5 },
        },
        finishing: {
          vc: { min: 110, rec: 140, max: 180 },
          f: { min: 0.06, rec: 0.10, max: 0.15 },
          ap: { min: 0.25, rec: 0.5, max: 1.0 },
        },
        parting: {
          vc: { min: 60, rec: 85, max: 110 },
          f: { min: 0.05, rec: 0.08, max: 0.12 },
          ap: { min: 1.5, rec: 2.5, max: 3.0 },
        },
      },
      hss: {
        roughing: {
          vc: { min: 18, rec: 24, max: 30 },
          f: { min: 0.12, rec: 0.18, max: 0.25 },
          ap: { min: 0.8, rec: 1.5, max: 2.2 },
        },
        finishing: {
          vc: { min: 22, rec: 28, max: 36 },
          f: { min: 0.05, rec: 0.08, max: 0.12 },
          ap: { min: 0.2, rec: 0.35, max: 0.6 },
        },
        parting: {
          vc: { min: 14, rec: 18, max: 22 },
          f: { min: 0.03, rec: 0.05, max: 0.07 },
          ap: { min: 1.2, rec: 2.0, max: 2.5 },
        },
      },
    },
  },
  {
    id: 'c45e',
    name: 'Vergütungsstahl (C45 / C45E)',
    standardCode: '1.0503 / C45',
    shortDesc: 'Maschinenbaustahl für Bolzen, Achsen, Wellen & Hebel',
    group: 'steel',
    isoClass: 'P',
    kc1_1: 2100,
    hardnessBrinell: '~200 HB',
    cooling: 'Emulsion empfohlen',
    notes: 'Zäher Werkstoff. Für Werkstattbänke sind 85–110 m/min ideal, um Motor und Schneide nicht zu überhitzen.',
    params: {
      carbide: {
        roughing: {
          vc: { min: 70, rec: 90, max: 120 },
          f: { min: 0.15, rec: 0.22, max: 0.32 },
          ap: { min: 1.0, rec: 1.8, max: 3.0 },
        },
        finishing: {
          vc: { min: 95, rec: 125, max: 150 },
          f: { min: 0.05, rec: 0.09, max: 0.13 },
          ap: { min: 0.2, rec: 0.4, max: 0.8 },
        },
        parting: {
          vc: { min: 55, rec: 75, max: 95 },
          f: { min: 0.04, rec: 0.07, max: 0.10 },
          ap: { min: 1.5, rec: 2.2, max: 2.8 },
        },
      },
      hss: {
        roughing: {
          vc: { min: 15, rec: 20, max: 25 },
          f: { min: 0.10, rec: 0.15, max: 0.20 },
          ap: { min: 0.6, rec: 1.2, max: 1.8 },
        },
        finishing: {
          vc: { min: 18, rec: 24, max: 30 },
          f: { min: 0.04, rec: 0.07, max: 0.10 },
          ap: { min: 0.15, rec: 0.3, max: 0.5 },
        },
        parting: {
          vc: { min: 11, rec: 15, max: 18 },
          f: { min: 0.03, rec: 0.045, max: 0.06 },
          ap: { min: 1.2, rec: 1.8, max: 2.2 },
        },
      },
    },
  },
  {
    id: '11smn30',
    name: 'Automatenstahl (11SMn30 / 11SMnPb30)',
    standardCode: '1.0715 / 11SMn30',
    shortDesc: 'Ausgezeichnet zerspanbar mit perfekten kurzen Bröckelspänen',
    group: 'steel',
    isoClass: 'P',
    kc1_1: 1550,
    hardnessBrinell: '~160 HB',
    cooling: 'Emulsion oder trocken',
    notes: 'Der unkomplizierteste Stahl an der Drehbank. Brechende Späne, sehr sauberes Schnittbild schon ab vc = 100 m/min.',
    params: {
      carbide: {
        roughing: {
          vc: { min: 100, rec: 135, max: 180 },
          f: { min: 0.18, rec: 0.28, max: 0.40 },
          ap: { min: 1.2, rec: 2.2, max: 4.0 },
        },
        finishing: {
          vc: { min: 130, rec: 170, max: 220 },
          f: { min: 0.07, rec: 0.11, max: 0.16 },
          ap: { min: 0.25, rec: 0.5, max: 1.2 },
        },
        parting: {
          vc: { min: 80, rec: 105, max: 135 },
          f: { min: 0.05, rec: 0.08, max: 0.12 },
          ap: { min: 1.8, rec: 2.5, max: 3.0 },
        },
      },
      hss: {
        roughing: {
          vc: { min: 22, rec: 30, max: 38 },
          f: { min: 0.14, rec: 0.20, max: 0.26 },
          ap: { min: 0.8, rec: 1.6, max: 2.5 },
        },
        finishing: {
          vc: { min: 28, rec: 36, max: 45 },
          f: { min: 0.06, rec: 0.09, max: 0.13 },
          ap: { min: 0.2, rec: 0.4, max: 0.7 },
        },
        parting: {
          vc: { min: 16, rec: 22, max: 28 },
          f: { min: 0.035, rec: 0.06, max: 0.08 },
          ap: { min: 1.2, rec: 2.0, max: 2.5 },
        },
      },
    },
  },
  {
    id: '42crmo4',
    name: 'Legierter Vergütungsstahl (42CrMo4)',
    standardCode: '1.7225 / 42CrMo4+QT',
    shortDesc: 'Hochfester Stahl für Kurbelwellen, Ritzel & hochbelastete Teile',
    group: 'steel',
    isoClass: 'P',
    kc1_1: 2450,
    hardnessBrinell: '~280-320 HB',
    cooling: 'Reichlich Emulsion notwendig',
    notes: 'Sehr zäh und fest. Drehzahl bewusst moderat halten (ca. 70–85 m/min), um Werkzeugausbrüche zu vermeiden.',
    params: {
      carbide: {
        roughing: {
          vc: { min: 60, rec: 80, max: 105 },
          f: { min: 0.14, rec: 0.20, max: 0.28 },
          ap: { min: 1.0, rec: 1.6, max: 2.8 },
        },
        finishing: {
          vc: { min: 80, rec: 110, max: 140 },
          f: { min: 0.05, rec: 0.08, max: 0.12 },
          ap: { min: 0.2, rec: 0.4, max: 0.7 },
        },
        parting: {
          vc: { min: 45, rec: 65, max: 85 },
          f: { min: 0.035, rec: 0.055, max: 0.08 },
          ap: { min: 1.5, rec: 2.0, max: 2.5 },
        },
      },
      hss: {
        roughing: {
          vc: { min: 10, rec: 15, max: 18 },
          f: { min: 0.08, rec: 0.12, max: 0.16 },
          ap: { min: 0.6, rec: 1.0, max: 1.5 },
        },
        finishing: {
          vc: { min: 14, rec: 18, max: 22 },
          f: { min: 0.035, rec: 0.055, max: 0.08 },
          ap: { min: 0.15, rec: 0.25, max: 0.4 },
        },
        parting: {
          vc: { min: 8, rec: 12, max: 15 },
          f: { min: 0.02, rec: 0.035, max: 0.05 },
          ap: { min: 1.2, rec: 1.6, max: 2.0 },
        },
      },
    },
  },
  {
    id: '16mncr5',
    name: 'Einsatzstahl (16MnCr5)',
    standardCode: '1.7131 / 16MnCr5',
    shortDesc: 'Klassischer Zahnrad- & Wellenstahl für Härteteile',
    group: 'steel',
    isoClass: 'P',
    kc1_1: 1950,
    hardnessBrinell: '~180 HB',
    cooling: 'Emulsion empfohlen',
    notes: 'Im ungehärteten Zustand gutmütig zu drehen.',
    params: {
      carbide: {
        roughing: {
          vc: { min: 80, rec: 105, max: 135 },
          f: { min: 0.15, rec: 0.22, max: 0.32 },
          ap: { min: 1.0, rec: 1.8, max: 3.0 },
        },
        finishing: {
          vc: { min: 105, rec: 135, max: 170 },
          f: { min: 0.06, rec: 0.09, max: 0.14 },
          ap: { min: 0.2, rec: 0.4, max: 0.8 },
        },
        parting: {
          vc: { min: 60, rec: 85, max: 110 },
          f: { min: 0.04, rec: 0.07, max: 0.10 },
          ap: { min: 1.5, rec: 2.2, max: 2.8 },
        },
      },
      hss: {
        roughing: {
          vc: { min: 16, rec: 22, max: 28 },
          f: { min: 0.10, rec: 0.15, max: 0.20 },
          ap: { min: 0.6, rec: 1.2, max: 1.8 },
        },
        finishing: {
          vc: { min: 20, rec: 26, max: 32 },
          f: { min: 0.04, rec: 0.07, max: 0.10 },
          ap: { min: 0.15, rec: 0.3, max: 0.5 },
        },
        parting: {
          vc: { min: 12, rec: 16, max: 20 },
          f: { min: 0.025, rec: 0.045, max: 0.06 },
          ap: { min: 1.2, rec: 1.8, max: 2.2 },
        },
      },
    },
  },

  // =========================================================================
  // 4. EDELSTAHL / ROSTFREI
  // =========================================================================
  {
    id: '14301_v2a',
    name: 'Edelstahl V2A (1.4301 / X5CrNi18-10)',
    standardCode: '1.4301 / AISI 304',
    shortDesc: 'Austenitischer korrosionsbeständiger Edelstahl',
    group: 'stainless',
    isoClass: 'M',
    kc1_1: 2300,
    hardnessBrinell: '~180-200 HB',
    cooling: 'Intensive Emulsion / Schneidöl',
    notes: 'Kaltverfestigend! Drehzahl nicht zu hoch wählen (ca. 60–80 m/min), aber stetigen Vorschub halten (nicht reiben lassen!).',
    params: {
      carbide: {
        roughing: {
          vc: { min: 50, rec: 70, max: 95 },
          f: { min: 0.12, rec: 0.18, max: 0.25 },
          ap: { min: 0.8, rec: 1.5, max: 2.5 },
        },
        finishing: {
          vc: { min: 75, rec: 100, max: 130 },
          f: { min: 0.05, rec: 0.08, max: 0.11 },
          ap: { min: 0.2, rec: 0.35, max: 0.6 },
        },
        parting: {
          vc: { min: 40, rec: 55, max: 75 },
          f: { min: 0.03, rec: 0.05, max: 0.07 },
          ap: { min: 1.5, rec: 2.0, max: 2.5 },
        },
      },
      hss: {
        roughing: {
          vc: { min: 8, rec: 12, max: 16 },
          f: { min: 0.06, rec: 0.10, max: 0.14 },
          ap: { min: 0.5, rec: 0.8, max: 1.2 },
        },
        finishing: {
          vc: { min: 10, rec: 15, max: 19 },
          f: { min: 0.03, rec: 0.05, max: 0.07 },
          ap: { min: 0.15, rec: 0.25, max: 0.4 },
        },
        parting: {
          vc: { min: 6, rec: 9, max: 12 },
          f: { min: 0.02, rec: 0.03, max: 0.045 },
          ap: { min: 1.0, rec: 1.5, max: 2.0 },
        },
      },
    },
  },
  {
    id: '14571_v4a',
    name: 'Edelstahl V4A (1.4571 / X6CrNiMoTi17-12-2)',
    standardCode: '1.4571 / AISI 316Ti',
    shortDesc: 'Titanstabilisierter, säurebeständiger Edelstahl',
    group: 'stainless',
    isoClass: 'M',
    kc1_1: 2400,
    hardnessBrinell: '~190 HB',
    cooling: 'Viel Emulsion mit Schneidöl-Zusatz',
    notes: 'Noch zäher als V2A. Drehzahl 10% unter V2A ansetzen.',
    params: {
      carbide: {
        roughing: {
          vc: { min: 45, rec: 65, max: 85 },
          f: { min: 0.10, rec: 0.16, max: 0.22 },
          ap: { min: 0.8, rec: 1.4, max: 2.2 },
        },
        finishing: {
          vc: { min: 65, rec: 90, max: 115 },
          f: { min: 0.04, rec: 0.07, max: 0.10 },
          ap: { min: 0.15, rec: 0.3, max: 0.5 },
        },
        parting: {
          vc: { min: 35, rec: 50, max: 65 },
          f: { min: 0.025, rec: 0.045, max: 0.065 },
          ap: { min: 1.5, rec: 2.0, max: 2.4 },
        },
      },
      hss: {
        roughing: {
          vc: { min: 7, rec: 10, max: 14 },
          f: { min: 0.05, rec: 0.09, max: 0.12 },
          ap: { min: 0.5, rec: 0.8, max: 1.2 },
        },
        finishing: {
          vc: { min: 9, rec: 13, max: 17 },
          f: { min: 0.025, rec: 0.045, max: 0.065 },
          ap: { min: 0.15, rec: 0.25, max: 0.35 },
        },
        parting: {
          vc: { min: 5, rec: 8, max: 11 },
          f: { min: 0.018, rec: 0.028, max: 0.04 },
          ap: { min: 1.0, rec: 1.4, max: 1.8 },
        },
      },
    },
  },

  // =========================================================================
  // 5. KUPFER / MESSING / BRONZE
  // =========================================================================
  {
    id: 'ms58',
    name: 'Zerspanungsmessing (CuZn39Pb3 / Ms58)',
    standardCode: '2.0401 / CW614N',
    shortDesc: 'Automatenmessing mit Bleianteil, Traumwerkstoff jedes Drehers',
    group: 'brass_bronze',
    isoClass: 'N',
    kc1_1: 780,
    hardnessBrinell: '~110-140 HB',
    cooling: 'Trocken oder Emulsion (trocken sehr beliebt)',
    notes: 'Kurzbrechende Nadelspäne. 140–180 m/min sind sehr sicher und sauber.',
    params: {
      carbide: {
        roughing: {
          vc: { min: 110, rec: 150, max: 210 },
          f: { min: 0.16, rec: 0.24, max: 0.35 },
          ap: { min: 1.2, rec: 2.0, max: 3.5 },
        },
        finishing: {
          vc: { min: 150, rec: 210, max: 280 },
          f: { min: 0.05, rec: 0.09, max: 0.13 },
          ap: { min: 0.2, rec: 0.4, max: 0.9 },
        },
        parting: {
          vc: { min: 80, rec: 120, max: 160 },
          f: { min: 0.045, rec: 0.07, max: 0.11 },
          ap: { min: 1.5, rec: 2.2, max: 2.8 },
        },
      },
      hss: {
        roughing: {
          vc: { min: 35, rec: 50, max: 70 },
          f: { min: 0.10, rec: 0.16, max: 0.22 },
          ap: { min: 0.8, rec: 1.4, max: 2.0 },
        },
        finishing: {
          vc: { min: 45, rec: 65, max: 90 },
          f: { min: 0.04, rec: 0.065, max: 0.09 },
          ap: { min: 0.15, rec: 0.3, max: 0.6 },
        },
        parting: {
          vc: { min: 25, rec: 38, max: 50 },
          f: { min: 0.03, rec: 0.05, max: 0.07 },
          ap: { min: 1.2, rec: 1.8, max: 2.2 },
        },
      },
    },
  },
  {
    id: 'bronze_cusn8',
    name: 'Zinnbronze / Lagerbronze (CuSn8 / CuSn12)',
    standardCode: '2.1030 / CW453K',
    shortDesc: 'Verschleißfeste Buchsen- und Gleitlagerbronze',
    group: 'brass_bronze',
    isoClass: 'N',
    kc1_1: 1100,
    hardnessBrinell: '~120-150 HB',
    cooling: 'Emulsion empfohlen',
    notes: 'Zäher als Messing. Drehzahl moderat halten (ca. 90–120 m/min).',
    params: {
      carbide: {
        roughing: {
          vc: { min: 70, rec: 95, max: 130 },
          f: { min: 0.12, rec: 0.18, max: 0.26 },
          ap: { min: 1.0, rec: 1.6, max: 2.6 },
        },
        finishing: {
          vc: { min: 95, rec: 130, max: 170 },
          f: { min: 0.05, rec: 0.08, max: 0.11 },
          ap: { min: 0.2, rec: 0.35, max: 0.7 },
        },
        parting: {
          vc: { min: 55, rec: 75, max: 100 },
          f: { min: 0.04, rec: 0.06, max: 0.09 },
          ap: { min: 1.5, rec: 2.0, max: 2.5 },
        },
      },
      hss: {
        roughing: {
          vc: { min: 18, rec: 25, max: 32 },
          f: { min: 0.08, rec: 0.12, max: 0.16 },
          ap: { min: 0.6, rec: 1.0, max: 1.5 },
        },
        finishing: {
          vc: { min: 22, rec: 30, max: 40 },
          f: { min: 0.035, rec: 0.055, max: 0.08 },
          ap: { min: 0.15, rec: 0.25, max: 0.4 },
        },
        parting: {
          vc: { min: 14, rec: 18, max: 24 },
          f: { min: 0.025, rec: 0.04, max: 0.055 },
          ap: { min: 1.2, rec: 1.6, max: 2.0 },
        },
      },
    },
  },

  // =========================================================================
  // 6. GUSSEISEN / GRAUGUSS
  // =========================================================================
  {
    id: 'gjl_250',
    name: 'Grauguss (EN-GJL-250 / GG-25)',
    standardCode: '0.6025 / GG-25',
    shortDesc: 'Gusseisen mit Lamellengraphit (Maschinenbetten, Riemenscheiben)',
    group: 'cast_iron',
    isoClass: 'K',
    kc1_1: 1250,
    hardnessBrinell: '~180-230 HB',
    cooling: 'TROCKEN zerspanen! (Emulsion bindet den Schmiergraphit als Schlamm)',
    notes: 'Bröckelnde Späne. Bei 80–100 m/min sehr ruhig im Lauf.',
    params: {
      carbide: {
        roughing: {
          vc: { min: 65, rec: 90, max: 120 },
          f: { min: 0.15, rec: 0.22, max: 0.32 },
          ap: { min: 1.0, rec: 1.8, max: 3.2 },
        },
        finishing: {
          vc: { min: 90, rec: 120, max: 160 },
          f: { min: 0.06, rec: 0.10, max: 0.14 },
          ap: { min: 0.2, rec: 0.45, max: 0.9 },
        },
        parting: {
          vc: { min: 50, rec: 70, max: 95 },
          f: { min: 0.04, rec: 0.06, max: 0.09 },
          ap: { min: 1.5, rec: 2.2, max: 2.8 },
        },
      },
      hss: {
        roughing: {
          vc: { min: 12, rec: 16, max: 22 },
          f: { min: 0.10, rec: 0.14, max: 0.20 },
          ap: { min: 0.8, rec: 1.2, max: 1.8 },
        },
        finishing: {
          vc: { min: 16, rec: 22, max: 28 },
          f: { min: 0.04, rec: 0.065, max: 0.09 },
          ap: { min: 0.15, rec: 0.3, max: 0.5 },
        },
        parting: {
          vc: { min: 10, rec: 13, max: 17 },
          f: { min: 0.025, rec: 0.04, max: 0.055 },
          ap: { min: 1.2, rec: 1.6, max: 2.0 },
        },
      },
    },
  },

  // =========================================================================
  // 7. TITAN / SONDERWERKSTOFFE
  // =========================================================================
  {
    id: 'titan_gr5',
    name: 'Titan Grad 5 (Ti-6Al-4V)',
    standardCode: '3.7165 / Grade 5',
    shortDesc: 'Luftfahrt & Medizintechnik, extrem hohe Zugfestigkeit bei geringem Gewicht',
    group: 'special',
    isoClass: 'S',
    kc1_1: 2900,
    hardnessBrinell: '~330 HB',
    cooling: 'Sehr reichlich KSS unter Druck (Brandgefahr bei Spänen ohne Kühlung!)',
    notes: 'Sehr schlechte Wärmeleitung. Drehzahlen bewusst sehr niedrig halten (ca. 30–45 m/min).',
    params: {
      carbide: {
        roughing: {
          vc: { min: 25, rec: 35, max: 50 },
          f: { min: 0.10, rec: 0.15, max: 0.20 },
          ap: { min: 0.6, rec: 1.2, max: 1.8 },
        },
        finishing: {
          vc: { min: 35, rec: 50, max: 65 },
          f: { min: 0.04, rec: 0.065, max: 0.09 },
          ap: { min: 0.15, rec: 0.25, max: 0.45 },
        },
        parting: {
          vc: { min: 20, rec: 30, max: 40 },
          f: { min: 0.025, rec: 0.04, max: 0.055 },
          ap: { min: 1.2, rec: 1.6, max: 2.0 },
        },
      },
      hss: {
        roughing: {
          vc: { min: 6, rec: 9, max: 12 },
          f: { min: 0.05, rec: 0.08, max: 0.11 },
          ap: { min: 0.4, rec: 0.6, max: 1.0 },
        },
        finishing: {
          vc: { min: 8, rec: 11, max: 15 },
          f: { min: 0.025, rec: 0.04, max: 0.06 },
          ap: { min: 0.1, rec: 0.2, max: 0.3 },
        },
        parting: {
          vc: { min: 5, rec: 7, max: 9 },
          f: { min: 0.015, rec: 0.025, max: 0.035 },
          ap: { min: 1.0, rec: 1.2, max: 1.5 },
        },
      },
    },
  },
];
