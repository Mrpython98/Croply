import { History, Trash2, MapPin, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import type { SavedReport } from "@/lib/types";
import { supabase } from "@/lib/supabase";

interface SavedReportsProps {
  refreshKey: number;
  onLoadReport: (report: SavedReport) => void;
}

export function SavedReports({ refreshKey, onLoadReport }: SavedReportsProps) {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("rotation_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (!cancelled) {
        if (!error && data) {
          setReports(data as unknown as SavedReport[]);
        }
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function handleDelete(id: string) {
    await supabase.from("rotation_reports").delete().eq("id", id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading && reports.length === 0) return null;
  if (reports.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 mt-10">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-earth-500" />
        <h2 className="font-display text-lg font-semibold text-earth-900">
          Saved Reports
        </h2>
        <span className="text-xs text-earth-400">
          Your last {reports.length} analyses
        </span>
      </div>

      <div className="space-y-2">
        {reports.map((report) => (
          <div
            key={report.id}
            className="group flex items-center justify-between rounded-xl bg-white ring-1 ring-earth-200/60 px-5 py-3.5 hover:ring-foliage-300 transition-all"
          >
            <button
              onClick={() => onLoadReport(report)}
              className="flex items-center gap-3 flex-1 text-left"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foliage-50">
                <MapPin className="h-4 w-4 text-foliage-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-earth-900">
                  {report.region_name}
                </p>
                <p className="text-xs text-earth-500">
                  {report.soil_type} · {report.priority.replace(/_/g, " ")}
                </p>
              </div>
            </button>
            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1 text-xs text-earth-400">
                <Clock className="h-3 w-3" />
                {new Date(report.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <button
                onClick={() => handleDelete(report.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-earth-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
