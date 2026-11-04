export type MaterialGroup =
  | 'plastics'
  | 'aluminum'
  | 'steel'
  | 'stainless'
  | 'brass_bronze'
  | 'cast_iron'
  | 'special';

export type IsoClassification = 'P' | 'M' | 'K' | 'N' | 'S' | 'H';

export type ToolType = 'carbide' | 'hss';

export type OperationType = 'roughing' | 'finishing' | 'parting';

export type MachineEnvironment = 'manual' | 'cnc';

export type ToolCategory =
  | 'roughing_external'
  | 'finishing_external'
  | 'parting_grooving'
  | 'boring_internal'
  | 'threading'
  | 'hss_custom';

export type InsertShape = 'C' | 'D' | 'V' | 'W' | 'S' | 'T' | 'groove' | 'thread' | 'hss';

export interface WorkshopTool {
  id: string;
  name: string;
  category: ToolCategory;
  holderDesignation: string;
  insertDesignation: string;
  insertShape: InsertShape;
  toolMaterial: ToolType;
  cornerRadiusMm: number;
  bladeWidthMm?: number;
  shankSize: string;
  suitableIsoClasses: IsoClassification[];
  isAluminumPolished?: boolean;
  notes?: string;
  inToolPost?: boolean;
  isOwned: boolean; // true = in user's workshop, false = recommendation / wishlist
  isHolderOwned?: boolean; // whether toolholder itself is in workshop
  isInsertOwned?: boolean; // whether carbide insert is in stock
  compatibleInsertCodes?: string[]; // other inserts fitting this holder
  stockCount?: number; // insert stock quantity
}

export interface RecommendedInsertDetail {
  designation: string;
  shape: InsertShape;
  cornerRadiusMm: number;
  bladeWidthMm?: number;
  isPolished?: boolean;
  isOwned: boolean;
  tip: string;
}

export interface MatchingHolderDetail {
  designation: string;
  shankSize: string;
  inToolPost?: boolean;
  isOwned: boolean;
  tip: string;
}

export interface ToolRecommendation {
  tool: WorkshopTool;
  score: number;
  verdict: 'optimal' | 'gut' | 'bedingt' | 'ungeeignet';
  reasons: string[];
  drawbacks?: string[];
  isOwned: boolean;
  recommendedInsert?: RecommendedInsertDetail;
  matchingHolder?: MatchingHolderDetail;
}

export interface DualRecommendationResult {
  bestOwned?: ToolRecommendation;
  bestOverall?: ToolRecommendation;
  hasBetterUnownedAlternative: boolean;
  scoreDifference: number;
  upgradeRationale?: string;
  allOwned: ToolRecommendation[];
  allUnowned: ToolRecommendation[];
  equallySuitableOwned: ToolRecommendation[];
}

export interface ParameterRange {
  min: number;
  rec: number;
  max: number;
}

export interface OperationParameters {
  vc: ParameterRange; // m/min
  f: ParameterRange;  // mm/rev (Vorschub)
  ap: ParameterRange; // mm (Schnitttiefe / Zustellung)
}

export interface MaterialToolConfig {
  carbide: {
    roughing: OperationParameters;
    finishing: OperationParameters;
    parting: OperationParameters;
  };
  hss: {
    roughing: OperationParameters;
    finishing: OperationParameters;
    parting: OperationParameters;
  };
}

export interface Material {
  id: string;
  name: string;
  standardCode: string; // e.g. "1.0038 / S235JR"
  shortDesc: string;
  group: MaterialGroup;
  isoClass: IsoClassification;
  kc1_1: number; // Specific cutting force in N/mm² (for power Pc calculation)
  hardnessBrinell?: string;
  cooling: string;
  notes: string;
  params: MaterialToolConfig;
}

export interface LatheGearConfig {
  id: string;
  name: string;
  isStepless: boolean;
  minRpm?: number;
  maxRpm?: number;
  steps: number[];
}

export interface CalculationResult {
  exactRpm: number;
  suggestedRpm: number;
  nearestGearStep?: number;
  feedRate: number;
  feedRateRange: { min: number; max: number };
  depthOfCut: number;
  depthOfCutRange: { min: number; max: number };
  cuttingSpeed: number;
  cuttingSpeedRange: { min: number; max: number };
  metalRemovalRateQ: number; // cm³/min
  requiredPowerKw: number;   // kW (approx motor power)
  theoreticalRz: number;     // µm (assuming r_epsilon = 0.8mm)
  cooling: string;
  notes: string;
  warning?: string;
  environment: MachineEnvironment;
  formulaBreakdown: {
    vc: number;
    d: number;
    rawRpm: number;
    isClampedByMachine: boolean;
    maxLatheRpm?: number;
  };
}

export interface SavedJob {
  id: string;
  title: string;
  date: string;
  materialId: string;
  materialName: string;
  diameter: number;
  operation: OperationType;
  toolType: ToolType;
  rpm: number;
  feedRate: number;
  depthOfCut: number;
  cuttingSpeed: number;
}
