import { Sprout, Satellite, BarChart3 } from "lucide-react";

export function Hero() {
  return (
    <header className="relative overflow-hidden bg-foliage-950 text-white">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-foliage-500 blur-3xl" />
        <div className="absolute top-20 -left-20 h-80 w-80 rounded-full bg-sky-500 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foliage-500/20 ring-1 ring-foliage-400/30">
            <Sprout className="h-6 w-6 text-foliage-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-foliage-200">Field Shift</p>
            <p className="text-xs text-foliage-400">NASA Space Apps Challenge</p>
          </div>
        </div>

        <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl max-w-3xl">
          Adapting Farms with{" "}
          <span className="text-foliage-300">NASA Earth Data</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foliage-100">
          Pick your region, soil type, and priority. We pull a decade of
          satellite-observed precipitation and temperature trends from NASA
          POWER, then score 3-year crop rotation schedules for water use,
          nitrogen restoration, and soil resilience.
        </p>

        <div className="mt-8 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2 text-foliage-200">
            <Satellite className="h-4 w-4 text-foliage-400" />
            <span>NASA POWER Climate API</span>
          </div>
          <div className="flex items-center gap-2 text-foliage-200">
            <BarChart3 className="h-4 w-4 text-foliage-400" />
            <span>8 Rotation Plans Scored</span>
          </div>
          <div className="flex items-center gap-2 text-foliage-200">
            <Sprout className="h-4 w-4 text-foliage-400" />
            <span>10 US Agricultural Regions</span>
          </div>
        </div>
      </div>
    </header>
  );
}
