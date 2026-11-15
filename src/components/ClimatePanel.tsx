import {
  CloudRain,
  Thermometer,
  TrendingUp,
  TrendingDown,
  Minus,
  Satellite,
} from "lucide-react";
import type { ClimateData } from "@/lib/types";

interface ClimatePanelProps {
  climate: ClimateData;
}

function TrendBadge({
  trend,
  pct,
  label,
}: {
  trend: "rising" | "falling" | "stable";
  pct: number;
  label: string;
}) {
  const config = {
    rising: {
      icon: TrendingUp,
      color: "text-sun-600 bg-sun-50",
      text: "Rising",
    },
    falling: {
      icon: TrendingDown,
      color: "text-sky-600 bg-sky-50",
      text: "Declining",
    },
    stable: {
      icon: Minus,
      color: "text-earth-500 bg-earth-100",
      text: "Stable",
    },
  }[trend];

  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.color}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}: {config.text}
      {pct !== 0 && (
        <span className="font-semibold">
          ({pct > 0 ? "+" : ""}
          {pct}%)
        </span>
      )}
    </div>
  );
}

function MiniBarChart({
  data,
  color,
  unit,
  max,
}: {
  data: { month: string; value: number }[];
  color: string;
  unit: string;
  max: number;
}) {
  return (
    <div className="flex items-end justify-between gap-1 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t ${color} transition-all duration-500`}
            style={{
              height: `${(d.value / max) * 100}%`,
              minHeight: "2px",
            }}
            title={`${d.month}: ${d.value}${unit}`}
          />
          <span className="text-[9px] text-earth-400 font-medium">
            {d.month[0]}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ClimatePanel({ climate }: ClimatePanelProps) {
  const precipData = climate.monthlyPrecip.map((m) => ({
    month: m.month,
    value: m.mm,
  }));
  const tempData = climate.monthlyTemp.map((m) => ({
    month: m.month,
    value: m.tempC,
  }));

  const maxPrecip = Math.max(...precipData.map((d) => d.value), 1);
  const maxTemp = Math.max(...tempData.map((d) => d.value), 1);
  const minTemp = Math.min(...tempData.map((d) => d.value), 0);

  return (
    <section className="animate-slide-up">
      <div className="mx-auto max-w-7xl px-6 mt-10">
        <div className="flex items-center gap-2 mb-4">
          <Satellite className="h-5 w-5 text-sky-600" />
          <h2 className="font-display text-xl font-semibold text-earth-900">
            Climate Data for {climate.regionName}
          </h2>
          <span className="text-xs text-earth-400 ml-2">
            NASA POWER · {climate.yearsAnalyzed} years analyzed
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Precipitation Card */}
          <div className="rounded-2xl bg-white ring-1 ring-earth-200/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100">
                  <CloudRain className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-earth-500">
                    Annual Precipitation
                  </p>
                  <p className="text-2xl font-bold text-earth-900">
                    {climate.annualPrecipMm}
                    <span className="text-base font-normal text-earth-400">
                      {" "}
                      mm/yr
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <TrendBadge
              trend={climate.precipTrend}
              pct={climate.precipTrendPct}
              label="10-yr"
            />
            <div className="mt-4">
              <p className="text-xs text-earth-400 mb-2 font-medium">
                Monthly average (mm)
              </p>
              <MiniBarChart
                data={precipData}
                color="bg-sky-400"
                unit="mm"
                max={maxPrecip}
              />
            </div>
          </div>

          {/* Temperature Card */}
          <div className="rounded-2xl bg-white ring-1 ring-earth-200/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sun-100">
                  <Thermometer className="h-5 w-5 text-sun-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-earth-500">
                    Avg Temperature
                  </p>
                  <p className="text-2xl font-bold text-earth-900">
                    {climate.avgTempC}
                    <span className="text-base font-normal text-earth-400">
                      {" "}
                      °C
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <TrendBadge
              trend={climate.tempTrend}
              pct={climate.tempTrendPct}
              label="10-yr"
            />
            <div className="mt-4">
              <p className="text-xs text-earth-400 mb-2 font-medium">
                Monthly average (°C)
              </p>
              <div className="flex items-end justify-between gap-1 h-24">
                {tempData.map((d, i) => {
                  const range = maxTemp - minTemp;
                  const heightPct =
                    range > 0 ? ((d.value - minTemp) / range) * 100 : 50;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-sun-300 to-sun-500 transition-all duration-500"
                        style={{
                          height: `${heightPct}%`,
                          minHeight: "4px",
                        }}
                        title={`${d.month}: ${d.value}°C`}
                      />
                      <span className="text-[9px] text-earth-400 font-medium">
                        {d.month[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Summary Stats Card */}
          <div className="rounded-2xl bg-foliage-900 p-6 text-white shadow-sm">
            <h3 className="font-display text-lg font-semibold mb-4">
              Region Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-foliage-700/50 pb-3">
                <span className="text-sm text-foliage-200">Max temp</span>
                <span className="text-sm font-semibold">
                  {climate.maxTempC}°C
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-foliage-700/50 pb-3">
                <span className="text-sm text-foliage-200">Min temp</span>
                <span className="text-sm font-semibold">
                  {climate.minTempC}°C
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-foliage-700/50 pb-3">
                <span className="text-sm text-foliage-200">Data years</span>
                <span className="text-sm font-semibold">
                  {climate.yearsAnalyzed}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-foliage-700/50 pb-3">
                <span className="text-sm text-foliage-200">Coordinates</span>
                <span className="text-sm font-mono text-foliage-300">
                  {climate.lat}°, {climate.lon}°
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foliage-200">Data source</span>
                <span className="text-xs font-semibold text-foliage-300">
                  NASA POWER
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
