type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const responseCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

export async function fetchJsonWithCache<T>(
  key: string,
  url: string,
  ttlMs: number,
): Promise<T> {
  const now = Date.now();
  const cachedEntry = responseCache.get(key) as CacheEntry<T> | undefined;

  if (cachedEntry && cachedEntry.expiresAt > now) {
    return cachedEntry.value;
  }

  const pending = inFlightRequests.get(key) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }

  const request = fetch(url).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Request failed (${response.status}) for ${url}`);
    }

    const data = (await response.json()) as T;
    responseCache.set(key, {
      value: data,
      expiresAt: Date.now() + ttlMs,
    });
    return data;
  });

  inFlightRequests.set(key, request);

  try {
    return await request;
  } finally {
    inFlightRequests.delete(key);
  }
}
