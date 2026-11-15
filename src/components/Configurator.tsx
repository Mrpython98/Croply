import {
  MapPin,
  Layers,
  Target,
  Droplets,
  FlaskConical,
  Leaf,
  Sun,
  TrendingUp,
  Loader2,
  ArrowRight,
} from "lucide-react";
import type { PriorityKey, Region, SoilType, Priority } from "@/lib/types";
import { REGIONS } from "@/data/regions";

const PRIORITY_ICONS: Record<string, typeof Droplets> = {
  Droplets,
  FlaskConical,
  Leaf,
  Sun,
  TrendingUp,
};

interface ConfiguratorProps {
  selectedRegionId: string;
  selectedSoilId: string;
  selectedPriority: PriorityKey;
  isLoading: boolean;
  onRegionChange: (id: string) => void;
  onSoilChange: (id: string) => void;
  onPriorityChange: (key: PriorityKey) => void;
  onAnalyze: () => void;
  regions: Region[];
  soilTypes: SoilType[];
  priorities: Priority[];
}

export function Configurator({
  selectedRegionId,
  selectedSoilId,
  selectedPriority,
  isLoading,
  onRegionChange,
  onSoilChange,
  onPriorityChange,
  onAnalyze,
  regions,
  soilTypes,
  priorities,
}: ConfiguratorProps) {
  const selectedRegion = regions.find((r) => r.id === selectedRegionId);

  return (
    <section className="mx-auto max-w-7xl px-6 -mt-8 relative z-10">
      <div className="rounded-2xl bg-white shadow-xl ring-1 ring-earth-200/60 overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-3">
          {/* Region */}
          <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-earth-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100">
                <MapPin className="h-4 w-4 text-sky-600" />
              </div>
              <h2 className="font-display text-lg font-semibold text-earth-900">
                1. Region
              </h2>
            </div>
            <select
              value={selectedRegionId}
              onChange={(e) => {
                onRegionChange(e.target.value);
                const region = REGIONS.find((r) => r.id === e.target.value);
                if (region) onSoilChange(region.defaultSoil);
              }}
              className="w-full rounded-lg border border-earth-200 bg-earth-50/50 px-4 py-3 text-sm font-medium text-earth-900 focus:border-foliage-500 focus:ring-2 focus:ring-foliage-500/20 focus:outline-none transition-colors"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {selectedRegion && (
              <p className="mt-3 text-sm text-earth-600 leading-relaxed">
                {selectedRegion.description}
              </p>
            )}
            {selectedRegion && (
              <p className="mt-2 text-xs font-medium text-sky-600">
                {selectedRegion.lat}°N, {selectedRegion.lon}°W
              </p>
            )}
          </div>

          {/* Soil Type */}
          <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-earth-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-earth-100">
                <Layers className="h-4 w-4 text-earth-600" />
              </div>
              <h2 className="font-display text-lg font-semibold text-earth-900">
                2. Soil Type
              </h2>
            </div>
            <select
              value={selectedSoilId}
              onChange={(e) => onSoilChange(e.target.value)}
              className="w-full rounded-lg border border-earth-200 bg-earth-50/50 px-4 py-3 text-sm font-medium text-earth-900 focus:border-foliage-500 focus:ring-2 focus:ring-foliage-500/20 focus:outline-none transition-colors"
            >
              {soilTypes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            {(() => {
              const soil = soilTypes.find((s) => s.id === selectedSoilId);
              return soil ? (
                <p className="mt-3 text-sm text-earth-600 leading-relaxed">
                  {soil.description}
                </p>
              ) : null;
            })()}
          </div>

          {/* Priority */}
          <div className="p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sun-100">
                <Target className="h-4 w-4 text-sun-600" />
              </div>
              <h2 className="font-display text-lg font-semibold text-earth-900">
                3. Priority
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {priorities.map((p) => {
                const Icon = PRIORITY_ICONS[p.icon] || Target;
                const isActive = p.key === selectedPriority;
                return (
                  <button
                    key={p.key}
                    onClick={() => onPriorityChange(p.key)}
                    className={`flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                      isActive
                        ? "bg-foliage-50 ring-1 ring-foliage-300"
                        : "hover:bg-earth-50"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 mt-0.5 shrink-0 ${
                        isActive ? "text-foliage-600" : "text-earth-400"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isActive ? "text-foliage-900" : "text-earth-700"
                        }`}
                      >
                        {p.label}
                      </p>
                      <p className="text-xs text-earth-500 leading-snug mt-0.5">
                        {p.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <div className="border-t border-earth-100 bg-earth-50/50 px-6 py-5 lg:px-8">
          <button
            onClick={onAnalyze}
            disabled={isLoading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-foliage-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-foliage-600/20 transition-all hover:bg-foliage-700 hover:shadow-foliage-600/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Fetching NASA satellite data...
              </>
            ) : (
              <>
                Analyze Rotations
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
