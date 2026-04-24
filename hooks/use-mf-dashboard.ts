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

type BookmarkedScheme = {
  schemeCode: string;
  schemeName: string;
};

export function useMfDashboard() {
  const [list, setList] = useState<SchemeListItem[]>([]);
  const [searchResults, setSearchResults] = useState<SchemeListItem[]>([]);
  const [bookmarkedSchemes, setBookmarkedSchemes] = useState<BookmarkedScheme[]>(
    () => {
    if (typeof window === "undefined") return [];

    try {
      const stored = window.localStorage.getItem("mf-dashboard:bookmarks");
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((value): BookmarkedScheme | null => {
          if (typeof value === "string" || typeof value === "number") {
            const schemeCode = String(value).trim();
            if (!schemeCode) return null;
            return {
              schemeCode,
              schemeName: `Bookmarked fund (${schemeCode})`,
            };
          }

          if (!value || typeof value !== "object") return null;

          const maybeCode = "schemeCode" in value ? String(value.schemeCode).trim() : "";
          if (!maybeCode) return null;

          const maybeName =
            "schemeName" in value && typeof value.schemeName === "string"
              ? value.schemeName.trim()
              : "";

          return {
            schemeCode: maybeCode,
            schemeName: maybeName || `Bookmarked fund (${maybeCode})`,
          };
        })
        .filter((value): value is BookmarkedScheme => value !== null);
    } catch {
      return [];
    }
  });
  const [query, setQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string>("149039");
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
    window.localStorage.setItem(
      "mf-dashboard:bookmarks",
      JSON.stringify(bookmarkedSchemes),
    );
  }, [bookmarkedSchemes]);

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

  const shownSchemes = useMemo(() => {
    const sourceSchemes = query.trim() ? searchResults : list;
    if (bookmarkedSchemes.length === 0) return sourceSchemes;

    const bookmarkedSet = new Set(bookmarkedSchemes.map((item) => item.schemeCode));
    const persistedBookmarkItems: SchemeListItem[] = bookmarkedSchemes.map((item) => ({
      schemeCode: Number(item.schemeCode),
      schemeName: item.schemeName,
    }));
    const sortedSource = [...sourceSchemes].sort((left, right) => {
      const leftScore = bookmarkedSet.has(String(left.schemeCode)) ? 1 : 0;
      const rightScore = bookmarkedSet.has(String(right.schemeCode)) ? 1 : 0;
      return rightScore - leftScore;
    });
    const merged = [...persistedBookmarkItems, ...sortedSource];
    const seen = new Set<string>();

    return merged.filter((scheme) => {
      const key = String(scheme.schemeCode);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [query, searchResults, list, bookmarkedSchemes]);
  const selectedScheme = history?.meta ?? latest?.meta;
  const latestNavDate = latest?.data?.[0]?.date;
  const bookmarkedCodes = useMemo(
    () => bookmarkedSchemes.map((item) => item.schemeCode),
    [bookmarkedSchemes],
  );
  const toggleBookmark = (schemeCode: string, schemeName?: string) => {
    setBookmarkedSchemes((current) => {
      if (current.some((item) => item.schemeCode === schemeCode)) {
        return current.filter((item) => item.schemeCode !== schemeCode);
      }

      const fallbackNameFromLoadedData =
        list.find((scheme) => String(scheme.schemeCode) === schemeCode)?.schemeName ??
        searchResults.find((scheme) => String(scheme.schemeCode) === schemeCode)
          ?.schemeName;

      const resolvedName =
        schemeName?.trim() ||
        fallbackNameFromLoadedData ||
        `Bookmarked fund (${schemeCode})`;

      return [...current, { schemeCode, schemeName: resolvedName }];
    });
  };

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
    latestNavDate,
    shownSchemes,
    selectedScheme,
    bookmarkedCodes,
    setQuery,
    setSelectedCode,
    setSelectedPreset,
    toggleBookmark,
  };
}
