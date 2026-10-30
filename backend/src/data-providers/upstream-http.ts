import { createHash } from 'node:crypto';
import axios, { AxiosInstance } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { getProxyForUrl } from 'proxy-from-env';
import type { Provider, Source } from '../racing/model';
export class UpstreamError extends Error {
  constructor(
    readonly code: string,
    readonly status?: number,
    readonly retryAfterSeconds?: number,
  ) {
    super(code);
  }
}
export interface Observation<T> {
  value: T;
  source: Source;
}
export const hash = (value: unknown): string =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');
const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
/** Per-process bounded cache + single-flight + provider budget. No persistent synchronization. */
export class UpstreamHttp {
  private readonly cache = new Map<
    string,
    { expiresAt: number; generation: number; observation: Observation<unknown> }
  >();
  private readonly inFlight = new Map<string, Promise<Observation<unknown>>>();
  private readonly generations = new Map<string, number>();
  private readonly calls: number[] = [];
  private gate: Promise<void> = Promise.resolve();
  private nextAt = 0;
  private blockedUntil = 0;
  private queued = 0;
  readonly http: AxiosInstance;
  constructor(
    readonly provider: Provider,
    baseURL: string,
    private readonly budget: {
      intervalMs: number;
      count: number;
      spacingMs: number;
    },
    http?: AxiosInstance,
  ) {
    const proxy = getProxyForUrl(baseURL);
    this.http =
      http ??
      axios.create({
        baseURL,
        // HTTPS CONNECT works with managed forward proxies; honors NO_PROXY.
        proxy: false,
        httpsAgent: proxy ? new HttpsProxyAgent(proxy) : undefined,
        timeout: 8000,
        maxContentLength: 5_000_000,
        headers: { 'User-Agent': 'OpenGP/1.0' },
      });
  }
  invalidate(prefix: string, contains = '') {
    for (const key of new Set([
      ...this.cache.keys(),
      ...[...this.inFlight.keys()].map((k) => k.replace(/@\d+$/, '')),
    ])) {
      if (key.startsWith(prefix) && key.includes(contains)) {
        this.cache.delete(key);
        this.generations.set(key, (this.generations.get(key) ?? 0) + 1);
      }
    }
  }
  async get(
    path: string,
    params: Record<string, string | number> = {},
    ttlMs = 300_000,
  ): Promise<Observation<unknown>> {
    const key = `${path}?${new URLSearchParams(
      Object.entries(params)
        .sort()
        .map(([k, v]) => [k, String(v)]),
    )}`;
    const hit = this.cache.get(key);
    if (hit && hit.expiresAt > Date.now()) return hit.observation;
    const generation = this.generations.get(key) ?? 0;
    const flightKey = `${key}@${generation}`;
    const existing = this.inFlight.get(flightKey);
    if (existing) return existing;
    const pending = this.request(path, params)
      .then((value) => {
        const observation: Observation<unknown> = {
          value,
          source: {
            provider: this.provider,
            resource: key,
            observedAt: new Date().toISOString(),
            contentHash: hash(value),
            mappingVersion: '1',
            attribution:
              this.provider === 'jolpica'
                ? 'Jolpica-F1 · CC BY-NC-SA 4.0'
                : 'OpenF1 · CC BY-NC-SA 4.0',
          },
        };
        if ((this.generations.get(key) ?? 0) === generation) {
          if (this.cache.size >= 256) {
            const oldest = this.cache.keys().next().value as string | undefined;
            if (oldest) this.cache.delete(oldest);
          }
          this.cache.set(key, {
            observation,
            generation,
            expiresAt: Date.now() + ttlMs,
          });
        }
        return observation;
      })
      .finally(() => this.inFlight.delete(flightKey));
    this.inFlight.set(flightKey, pending);
    return pending;
  }
  private async acquire() {
    if (this.queued >= 12) throw new UpstreamError('UPSTREAM_BUSY', 429, 10);
    this.queued++;
    const slot = this.gate
      .then(async () => {
        const now = Date.now();
        while (
          this.calls.length &&
          this.calls[0] <= now - this.budget.intervalMs
        )
          this.calls.shift();
        if (this.blockedUntil > now)
          throw new UpstreamError(
            'UPSTREAM_RATE_LIMIT',
            429,
            Math.ceil((this.blockedUntil - now) / 1000),
          );
        if (this.calls.length >= this.budget.count)
          throw new UpstreamError(
            'UPSTREAM_RATE_LIMIT',
            429,
            Math.ceil((this.calls[0] + this.budget.intervalMs - now) / 1000),
          );
        await delay(Math.max(0, this.nextAt - now));
        this.calls.push(Date.now());
        this.nextAt = Date.now() + this.budget.spacingMs;
      })
      .finally(() => this.queued--);
    this.gate = slot.catch(() => undefined);
    await slot;
  }
  private async request(
    path: string,
    params: Record<string, string | number>,
  ): Promise<unknown> {
    for (let attempt = 0; attempt < 3; attempt++) {
      await this.acquire();
      try {
        return (await this.http.get<unknown>(path, { params })).data;
      } catch (error) {
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;
        const rawRetry: unknown = axios.isAxiosError(error)
          ? error.response?.headers['retry-after']
          : undefined;
        const parsed =
          typeof rawRetry === 'string'
            ? Number.isFinite(Number(rawRetry))
              ? Number(rawRetry)
              : (Date.parse(rawRetry) - Date.now()) / 1000
            : typeof rawRetry === 'number'
              ? rawRetry
              : NaN;
        const retry = Number.isFinite(parsed)
          ? Math.max(1, Math.ceil(parsed))
          : 2 ** attempt;
        const retryable = !status || status >= 500 || status === 429;
        if (status === 429) this.blockedUntil = Date.now() + retry * 1000;
        if (status === 401 || status === 403)
          throw new UpstreamError('ACCESS_RESTRICTED', status);
        if (!retryable || attempt === 2 || retry > 3)
          throw new UpstreamError(
            status === 429
              ? 'UPSTREAM_RATE_LIMIT'
              : status === 404
                ? 'UPSTREAM_NOT_FOUND'
                : status
                  ? 'UPSTREAM_ERROR'
                  : 'UPSTREAM_TIMEOUT',
            status,
            status === 429 ? retry : undefined,
          );
        await delay(retry * 1000);
      }
    }
    throw new UpstreamError('UPSTREAM_ERROR');
  }
}
