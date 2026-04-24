import { memo } from "react";
import type { SchemeListItem } from "@/lib/mfapi";

type SchemeListPanelProps = {
  query: string;
  loadingList: boolean;
  shownSchemes: SchemeListItem[];
  selectedCode: string;
  onQueryChange: (value: string) => void;
  onSelectScheme: (schemeCode: string) => void;
};

function SchemeListPanelComponent({
  query,
  loadingList,
  shownSchemes,
  selectedCode,
  onQueryChange,
  onSelectScheme,
}: SchemeListPanelProps) {
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
      <div className="custom-scrollbar max-h-[65vh] space-y-2 overflow-auto pr-2">
        {loadingList ? (
          <p className="text-sm text-slate-400">Loading schemes...</p>
        ) : (
          shownSchemes.map((scheme) => {
            const active = String(scheme.schemeCode) === selectedCode;
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
                <p className="font-medium">{scheme.schemeName}</p>
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
