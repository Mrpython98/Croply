import { Droplets, FlaskConical, Leaf, Sun, TrendingUp, Trophy } from "lucide-react";
import type { RotationScore } from "@/lib/types";

interface ScorecardProps {
  scores: RotationScore[];
  bestId: string | null;
}

const METRIC_CONFIG = [
  { key: "waterScore", label: "Water Use", icon: Droplets, color: "text-sky-600", bg: "bg-sky-100" },
  { key: "nitrogenScore", label: "Nitrogen", icon: FlaskConical, color: "text-foliage-600", bg: "bg-foliage-100" },
  { key: "organicMatterScore", label: "Org. Matter", icon: Leaf, color: "text-earth-600", bg: "bg-earth-100" },
  { key: "droughtScore", label: "Drought Tol.", icon: Sun, color: "text-sun-600", bg: "bg-sun-100" },
  { key: "yieldScore", label: "Yield", icon: TrendingUp, color: "text-foliage-700", bg: "bg-foliage-50" },
] as const;

export function Scorecard({ scores, bestId }: ScorecardProps) {
  const best = scores.find((s) => s.rotation.id === bestId) ?? scores[0];

  if (!best) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 mt-10">
      <div className="rounded-2xl bg-gradient-to-br from-foliage-800 to-foliage-950 p-8 lg:p-10 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="h-5 w-5 text-sun-300" />
          <h2 className="font-display text-xl font-semibold">
            Recommended Rotation
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: rotation details */}
          <div>
            <h3 className="font-display text-2xl font-semibold leading-tight">
              {best.rotation.name}
            </h3>
            <p className="mt-2 text-foliage-200 text-sm leading-relaxed">
              {best.rotation.description}
            </p>

            {/* Year sequence */}
            <div className="mt-6 flex items-center gap-2">
              {[best.rotation.year1, best.rotation.year2, best.rotation.year3].map(
                (crop, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm ring-1 ring-white/10">
                      <p className="text-[10px] uppercase tracking-wide text-foliage-300">
                        Year {i + 1}
                      </p>
                      <p className="text-sm font-medium text-white">
                        {crop.name}
                      </p>
                    </div>
                    {i < 2 && (
                      <span className="text-foliage-400 text-lg">→</span>
                    )}
                  </div>
                )
              )}
            </div>

            {/* Overall match */}
            <div className="mt-6 flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-sun-300">
                  {best.matchPercent}
                  <span className="text-lg">%</span>
                </p>
                <p className="text-xs text-foliage-300 mt-1">Match Score</p>
              </div>
              <div className="h-12 w-px bg-foliage-700" />
              <div className="text-sm text-foliage-200 leading-relaxed">
                {best.recommendation}
              </div>
            </div>
          </div>

          {/* Right: metric breakdown */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foliage-300 uppercase tracking-wide">
              Score Breakdown
            </h4>
            {METRIC_CONFIG.map((metric) => {
              const Icon = metric.icon;
              const score = best[
                metric.key as keyof RotationScore
              ] as unknown as number;
              return (
                <div key={metric.key} className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${metric.bg}`}
                  >
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foliage-100">
                        {metric.label}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {score}
                        <span className="text-foliage-400">/100</span>
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-foliage-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-foliage-400 to-foliage-300 transition-all duration-700"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg bg-white/5 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs text-foliage-300">Est. Irrigation Need</p>
                <p className="text-lg font-semibold text-white">
                  {best.estimatedIrrigationMm}
                  <span className="text-sm font-normal text-foliage-300">
                    {" "}
                    mm/yr
                  </span>
                </p>
              </div>
              <div className="rounded-lg bg-white/5 px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs text-foliage-300">N Balance</p>
                <p className="text-lg font-semibold text-white">
                  {best.nitrogenBalance > 0 ? "+" : ""}
                  {best.nitrogenBalance}
                  <span className="text-sm font-normal text-foliage-300">
                    {" "}
                    kg/ha
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
