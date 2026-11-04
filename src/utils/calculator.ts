import { CalculationResult, LatheGearConfig, Material, OperationType, ToolType, MachineEnvironment } from '../types/machining';

export function calculateCuttingParams(
  material: Material,
  diameterMm: number,
  operation: OperationType,
  toolType: ToolType,
  latheConfig: LatheGearConfig,
  environment: MachineEnvironment = 'manual',
  customVcOverride?: number,
  customFeedOverride?: number,
  customApOverride?: number,
  insertCornerRadiusMm: number = 0.8
): CalculationResult {
  const d = Math.max(1, diameterMm);
  const toolParams = material.params[toolType][operation];

  // In CNC mode with rigid machines and high pressure coolant, carbide vc is roughly 1.8x - 2.0x higher
  const envMultiplier = environment === 'cnc' && toolType === 'carbide' ? 1.85 : 1.0;

  const baseVc = customVcOverride ?? Math.round(toolParams.vc.rec * envMultiplier);
  const vc = baseVc;
  const f = customFeedOverride ?? toolParams.f.rec;
  const ap = customApOverride ?? toolParams.ap.rec;

  // Spindle RPM: n = (vc * 1000) / (pi * d)
  const exactRpm = (vc * 1000) / (Math.PI * d);
  let suggestedRpm = Math.round(exactRpm);

  // Determine machine ceiling
  let maxLatheRpm: number | undefined;
  if (!latheConfig.isStepless && latheConfig.steps.length > 0) {
    maxLatheRpm = Math.max(...latheConfig.steps);
  } else if (latheConfig.maxRpm) {
    maxLatheRpm = latheConfig.maxRpm;
  }

  let isClampedByMachine = false;

  // Find nearest gear step if machine has discrete gears
  let nearestGearStep: number | undefined;
  if (!latheConfig.isStepless && latheConfig.steps.length > 0) {
    let closest = latheConfig.steps[0];
    let minDiff = Math.abs(exactRpm - closest);

    for (const step of latheConfig.steps) {
      const diff = Math.abs(exactRpm - step);
      if (diff < minDiff) {
        minDiff = diff;
        closest = step;
      }
    }
    nearestGearStep = closest;
    suggestedRpm = closest;

    if (exactRpm > (maxLatheRpm ?? 2500)) {
      isClampedByMachine = true;
    }
  } else {
    // If stepless, clamp within machine bounds
    if (latheConfig.minRpm && suggestedRpm < latheConfig.minRpm) {
      suggestedRpm = latheConfig.minRpm;
    }
    if (latheConfig.maxRpm && suggestedRpm > latheConfig.maxRpm) {
      suggestedRpm = latheConfig.maxRpm;
      isClampedByMachine = true;
    }
  }

  // Metal Removal Rate Q (cm³/min) = vc * ap * f
  const metalRemovalRateQ = Math.round(vc * ap * f * 10) / 10;

  // Specific cutting force correction based on feed rate: kc ≈ kc1.1 * f^(-0.25)
  const chipThicknessFactor = Math.pow(Math.max(0.02, f), -0.25);
  const kc = material.kc1_1 * chipThicknessFactor;

  // Cutting force Fc = ap * f * kc (N)
  const cuttingForceN = ap * f * kc;

  // Power at Spindle: Pc = (Fc * vc) / 60000 (kW)
  // Lathe motor efficiency approx 75%
  const requiredPowerKw = Math.round(((cuttingForceN * vc) / 60000 / 0.75) * 100) / 100;

  // Theoretical surface peak-to-valley roughness Rz ≈ (f² / (8 * r_epsilon)) * 1000 (µm)
  const rEps = Math.max(0.1, insertCornerRadiusMm);
  const theoreticalRz = Math.round(((f * f) / (8 * rEps)) * 1000 * 10) / 10;

  // Contextual Safety & Machining Warnings
  let warning: string | undefined;
  if (isClampedByMachine && maxLatheRpm) {
    warning = `Hinweis Drehzahlgrenze: Rechnerisch wären ${Math.round(exactRpm)} U/min nötig (für vc=${vc} m/min). Die Drehbank ist auf ihre Höchststufe von ${suggestedRpm} U/min begrenzt.`;
  } else if (d >= 70 && suggestedRpm > 1200) {
    warning = `Fliehkraft-Warnung: Bei Ø${d}mm mit ${suggestedRpm} U/min verringert die Fliehkraft die Spannkraft der Futterbacken! Drehzahl ggf. reduzieren.`;
  } else if (d >= 120 && suggestedRpm > 800) {
    warning = `Sicherheitshinweis: Großes Werkstück bei ${suggestedRpm} U/min. Max. Futterdrehzahl und Unwucht beachten!`;
  } else if (d <= 8 && suggestedRpm > 2400) {
    warning = `Kleine Welle neigt zum Ausbiegen. Zentrierspitze (Reitstock) verwenden & Schnittdruck reduzieren.`;
  } else if (requiredPowerKw > 2.5 && environment === 'manual') {
    warning = `Hoher Leistungsbedarf (~${requiredPowerKw} kW). Ggf. Schnitttiefe ap reduzieren, um Werkstatt-Motor nicht abzuwürgen.`;
  }

  return {
    exactRpm: Math.round(exactRpm),
    suggestedRpm,
    nearestGearStep,
    feedRate: f,
    feedRateRange: { min: toolParams.f.min, max: toolParams.f.max },
    depthOfCut: ap,
    depthOfCutRange: { min: toolParams.ap.min, max: toolParams.ap.max },
    cuttingSpeed: vc,
    cuttingSpeedRange: {
      min: Math.round(toolParams.vc.min * envMultiplier),
      max: Math.round(toolParams.vc.max * envMultiplier),
    },
    metalRemovalRateQ,
    requiredPowerKw,
    theoreticalRz,
    cooling: material.cooling,
    notes: material.notes,
    warning,
    environment,
    formulaBreakdown: {
      vc,
      d,
      rawRpm: Math.round(exactRpm),
      isClampedByMachine,
      maxLatheRpm,
    },
  };
}

// Calculate RPM for drilling on tailstock (Reitstockbohren)
export interface DrillCalculation {
  drillDiameter: number;
  vc: number;
  rpm: number;
  exactRpm: number;
  nearestGearRpm?: number;
  feedRateMmRev: number;
  feedSpeedMmMin: number;
  cooling: string;
  isClampedByMachine?: boolean;
}

export function calculateDrillingParams(
  material: Material,
  drillDiameterMm: number,
  isVhm: boolean,
  latheConfig: LatheGearConfig
): DrillCalculation {
  const d = Math.max(0.5, drillDiameterMm);

  // Vc for drilling in manual workshop is conservative to prevent drill breakage
  const baseVc = isVhm ? material.params.carbide.roughing.vc.rec * 0.45 : material.params.hss.roughing.vc.rec * 0.75;
  const vc = Math.max(8, Math.round(baseVc));

  const exactRpm = (vc * 1000) / (Math.PI * d);
  let rpm = Math.round(exactRpm);

  let feedFactor = 0.015;
  if (material.group === 'aluminum' || material.group === 'plastics' || material.group === 'brass_bronze') {
    feedFactor = 0.022;
  }
  const feedRateMmRev = Math.round(Math.min(0.35, Math.max(0.04, d * feedFactor)) * 100) / 100;

  let nearestGearRpm: number | undefined;
  let isClampedByMachine = false;
  const maxLatheRpm = !latheConfig.isStepless && latheConfig.steps.length > 0
    ? Math.max(...latheConfig.steps)
    : latheConfig.maxRpm;

  if (!latheConfig.isStepless && latheConfig.steps.length > 0) {
    let closest = latheConfig.steps[0];
    let minDiff = Math.abs(exactRpm - closest);
    for (const step of latheConfig.steps) {
      const diff = Math.abs(exactRpm - step);
      if (diff < minDiff) {
        minDiff = diff;
        closest = step;
      }
    }
    nearestGearRpm = closest;
    rpm = closest;

    if (exactRpm > (maxLatheRpm ?? 2500)) {
      isClampedByMachine = true;
    }
  } else if (latheConfig.maxRpm && rpm > latheConfig.maxRpm) {
    rpm = latheConfig.maxRpm;
    isClampedByMachine = true;
  }

  const feedSpeedMmMin = Math.round(rpm * feedRateMmRev);

  return {
    drillDiameter: d,
    vc,
    rpm,
    exactRpm: Math.round(exactRpm),
    nearestGearRpm,
    feedRateMmRev,
    feedSpeedMmMin,
    cooling: material.cooling,
    isClampedByMachine,
  };
}
