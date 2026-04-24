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
  isBookmarked: boolean;
  onPresetChange: (preset: DatePreset) => void;
  onToggleBookmark: () => void;
};

function SchemeSummaryComponent({
  selectedScheme,
  selectedPreset,
  stats,
  latestNavDate,
  isBookmarked,
  onPresetChange,
  onToggleBookmark,
}: SchemeSummaryProps) {
  const periodChangeValueClassName = !stats
    ? undefined
    : stats.periodChange >= 0
      ? "text-emerald-400"
      : "text-red-400";
  const returnPctValueClassName = !stats
    ? undefined
    : stats.periodChangePct >= 0
      ? "text-emerald-400"
      : "text-red-400";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2">
          <div>
            <h2 className="text-lg font-semibold">
              {selectedScheme?.scheme_name ?? "Select a scheme"}
            </h2>
            <p className="text-xs text-slate-400">
              {selectedScheme?.fund_house} | {selectedScheme?.scheme_category}
            </p>
          </div>
          <button
            onClick={onToggleBookmark}
            disabled={!selectedScheme}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            className={`rounded-md border p-1.5 transition ${
              isBookmarked
                ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill={isBookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
            </svg>
          </button>
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
          valueClassName={periodChangeValueClassName}
        />
        <StatCard
          label="Return %"
          value={
            stats
              ? `${stats.periodChangePct >= 0 ? "+" : ""}${stats.periodChangePct.toFixed(2)}%`
              : "-"
          }
          valueClassName={returnPctValueClassName}
        />
      </div>
    </div>
  );
}

export const SchemeSummary = memo(SchemeSummaryComponent);
