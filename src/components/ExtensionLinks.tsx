import { ExternalLink, Landmark, FileText } from "lucide-react";
import type { Region } from "@/lib/types";

interface ExtensionLinksProps {
  region: Region;
}

export function ExtensionLinks({ region }: ExtensionLinksProps) {
  const usdaUrl = `https://www.nrcs.usda.gov/conservation-basics/natural-resource-concerns/${region.state.toLowerCase()}`;
  const agcensusUrl = `https://www.nass.usda.gov/Statistics_by_State/${region.state.replace(/\s/g, "_")}/index.php`;

  return (
    <section className="mx-auto max-w-7xl px-6 mt-10">
      <div className="rounded-2xl bg-earth-50 ring-1 ring-earth-200/60 p-6 lg:p-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-earth-100">
            <Landmark className="h-5 w-5 text-earth-600" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-earth-900">
              Local Extension & Resources
            </h2>
            <p className="text-sm text-earth-500">
              Connect with {region.state} agricultural experts for planting
              dates, yield benchmarks, and cost-share programs.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-5">
          <a
            href={region.extensionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-xl bg-white px-5 py-4 ring-1 ring-earth-200/60 hover:ring-foliage-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-foliage-600" />
              <div>
                <p className="text-sm font-semibold text-earth-900">
                  {region.state} Extension
                </p>
                <p className="text-xs text-earth-500">
                  Crop guides & planting dates
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-earth-300 group-hover:text-foliage-600 transition-colors" />
          </a>

          <a
            href={usdaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-xl bg-white px-5 py-4 ring-1 ring-earth-200/60 hover:ring-foliage-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5 text-sky-600" />
              <div>
                <p className="text-sm font-semibold text-earth-900">
                  USDA NRCS {region.state}
                </p>
                <p className="text-xs text-earth-500">
                  Conservation programs
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-earth-300 group-hover:text-sky-600 transition-colors" />
          </a>

          <a
            href={agcensusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-xl bg-white px-5 py-4 ring-1 ring-earth-200/60 hover:ring-foliage-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-sun-600" />
              <div>
                <p className="text-sm font-semibold text-earth-900">
                  USDA NASS {region.state}
                </p>
                <p className="text-xs text-earth-500">
                  Yield benchmarks & stats
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-earth-300 group-hover:text-sun-600 transition-colors" />
          </a>
        </div>
      </div>
    </section>
  );
}
