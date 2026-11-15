import { useCallback, useState } from "react";
import { AlertCircle, Save, Check, Sprout } from "lucide-react";
import { Hero } from "@/components/Hero";
import { Configurator } from "@/components/Configurator";
import { ClimatePanel } from "@/components/ClimatePanel";
import { Scorecard } from "@/components/Scorecard";
import { RotationComparison } from "@/components/RotationComparison";
import { ExtensionLinks } from "@/components/ExtensionLinks";
import { YieldBenchmarks } from "@/components/YieldBenchmarks";
import { SavedReports } from "@/components/SavedReports";
import { REGIONS } from "@/data/regions";
import { SOIL_TYPES } from "@/data/soilTypes";
import { PRIORITIES } from "@/data/priorities";
import { fetchClimateData } from "@/lib/nasaPower";
import { scoreRotations } from "@/lib/scoring";
import { supabase } from "@/lib/supabase";
import type {
  ClimateData,
  PriorityKey,
  RotationScore,
  SavedReport,
} from "@/lib/types";

export default function App() {
  const [regionId, setRegionId] = useState(REGIONS[0].id);
  const [soilId, setSoilId] = useState(REGIONS[0].defaultSoil);
  const [priorityKey, setPriorityKey] = useState<PriorityKey>(
    "minimize_irrigation"
  );

  const [climate, setClimate] = useState<ClimateData | null>(null);
  const [scores, setScores] = useState<RotationScore[]>([]);
  const [bestId, setBestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasResults, setHasResults] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [reportsRefreshKey, setReportsRefreshKey] = useState(0);

  const region = REGIONS.find((r) => r.id === regionId)!;
  const soil = SOIL_TYPES.find((s) => s.id === soilId)!;
  const priority = PRIORITIES.find((p) => p.key === priorityKey)!;

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSaveStatus("idle");

    try {
      const climateData = await fetchClimateData(
        region.lat,
        region.lon,
        region.id,
        region.name
      );
      setClimate(climateData);

      const rotationScores = scoreRotations(climateData, soil, priority);
      setScores(rotationScores);
      setBestId(rotationScores[0]?.rotation.id ?? null);
      setHasResults(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch climate data";
      setError(
        `Could not retrieve NASA satellite data for this region. ${message}. Please try again.`
      );
      setHasResults(false);
    } finally {
      setIsLoading(false);
    }
  }, [region, soil, priority]);

  const handleSave = useCallback(async () => {
    if (!climate || scores.length === 0) return;
    setSaveStatus("saving");

    try {
      const { error: insertError } = await supabase
        .from("rotation_reports")
        .insert({
          region_id: region.id,
          region_name: region.name,
          soil_type: soil.label,
          priority: priorityKey,
          climate_data: climate,
          rotation_scores: scores,
          best_rotation_id: bestId,
        });

      if (insertError) throw insertError;

      setSaveStatus("saved");
      setReportsRefreshKey((k) => k + 1);
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("idle");
      setError("Could not save report. Please try again.");
    }
  }, [climate, scores, region, soil, priorityKey, bestId]);

  const handleLoadReport = useCallback((report: SavedReport) => {
    setRegionId(report.region_id);
    setSoilId(
      SOIL_TYPES.find((s) => s.label === report.soil_type)?.id ??
        REGIONS.find((r) => r.id === report.region_id)?.defaultSoil ??
        SOIL_TYPES[0].id
    );
    setPriorityKey(report.priority as PriorityKey);
    setClimate(report.climate_data);
    setScores(report.rotation_scores);
    setBestId(report.best_rotation_id);
    setHasResults(true);
    setError(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-earth-50/30">
      <Hero />
      <Configurator
        selectedRegionId={regionId}
        selectedSoilId={soilId}
        selectedPriority={priorityKey}
        isLoading={isLoading}
        onRegionChange={setRegionId}
        onSoilChange={setSoilId}
        onPriorityChange={setPriorityKey}
        regions={REGIONS}
        soilTypes={SOIL_TYPES}
        priorities={PRIORITIES}
        onAnalyze={handleAnalyze}
      />

      {/* Error banner */}
      {error && (
        <div className="mx-auto max-w-7xl px-6 mt-6 animate-fade-in">
          <div className="flex items-start gap-3 rounded-xl bg-red-50 ring-1 ring-red-200 px-5 py-4">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">
                Something went wrong
              </p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {hasResults && climate && (
        <>
          <ClimatePanel climate={climate} />

          <div className="mx-auto max-w-7xl px-6 mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-earth-500">
              <Sprout className="h-4 w-4 text-foliage-600" />
              <span>
                Scored for <strong className="text-earth-700">{priority.label}</strong> on{" "}
                <strong className="text-earth-700">{soil.label}</strong>
              </span>
            </div>
            <button
              onClick={handleSave}
              disabled={saveStatus !== "idle"}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                saveStatus === "saved"
                  ? "bg-foliage-100 text-foliage-700"
                  : "bg-white text-earth-700 ring-1 ring-earth-200 hover:ring-foliage-300 hover:text-foliage-700"
              }`}
            >
              {saveStatus === "saving" && (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-earth-300 border-t-earth-600" />
                  Saving...
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              )}
              {saveStatus === "idle" && (
                <>
                  <Save className="h-4 w-4" />
                  Save Report
                </>
              )}
            </button>
          </div>

          <Scorecard scores={scores} bestId={bestId} />
          <RotationComparison scores={scores} bestId={bestId ?? ""} />
          <YieldBenchmarks
            region={region}
            bestRotationName={
              scores.find((s) => s.rotation.id === bestId)?.rotation.name ??
              scores[0]?.rotation.name ??
              ""
            }
            analysisKey={`${regionId}-${soilId}-${priorityKey}-${climate.fetchedAt}`}
          />
          <ExtensionLinks region={region} />
        </>
      )}

      {/* Empty state before first analysis */}
      {!hasResults && !isLoading && !error && (
        <div className="mx-auto max-w-7xl px-6 mt-10">
          <div className="rounded-2xl bg-white ring-1 ring-earth-200/60 p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-foliage-50">
              <Sprout className="h-8 w-8 text-foliage-600" />
            </div>
            <h3 className="font-display text-xl font-semibold text-earth-900 mt-4">
              Ready to analyze your rotations
            </h3>
            <p className="text-sm text-earth-500 mt-2 max-w-md mx-auto">
              Select your region, soil type, and priority above, then click
              "Analyze Rotations" to pull a decade of NASA satellite climate
              data and score 8 crop rotation plans.
            </p>
          </div>
        </div>
      )}

      <SavedReports
        refreshKey={reportsRefreshKey}
        onLoadReport={handleLoadReport}
      />

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-6 py-12 mt-10">
        <div className="border-t border-earth-200 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-earth-500">
              <Sprout className="h-4 w-4 text-foliage-500" />
              <span>
                Field Shift — Built for the NASA Space Apps Challenge
              </span>
            </div>
            <p className="text-xs text-earth-400">
              Climate data: NASA POWER · Yield search: SerpApi · Scoring
              model: custom weighted algorithm
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
