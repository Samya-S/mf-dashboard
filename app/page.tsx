"use client";

import { NavTrendChart } from "@/components/dashboard/nav-trend-chart";
import { SchemeListPanel } from "@/components/dashboard/scheme-list-panel";
import { SchemeSummary } from "@/components/dashboard/scheme-summary";
import { useMfDashboard } from "@/hooks/use-mf-dashboard";

export default function Home() {
  const {
    query,
    selectedCode,
    selectedPreset,
    loadingHistory,
    loadingList,
    error,
    chartData,
    stats,
    latestNavDate,
    shownSchemes,
    selectedScheme,
    bookmarkedCodes,
    setQuery,
    setSelectedCode,
    setSelectedPreset,
    toggleBookmark,
  } = useMfDashboard();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Mutual Fund NAV Dashboard
          </h1>
          <p className="text-sm text-slate-300">
            Explore Indian mutual funds with searchable schemes, live NAV snapshots, and trend analytics.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-red-400/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <SchemeListPanel
            query={query}
            loadingList={loadingList}
            shownSchemes={shownSchemes}
            bookmarkedCodes={bookmarkedCodes}
            selectedCode={selectedCode}
            onQueryChange={setQuery}
            onSelectScheme={setSelectedCode}
          />

          <section className="space-y-4">
            <SchemeSummary
              selectedScheme={selectedScheme}
              selectedPreset={selectedPreset}
              stats={stats}
              latestNavDate={latestNavDate}
              isBookmarked={bookmarkedCodes.includes(selectedCode)}
              onPresetChange={setSelectedPreset}
              onToggleBookmark={() =>
                toggleBookmark(selectedCode, selectedScheme?.scheme_name)
              }
            />
            <NavTrendChart loadingHistory={loadingHistory} chartData={chartData} />
          </section>
        </div>

        <footer className="mt-8 border-t border-slate-800 pt-4 text-center text-sm text-slate-400">
          Data powered by{" "}
          <a
            href="https://www.mfapi.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-200 hover:text-indigo-300"
          >
            MFAPI
          </a>
          .
          <br />
          Made with ❤️ from{" "}
          <a
            href="https://samyasaha.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-slate-200 hover:text-indigo-300"
          >
            Samya
          </a>
        </footer>
      </div>
    </main>
  );
}
