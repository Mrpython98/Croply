import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { RotationScore } from "@/lib/types";

interface RotationComparisonProps {
  scores: RotationScore[];
  bestId: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  grain: "bg-sun-100 text-sun-700",
  legume: "bg-foliage-100 text-foliage-700",
  root: "bg-earth-100 text-earth-700",
  cover: "bg-sky-100 text-sky-700",
  fiber: "bg-purple-100 text-purple-700",
  vegetable: "bg-green-100 text-green-700",
  oilseed: "bg-amber-100 text-amber-700",
};

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 75
      ? "text-foliage-600"
      : score >= 50
      ? "text-sun-600"
      : "text-red-500";
  return (
    <div className="relative h-12 w-12 shrink-0">
      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-earth-100"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={`${(score / 100) * 125.6} 125.6`}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      <div
        className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${color}`}
      >
        {score}
      </div>
    </div>
  );
}

function RotationCard({
  item,
  isBest,
  rank,
}: {
  item: RotationScore;
  isBest: boolean;
  rank: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const crops = [item.rotation.year1, item.rotation.year2, item.rotation.year3];

  return (
    <div
      className={`rounded-2xl bg-white ring-1 transition-all ${
        isBest
          ? "ring-foliage-300 shadow-md"
          : "ring-earth-200/60 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <ScoreRing score={item.overallScore} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-earth-400">
                #{rank}
              </span>
              {isBest && (
                <span className="rounded-full bg-foliage-100 px-2 py-0.5 text-[10px] font-semibold text-foliage-700 uppercase tracking-wide">
                  Best Match
                </span>
              )}
            </div>
            <h3 className="font-display text-base font-semibold text-earth-900 leading-snug">
              {item.rotation.name}
            </h3>
            <p className="text-sm text-earth-500 mt-1 leading-relaxed line-clamp-2">
              {item.rotation.description}
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-earth-50 text-earth-400 transition-colors shrink-0"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Crop sequence badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4">
          {crops.map((crop, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span
                className={`rounded-md px-2 py-1 text-xs font-medium ${
                  CATEGORY_COLORS[crop.category] || "bg-earth-100 text-earth-700"
                }`}
              >
                {crop.name}
              </span>
              {i < 2 && <span className="text-earth-300 text-xs">→</span>}
            </div>
          ))}
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          {[
            { label: "Water", value: item.waterScore },
            { label: "Nitrogen", value: item.nitrogenScore },
            { label: "OM", value: item.organicMatterScore },
            { label: "Drought", value: item.droughtScore },
            { label: "Yield", value: item.yieldScore },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-[10px] text-earth-400 uppercase tracking-wide">
                {m.label}
              </p>
              <p
                className={`text-sm font-bold ${
                  m.value >= 75
                    ? "text-foliage-600"
                    : m.value >= 50
                    ? "text-sun-600"
                    : "text-red-500"
                }`}
              >
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 border-t border-earth-100 pt-4 animate-fade-in">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="text-xs font-semibold text-foliage-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Pros
                </h4>
                <ul className="space-y-1.5">
                  {item.rotation.pros.map((pro, i) => (
                    <li
                      key={i}
                      className="text-sm text-earth-600 flex items-start gap-2"
                    >
                      <span className="text-foliage-500 mt-0.5">·</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <X className="h-3.5 w-3.5" /> Cons
                </h4>
                <ul className="space-y-1.5">
                  {item.rotation.cons.map((con, i) => (
                    <li
                      key={i}
                      className="text-sm text-earth-600 flex items-start gap-2"
                    >
                      <span className="text-red-400 mt-0.5">·</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-earth-50 p-3">
              <p className="text-sm text-earth-700 leading-relaxed">
                {item.recommendation}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="rounded-lg bg-sky-50 px-3 py-2">
                <p className="text-xs text-sky-600">Est. Irrigation</p>
                <p className="text-sm font-semibold text-sky-900">
                  {item.estimatedIrrigationMm} mm/yr
                </p>
              </div>
              <div className="rounded-lg bg-foliage-50 px-3 py-2">
                <p className="text-xs text-foliage-600">N Balance</p>
                <p className="text-sm font-semibold text-foliage-900">
                  {item.nitrogenBalance > 0 ? "+" : ""}
                  {item.nitrogenBalance} kg/ha
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function RotationComparison({ scores, bestId }: RotationComparisonProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 mt-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-earth-900">
            All Rotation Plans Compared
          </h2>
          <p className="text-sm text-earth-500 mt-1">
            {scores.length} rotations scored against your region, soil, and
            priority. Click any card to expand details.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {scores.map((item, i) => (
          <RotationCard
            key={item.rotation.id}
            item={item}
            isBest={item.rotation.id === bestId}
            rank={i + 1}
          />
        ))}
      </div>
    </section>
  );
}
