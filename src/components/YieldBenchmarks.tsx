import { useEffect, useState } from "react";
import {
  Search,
  ExternalLink,
  Loader2,
  TrendingUp,
  AlertCircle,
  Database,
} from "lucide-react";
import type { Region } from "@/lib/types";

interface YieldResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

interface YieldSearchResponse {
  query: string;
  results: YieldResult[];
  knowledgeGraph: { title: string; description: string; source: string } | null;
  totalResults: number;
  error?: string;
}

interface YieldBenchmarksProps {
  region: Region;
  bestRotationName: string;
  analysisKey: string;
}

export function YieldBenchmarks({
  region,
  bestRotationName,
  analysisKey,
}: YieldBenchmarksProps) {
  const [results, setResults] = useState<YieldResult[]>([]);
  const [knowledgeGraph, setKnowledgeGraph] =
    useState<YieldSearchResponse["knowledgeGraph"]>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function searchYields() {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const query = `${region.state} crop yield per acre ${bestRotationName} 2024`;
        const functionUrl = `${
          import.meta.env.VITE_SUPABASE_URL
        }/functions/v1/crop-yield-search?query=${encodeURIComponent(query)}`;

        const response = await fetch(functionUrl, {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Search service returned ${response.status}`);
        }

        const data: YieldSearchResponse = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setResults(data.results || []);
        setKnowledgeGraph(data.knowledgeGraph || null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Search failed";
        setError(message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    searchYields();
  }, [region.state, bestRotationName, analysisKey]);

  return (
    <section className="mx-auto max-w-7xl px-6 mt-10">
      <div className="rounded-2xl bg-white ring-1 ring-earth-200/60 p-6 lg:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sun-100">
            <Search className="h-5 w-5 text-sun-600" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-earth-900">
              Regional Yield Benchmarks
            </h2>
            <p className="text-sm text-earth-500">
              Live web results for crop yield data in {region.state}, tailored
              to your recommended rotation
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 gap-3 text-earth-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">
              Searching for {region.state} yield data...
            </span>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-start gap-3 rounded-xl bg-sun-50 ring-1 ring-sun-200 px-5 py-4">
            <AlertCircle className="h-5 w-5 text-sun-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-sun-900">
                Yield search unavailable
              </p>
              <p className="text-sm text-sun-700 mt-1">
                {error}. The SerpApi key may not be configured yet — extension
                office links below still provide yield benchmark resources.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && knowledgeGraph && (
          <div className="rounded-xl bg-foliage-50 ring-1 ring-foliage-200 p-5 mb-4">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-foliage-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foliage-900">
                  {knowledgeGraph.title}
                </p>
                {knowledgeGraph.description && (
                  <p className="text-sm text-foliage-700 mt-1 leading-relaxed">
                    {knowledgeGraph.description.slice(0, 300)}
                    {knowledgeGraph.description.length > 300 ? "..." : ""}
                  </p>
                )}
                {knowledgeGraph.source && (
                  <a
                    href={knowledgeGraph.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-foliage-600 mt-2 hover:underline"
                  >
                    View source <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, i) => (
              <a
                key={i}
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-earth-100 px-5 py-4 hover:border-foliage-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-3.5 w-3.5 text-earth-400 group-hover:text-foliage-500 transition-colors" />
                  <span className="text-xs text-earth-400">
                    {result.source || "Web result"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-earth-900 group-hover:text-foliage-700 transition-colors">
                  {result.title}
                </p>
                {result.snippet && (
                  <p className="text-sm text-earth-500 mt-1 leading-relaxed line-clamp-2">
                    {result.snippet}
                  </p>
                )}
                <div className="flex items-center gap-1 text-xs text-foliage-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Visit page <ExternalLink className="h-3 w-3" />
                </div>
              </a>
            ))}
          </div>
        )}

        {!loading && !error && results.length === 0 && !knowledgeGraph && hasSearched && (
          <div className="text-center py-8">
            <p className="text-sm text-earth-500">
              No yield benchmark results found. Try the extension office links
              below for local data.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
