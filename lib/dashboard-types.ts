import type { SchemeHistoryResponse, SchemeListItem } from "@/lib/mfapi";

export type DatePreset = "3M" | "6M" | "1Y" | "3Y" | "MAX";

export type ChartPoint = {
  label: string;
  nav: number;
};

export type DashboardStats = {
  latestNav: number;
  periodChange: number;
  periodChangePct: number;
};

export type DashboardState = {
  list: SchemeListItem[];
  searchResults: SchemeListItem[];
  query: string;
  selectedCode: string;
  selectedPreset: DatePreset;
  history: SchemeHistoryResponse | null;
  latest: SchemeHistoryResponse | null;
  loadingHistory: boolean;
  loadingList: boolean;
  error: string | null;
  chartData: ChartPoint[];
  stats: DashboardStats | null;
  shownSchemes: SchemeListItem[];
  selectedScheme: SchemeHistoryResponse["meta"] | undefined;
};
