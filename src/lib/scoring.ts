import type {
  ClimateData,
  Priority,
  RotationPlan,
  RotationScore,
  SoilType,
} from "@/lib/types";
import { ROTATIONS } from "@/data/rotations";

function clampScore(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

const GROWING_SEASON_MONTHS: Record<string, number[]> = {
  Summer: [4, 5, 6, 7, 8, 9],
  "Fall-Spring": [9, 10, 11, 2, 3, 4, 5],
  "Fall-Winter-Spring": [9, 10, 11, 12, 1, 2, 3, 4, 5],
  Spring: [3, 4, 5, 6, 7],
  "Multi-year": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

function getSeasonalPrecipMm(
  climate: ClimateData,
  growingSeason: string
): number {
  const months = GROWING_SEASON_MONTHS[growingSeason] ?? [4, 5, 6, 7, 8, 9];
  return months.reduce((sum, m) => sum + (climate.monthlyPrecip[m]?.mm ?? 0), 0);
}

function computeWaterScore(
  rotation: RotationPlan,
  climate: ClimateData,
  soil: SoilType
): { score: number; irrigationMm: number } {
  const crops = [rotation.year1, rotation.year2, rotation.year3];

  // For each crop year, compare that crop's water need to the precipitation
  // that actually falls during its growing season, adjusted by soil retention
  let totalIrrigation = 0;
  let totalWaterNeed = 0;

  for (const crop of crops) {
    const seasonalPrecip = getSeasonalPrecipMm(climate, crop.growingSeason);
    // Soil retention controls how much rainfall is actually available to plants.
    // Sandy soils lose water to drainage; clay soils hold more. Realistic range:
    // ~50-70% of in-season rainfall is crop-available.
    const effectiveFraction = 0.45 + soil.waterRetention * 0.25;
    const effectivePrecip = seasonalPrecip * effectiveFraction;
    const irrigation = Math.max(0, crop.waterNeedMm - effectivePrecip);
    totalIrrigation += irrigation;
    totalWaterNeed += crop.waterNeedMm;
  }

  const avgIrrigation = totalIrrigation / 3;
  const avgWaterNeed = totalWaterNeed / 3;
  const irrigationRatio = avgWaterNeed > 0 ? avgIrrigation / avgWaterNeed : 0;

  // Lower irrigation ratio = higher score
  let score = 100 - irrigationRatio * 150;

  // Penalize if precipitation trend is falling and crops are water-hungry
  if (climate.precipTrend === "falling" && avgWaterNeed > 400) {
    score -= 10;
  }

  return { score: clampScore(score), irrigationMm: Math.round(avgIrrigation) };
}

function computeNitrogenScore(
  rotation: RotationPlan,
  soil: SoilType
): { score: number; nitrogenBalance: number } {
  const crops = [rotation.year1, rotation.year2, rotation.year3];

  let nitrogenFixed = 0;
  let nitrogenDemanded = 0;
  let omContribution = 0;

  for (const crop of crops) {
    if (crop.nitrogenFixer) {
      // Legumes fix nitrogen proportional to their nitrogen demand being low
      nitrogenFixed += (1 - crop.nitrogenDemand) * 100;
    }
    nitrogenDemanded += crop.nitrogenDemand * 100;
    omContribution += crop.organicMatterContribution;
  }

  const soilBaseline = soil.nitrogenContent * 100;
  const totalSupply = nitrogenFixed + soilBaseline * 0.3;
  const balance = totalSupply - nitrogenDemanded + omContribution * 10;

  // Score based on how positive the nitrogen balance is
  let score = 50 + balance * 0.6;

  // Bonus for having at least one nitrogen fixer in the rotation
  const hasFixer = crops.some((c) => c.nitrogenFixer);
  if (hasFixer) score += 15;

  return { score: clampScore(score), nitrogenBalance: Math.round(balance) };
}

function computeOrganicMatterScore(
  rotation: RotationPlan,
  soil: SoilType
): number {
  const crops = [rotation.year1, rotation.year2, rotation.year3];
  const avgOMContribution = crops.reduce((a, c) => a + c.organicMatterContribution, 0) / 3;

  // Higher crop OM contribution + soil baseline = better score
  let score = avgOMContribution * 80 + soil.organicMatterBaseline * 30;

  // Bonus for cover crops
  const hasCoverCrop = crops.some((c) => c.category === "cover");
  if (hasCoverCrop) score += 15;

  // Bonus for multi-year stands (alfalfa)
  const hasMultiYear = crops.some((c) => c.growingSeason === "Multi-year");
  if (hasMultiYear) score += 10;

  return clampScore(score);
}

function computeDroughtScore(
  rotation: RotationPlan,
  climate: ClimateData
): number {
  const crops = [rotation.year1, rotation.year2, rotation.year3];
  const avgDroughtTolerance = crops.reduce((a, c) => a + c.droughtTolerance, 0) / 3;

  let score = avgDroughtTolerance * 90;

  // Adjust based on climate trends
  if (climate.tempTrend === "rising") {
    score = score * 0.9 + avgDroughtTolerance * 15;
  }
  if (climate.precipTrend === "falling") {
    score = score * 0.9 + avgDroughtTolerance * 12;
  }

  // Low-rainfall bonus for drought-tolerant rotations
  if (climate.annualPrecipMm < 400) {
    score += (avgDroughtTolerance - 0.5) * 20;
  }

  return clampScore(score);
}

function computeYieldScore(rotation: RotationPlan): number {
  const crops = [rotation.year1, rotation.year2, rotation.year3];
  const avgYield = crops.reduce((a, c) => a + c.yieldPotential, 0) / 3;

  // Having at least one high-yield cash crop helps
  const maxYield = Math.max(...crops.map((c) => c.yieldPotential));
  const score = avgYield * 60 + maxYield * 35;

  return clampScore(score);
}

function generateRecommendation(
  rotation: RotationPlan,
  climate: ClimateData,
  soil: SoilType,
  priority: Priority,
  scores: {
    water: number;
    nitrogen: number;
    organicMatter: number;
    drought: number;
    yield: number;
  }
): string {
  const parts: string[] = [];

  if (priority.key === "minimize_irrigation") {
    if (scores.water >= 70) {
      parts.push(
        `This rotation aligns well with the region's ${climate.annualPrecipMm}mm annual rainfall, minimizing irrigation needs.`
      );
    } else {
      parts.push(
        `Expect supplemental irrigation in dry years — precipitation of ${climate.annualPrecipMm}mm may not cover peak summer demand.`
      );
    }
  } else if (priority.key === "restore_nitrogen") {
    if (scores.nitrogen >= 70) {
      parts.push(
        `Strong nitrogen fixation across the cycle significantly reduces synthetic fertilizer needs on ${soil.label}.`
      );
    } else {
      parts.push(
        `Nitrogen restoration is moderate — consider adding a legume cover crop or extending the legume year.`
      );
    }
  } else if (priority.key === "build_organic_matter") {
    if (scores.organicMatter >= 70) {
      parts.push(
        `Excellent organic matter build-up through cover crops and residue returns, especially beneficial for ${soil.label}.`
      );
    } else {
      parts.push(
        `Organic matter gains are modest — a dedicated cover crop year would boost long-term soil health.`
      );
    }
  } else if (priority.key === "drought_resilience") {
    if (scores.drought >= 70) {
      parts.push(
        `All crops in this rotation tolerate heat and water stress, a strong fit given ${climate.tempTrend} temperatures in the region.`
      );
    } else {
      parts.push(
        `Drought tolerance is limited — with ${climate.tempTrend} temperature trends, consider swapping in heat-tolerant alternatives like sorghum or cowpea.`
      );
    }
  } else if (priority.key === "maximize_yield") {
    if (scores.yield >= 70) {
      parts.push(
        `Balanced high-yield rotation with strong cash crop potential across all three years.`
      );
    } else {
      parts.push(
        `Yield potential is lower than corn-dominant alternatives, but sustainability scores are stronger.`
      );
    }
  }

  if (climate.precipTrend === "falling") {
    parts.push(
      `Note: regional precipitation has declined ${Math.abs(climate.precipTrendPct)}% over the analysis period — water-efficient rotations are increasingly important.`
    );
  }
  if (climate.tempTrend === "rising") {
    parts.push(
      `Temperatures have risen ${climate.tempTrendPct}% — heat-tolerant crop selection is advisable.`
    );
  }

  return parts.join(" ");
}

export function scoreRotations(
  climate: ClimateData,
  soil: SoilType,
  priority: Priority
): RotationScore[] {
  const scores = ROTATIONS.map((rotation) => {
    const waterResult = computeWaterScore(rotation, climate, soil);
    const nitrogenResult = computeNitrogenScore(rotation, soil);
    const omScore = computeOrganicMatterScore(rotation, soil);
    const droughtScore = computeDroughtScore(rotation, climate);
    const yieldScore = computeYieldScore(rotation);

    const w = priority.weights;
    const overallScore = clampScore(
      waterResult.score * w.waterUse +
        nitrogenResult.score * w.nitrogenFixation +
        omScore * w.organicMatter +
        droughtScore * w.droughtTolerance +
        yieldScore * w.yieldPotential
    );

    const recommendation = generateRecommendation(rotation, climate, soil, priority, {
      water: waterResult.score,
      nitrogen: nitrogenResult.score,
      organicMatter: omScore,
      drought: droughtScore,
      yield: yieldScore,
    });

    return {
      rotation,
      overallScore,
      waterScore: waterResult.score,
      nitrogenScore: nitrogenResult.score,
      organicMatterScore: omScore,
      droughtScore,
      yieldScore,
      estimatedIrrigationMm: waterResult.irrigationMm,
      nitrogenBalance: nitrogenResult.nitrogenBalance,
      recommendation,
      matchPercent: overallScore,
    };
  });

  scores.sort((a, b) => b.overallScore - a.overallScore);

  // Normalize match percentages relative to the top score
  if (scores.length > 0 && scores[0].overallScore > 0) {
    const top = scores[0].overallScore;
    scores.forEach((s) => {
      s.matchPercent = Math.round((s.overallScore / top) * 100);
    });
  }

  return scores;
}
