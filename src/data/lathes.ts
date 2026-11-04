import { LatheGearConfig } from '../types/machining';

export const DEFAULT_LATHE_CONFIGS: LatheGearConfig[] = [
  {
    id: 'matra_d10',
    name: 'Matra D10 (42 – 1600 U/min, 8 Stufen)',
    isStepless: false,
    minRpm: 42,
    maxRpm: 1600,
    steps: [42, 70, 120, 200, 335, 560, 960, 1600],
  },
  {
    id: 'optimum_bernardo',
    name: 'Werkstatt-Drehbank (z.B. Optimum / Bernardo / Paulimot)',
    isStepless: false,
    steps: [65, 115, 185, 330, 530, 930, 1500, 2200],
  },
  {
    id: 'weiler_classic',
    name: 'Präzisions-Drehbank (Weiler Primus / Matador Typ)',
    isStepless: false,
    steps: [48, 70, 95, 140, 190, 280, 380, 560, 750, 1120, 1500, 2240],
  },
  {
    id: 'din_standard',
    name: 'DIN-Normstufung (12 Getriebestufen)',
    isStepless: false,
    steps: [45, 71, 112, 180, 280, 450, 710, 1120, 1400, 1800, 2240, 2800],
  },
  {
    id: 'stepless_workshop',
    name: 'Stufenlos mit Frequenzumrichter (Werkstatt bis 2200 U/min)',
    isStepless: true,
    minRpm: 40,
    maxRpm: 2200,
    steps: [],
  },
  {
    id: 'hobby_mini',
    name: 'Kompakte Tischdrehbank (Sieg / Proxxon / Paulimot PM)',
    isStepless: false,
    steps: [100, 250, 500, 800, 1200, 1800, 2500],
  },
  {
    id: 'cnc_highspeed',
    name: 'CNC-Drehzentrum (Hochgeschwindigkeit bis 4500 U/min)',
    isStepless: true,
    minRpm: 50,
    maxRpm: 4500,
    steps: [],
  },
];

export const STANDARD_BAR_DIAMETERS = [4, 6, 8, 10, 12, 15, 16, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 120, 150];
