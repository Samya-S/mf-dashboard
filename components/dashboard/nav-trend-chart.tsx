import { memo } from "react";
import { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/lib/dashboard-types";
import { formatCurrency } from "@/lib/dashboard-utils";

type NavTrendChartProps = {
  loadingHistory: boolean;
  chartData: ChartPoint[];
};

function NavTrendChartComponent({ loadingHistory, chartData }: NavTrendChartProps) {
  const chartHostRef = useRef<HTMLDivElement | null>(null);
  const [hasValidSize, setHasValidSize] = useState(false);

  useEffect(() => {
    const element = chartHostRef.current;
    if (!element) return;

    const updateSize = () => {
      setHasValidSize(element.clientWidth > 0 && element.clientHeight > 0);
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">NAV Trend</h3>
      <div ref={chartHostRef} className="h-[360px] min-h-[360px] min-w-0">
        {loadingHistory ? (
          <p className="pt-20 text-center text-sm text-slate-400">
            Loading NAV history...
          </p>
        ) : chartData.length === 0 ? (
          <p className="pt-20 text-center text-sm text-slate-400">
            No chart data for this range.
          </p>
        ) : !hasValidSize ? (
          <p className="pt-20 text-center text-sm text-slate-400">
            Preparing chart...
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="label"
                minTickGap={25}
                stroke="#cbd5e1"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="#cbd5e1"
                width={25}
                tickFormatter={(value) => `₹${value.toFixed(0)}`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                }}
                labelStyle={{ color: "#e2e8f0" }}
                formatter={(value) => {
                  const numericValue =
                    typeof value === "number" ? value : Number(value);
                  return [formatCurrency(numericValue), "NAV"];
                }}
              />
              <Line
                type="monotone"
                dataKey="nav"
                stroke="#818cf8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export const NavTrendChart = memo(NavTrendChartComponent);
