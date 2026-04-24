import type { ChartPoint, DashboardStats, DatePreset } from "@/lib/dashboard-types";
import type { NavPoint } from "@/lib/mfapi";

export const DATE_PRESETS: DatePreset[] = ["3M", "6M", "1Y", "3Y", "MAX"];

export const formatDateForApi = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};

export const parseMfDate = (value: string): Date => {
  const [day, month, year] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
};

export const getDateRange = (preset: DatePreset) => {
  const endDate = new Date();
  if (preset === "MAX") {
    return { startDate: undefined, endDate: formatDateForApi(endDate) };
  }

  const startDate = new Date(endDate);
  if (preset === "3M") startDate.setMonth(startDate.getMonth() - 3);
  if (preset === "6M") startDate.setMonth(startDate.getMonth() - 6);
  if (preset === "1Y") startDate.setFullYear(startDate.getFullYear() - 1);
  if (preset === "3Y") startDate.setFullYear(startDate.getFullYear() - 3);
  return {
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
  };
};

export const toChartData = (data: NavPoint[]): ChartPoint[] => {
  return [...data].reverse().map((point) => {
    const date = parseMfDate(point.date);
    return {
      label: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      }),
      nav: Number(point.nav),
    };
  });
};

export const toStats = (
  chartData: ChartPoint[],
  latestNav?: string,
): DashboardStats | null => {
  if (chartData.length < 2 || !latestNav) return null;
  const first = chartData[0].nav;
  const last = chartData[chartData.length - 1].nav;
  const change = last - first;
  const changePct = (change / first) * 100;
  return {
    latestNav: Number(latestNav),
    periodChange: change,
    periodChangePct: changePct,
  };
};
