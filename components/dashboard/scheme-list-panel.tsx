import { memo } from "react";
import type { SchemeListItem } from "@/lib/mfapi";

type SchemeListPanelProps = {
  query: string;
  loadingList: boolean;
  shownSchemes: SchemeListItem[];
  bookmarkedCodes: string[];
  selectedCode: string;
  onQueryChange: (value: string) => void;
  onSelectScheme: (schemeCode: string) => void;
};

function SchemeListPanelComponent({
  query,
  loadingList,
  shownSchemes,
  bookmarkedCodes,
  selectedCode,
  onQueryChange,
  onSelectScheme,
}: SchemeListPanelProps) {
  const bookmarkedSet = new Set(bookmarkedCodes);

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="mb-3 text-lg font-semibold">Schemes</h2>
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search schemes (e.g. HDFC)"
        className="mb-3 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500"
      />
      <p className="mb-2 text-xs text-slate-400">
        {query ? "Search results" : "Top 100 schemes"}
      </p>
      <div className="custom-scrollbar max-h-[42vh] space-y-2 overflow-auto pr-2 sm:max-h-[55vh] lg:max-h-[65vh]">
        {loadingList ? (
          <p className="text-sm text-slate-400">Loading schemes...</p>
        ) : (
          shownSchemes.map((scheme) => {
            const active = String(scheme.schemeCode) === selectedCode;
            const isBookmarked = bookmarkedSet.has(String(scheme.schemeCode));
            return (
              <button
                key={scheme.schemeCode}
                onClick={() => onSelectScheme(String(scheme.schemeCode))}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  active
                    ? "border-indigo-500 bg-indigo-500/20"
                    : "border-slate-800 bg-slate-950 hover:border-slate-600"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{scheme.schemeName}</p>
                  {isBookmarked && (
                    <span
                      aria-label="Bookmarked fund"
                      title="Bookmarked fund"
                      className="inline-flex shrink-0 p-1 text-indigo-100"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{scheme.schemeCode}</p>
              </button>
            );
          })
        )}
        {!loadingList && shownSchemes.length === 0 && (
          <p className="text-sm text-slate-400">No schemes found.</p>
        )}
      </div>
    </section>
  );
}

export const SchemeListPanel = memo(SchemeListPanelComponent);
