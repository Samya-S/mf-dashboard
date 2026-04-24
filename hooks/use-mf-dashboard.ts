"use client";

import { useEffect, useMemo, useState } from "react";
import type { DatePreset } from "@/lib/dashboard-types";
import { fetchJsonWithCache } from "@/lib/client-cache";
import { getDateRange, toChartData, toStats } from "@/lib/dashboard-utils";
import type { SchemeHistoryResponse, SchemeListItem } from "@/lib/mfapi";

const LIST_TTL_MS = 60 * 60 * 1000;
const SEARCH_TTL_MS = 10 * 60 * 1000;
const HISTORY_TTL_MS = 30 * 60 * 1000;
const LATEST_TTL_MS = 5 * 60 * 1000;

export function useMfDashboard() {
  const [list, setList] = useState<SchemeListItem[]>([]);
  const [searchResults, setSearchResults] = useState<SchemeListItem[]>([]);
  const [query, setQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>("1Y");
  const [history, setHistory] = useState<SchemeHistoryResponse | null>(null);
  const [latest, setLatest] = useState<SchemeHistoryResponse | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadSchemes = async () => {
      try {
        setLoadingList(true);

        const data = await fetchJsonWithCache<SchemeListItem[]>(
          "list:limit=100:offset=0",
          "/api/mf/list?limit=100&offset=0",
          LIST_TTL_MS,
        );

        if (!mounted) return;

        setList(data);
        setSelectedCode((current) =>
          current || data.length === 0 ? current : String(data[0].schemeCode),
        );
      } catch (loadError) {
        if (mounted) setError(String(loadError));
      } finally {
        if (mounted) setLoadingList(false);
      }
    };

    loadSchemes();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const normalizedQuery = query.trim();
        const data = await fetchJsonWithCache<SchemeListItem[]>(
          `search:${normalizedQuery.toLowerCase()}`,
          `/api/mf/search?q=${encodeURIComponent(normalizedQuery)}`,
          SEARCH_TTL_MS,
        );
        setSearchResults(data);
      } catch (searchError) {
        setError(String(searchError));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const loadSchemeData = async () => {
      if (!selectedCode) return;
      const { startDate, endDate } = getDateRange(selectedPreset);

      try {
        setLoadingHistory(true);
        setError(null);

        const params = new URLSearchParams();
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        const historyUrl = `/api/mf/${selectedCode}?${params.toString()}`;
        const latestUrl = `/api/mf/${selectedCode}/latest`;
        const historyKey = `history:${selectedCode}:${selectedPreset}:${params.toString()}`;
        const latestKey = `latest:${selectedCode}`;

        const [historyData, latestData] = await Promise.all([
          fetchJsonWithCache<SchemeHistoryResponse>(
            historyKey,
            historyUrl,
            HISTORY_TTL_MS,
          ),
          fetchJsonWithCache<SchemeHistoryResponse>(
            latestKey,
            latestUrl,
            LATEST_TTL_MS,
          ),
        ]);

        setHistory(historyData);
        setLatest(latestData);
      } catch (schemeError) {
        setError(String(schemeError));
      } finally {
        setLoadingHistory(false);
      }
    };

    loadSchemeData();
  }, [selectedCode, selectedPreset]);

  const chartData = useMemo(() => {
    if (!history?.data?.length) return [];
    return toChartData(history.data);
  }, [history]);

  const stats = useMemo(() => {
    return toStats(chartData, latest?.data?.[0]?.nav);
  }, [chartData, latest]);

  const shownSchemes = query.trim() ? searchResults : list;
  const selectedScheme = history?.meta ?? latest?.meta;

  return {
    list,
    searchResults,
    query,
    selectedCode,
    selectedPreset,
    history,
    latest,
    loadingHistory,
    loadingList,
    error,
    chartData,
    stats,
    shownSchemes,
    selectedScheme,
    setQuery,
    setSelectedCode,
    setSelectedPreset,
  };
}
