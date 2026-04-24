export type CacheEntry<T> = {
  expiresAt: number;
  data: T;
};

export function getCachedValue<K extends string | number, T>(
  cache: Map<K, CacheEntry<T>>,
  key: K,
): T | null {
  const cached = cache.get(key);

  if (!cached) return null;

  if (Date.now() > cached.expiresAt) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

export function setCachedValue<K extends string | number, T>(
  cache: Map<K, CacheEntry<T>>,
  key: K,
  data: T,
  ttlMs: number,
) {
  cache.set(key, {
    expiresAt: Date.now() + ttlMs,
    data,
  });
}
