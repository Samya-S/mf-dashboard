const MF_API_BASE = "https://api.mfapi.in";

export type SchemeListItem = {
  schemeCode: number;
  schemeName: string;
};

export type NavPoint = {
  date: string;
  nav: string;
};

export type SchemeMeta = {
  fund_house: string;
  scheme_type: string;
  scheme_category: string;
  scheme_code: number;
  scheme_name: string;
  isin_growth: string | null;
  isin_div_reinvestment: string | null;
};

export type SchemeHistoryResponse = {
  meta: SchemeMeta;
  data: NavPoint[];
  status: string;
};

const withQuery = (
  url: string,
  query: Record<string, string | number | undefined>,
): string => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
};

const getJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`MFAPI request failed (${response.status}): ${url}`);
  }

  return (await response.json()) as T;
};

export const listSchemes = async (
  limit = 100,
  offset = 6,
): Promise<SchemeListItem[]> => {
  const url = withQuery(`${MF_API_BASE}/mf`, { limit, offset });
  return getJson<SchemeListItem[]>(url);
};

export const searchSchemes = async (q: string): Promise<SchemeListItem[]> => {
  const url = withQuery(`${MF_API_BASE}/mf/search`, { q });
  return getJson<SchemeListItem[]>(url);
};

export const getSchemeHistory = async (
  schemeCode: string,
  startDate?: string,
  endDate?: string,
): Promise<SchemeHistoryResponse> => {
  const url = withQuery(`${MF_API_BASE}/mf/${schemeCode}`, {
    startDate,
    endDate,
  });
  return getJson<SchemeHistoryResponse>(url);
};

export const getLatestNav = async (
  schemeCode: string,
): Promise<SchemeHistoryResponse> => {
  const url = `${MF_API_BASE}/mf/${schemeCode}/latest`;
  return getJson<SchemeHistoryResponse>(url);
};
