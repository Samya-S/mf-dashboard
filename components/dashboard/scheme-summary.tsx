import { memo } from "react";
import type { DashboardStats, DatePreset } from "@/lib/dashboard-types";
import type { SchemeMeta } from "@/lib/mfapi";
import { DATE_PRESETS, formatCurrency } from "@/lib/dashboard-utils";
import { StatCard } from "@/components/dashboard/stat-card";

type SchemeSummaryProps = {
  selectedScheme?: SchemeMeta;
  selectedPreset: DatePreset;
  stats: DashboardStats | null;
  latestNavDate?: string;
  onPresetChange: (preset: DatePreset) => void;
};

function SchemeSummaryComponent({
  selectedScheme,
  selectedPreset,
  stats,
  latestNavDate,
  onPresetChange,
}: SchemeSummaryProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            {selectedScheme?.scheme_name ?? "Select a scheme"}
          </h2>
          <p className="text-xs text-slate-400">
            {selectedScheme?.fund_house} | {selectedScheme?.scheme_category}
          </p>
        </div>
        <div className="flex gap-2">
          {DATE_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => onPresetChange(preset)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                preset === selectedPreset
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Latest NAV"
          value={stats ? formatCurrency(stats.latestNav) : "-"}
          meta={latestNavDate ?? "-"}
        />
        <StatCard
          label="Period Change"
          value={
            stats
              ? `${stats.periodChange >= 0 ? "+" : ""}${formatCurrency(stats.periodChange)}`
              : "-"
          }
        />
        <StatCard
          label="Return %"
          value={
            stats
              ? `${stats.periodChangePct >= 0 ? "+" : ""}${stats.periodChangePct.toFixed(2)}%`
              : "-"
          }
        />
      </div>
    </div>
  );
}

export const SchemeSummary = memo(SchemeSummaryComponent);
