export type PriorityKey =
  | "minimize_irrigation"
  | "restore_nitrogen"
  | "build_organic_matter"
  | "drought_resilience"
  | "maximize_yield";

export interface Priority {
  key: PriorityKey;
  label: string;
  description: string;
  icon: string;
  weights: {
    waterUse: number;
    nitrogenFixation: number;
    organicMatter: number;
    droughtTolerance: number;
    yieldPotential: number;
  };
}

export interface SoilType {
  id: string;
  label: string;
  description: string;
  waterRetention: number;
  nitrogenContent: number;
  organicMatterBaseline: number;
  workability: number;
}

export interface Region {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  defaultSoil: string;
  extensionUrl: string;
  description: string;
}

export interface ClimateData {
  regionId: string;
  regionName: string;
  lat: number;
  lon: number;
  annualPrecipMm: number;
  avgTempC: number;
  maxTempC: number;
  minTempC: number;
  precipTrend: "rising" | "falling" | "stable";
  tempTrend: "rising" | "falling" | "stable";
  precipTrendPct: number;
  tempTrendPct: number;
  monthlyPrecip: { month: string; mm: number }[];
  monthlyTemp: { month: string; tempC: number }[];
  yearsAnalyzed: number;
  fetchedAt: string;
}

export interface Crop {
  name: string;
  waterNeedMm: number;
  nitrogenFixer: boolean;
  nitrogenDemand: number;
  organicMatterContribution: number;
  droughtTolerance: number;
  yieldPotential: number;
  growingSeason: string;
  category: "grain" | "legume" | "root" | "cover" | "fiber" | "vegetable" | "oilseed";
}

export interface RotationPlan {
  id: string;
  name: string;
  description: string;
  year1: Crop;
  year2: Crop;
  year3: Crop;
  pros: string[];
  cons: string[];
}

export interface RotationScore {
  rotation: RotationPlan;
  overallScore: number;
  waterScore: number;
  nitrogenScore: number;
  organicMatterScore: number;
  droughtScore: number;
  yieldScore: number;
  estimatedIrrigationMm: number;
  nitrogenBalance: number;
  recommendation: string;
  matchPercent: number;
}

export interface SavedReport {
  id: string;
  session_label: string | null;
  region_id: string;
  region_name: string;
  soil_type: string;
  priority: string;
  climate_data: ClimateData;
  rotation_scores: RotationScore[];
  best_rotation_id: string | null;
  created_at: string;
}
