import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  CacheEntry,
  getCachedValue,
  setCachedValue,
} from '../../common/cache.util';
import {
  SPORTRADAR_SERIES_CONFIG,
  SportradarSeriesId,
} from './sportradar.config';

@Injectable()
export class SportradarClient {
  private readonly logger = new Logger(SportradarClient.name);
  private readonly cacheTtlMs = 60_000;
  private readonly responseCache = new Map<string, CacheEntry<unknown>>();

  private readonly http: AxiosInstance = axios.create({
    timeout: 8000,
  });

  private getApiKey(): string {
    const apiKey = process.env.SPORTRADAR_API_KEY;

    if (!apiKey) {
      throw new Error('Missing SPORTRADAR_API_KEY environment variable');
    }

    return apiKey;
  }

  private async sleep(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async get<T>(
    seriesId: SportradarSeriesId,
    path: string,
    retries = 2,
  ): Promise<T> {
    const config = SPORTRADAR_SERIES_CONFIG[seriesId];
    const cacheKey = `${seriesId}:${path}`;

    const cached = getCachedValue(this.responseCache, cacheKey);
    if (cached) return cached as T;

    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.http.get<T>(`${config.baseUrl}${path}`, {
          headers: {
            'x-api-key': this.getApiKey(),
          },
        });

        setCachedValue(this.responseCache, cacheKey, response.data, this.cacheTtlMs);

        return response.data;
      } catch (error) {
        lastError = error;

        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;

        const retryable = !status || status >= 500 || status === 429;

        this.logger.warn(
          `Sportradar request failed: ${seriesId} ${path} attempt=${
            attempt + 1
          } status=${status ?? 'unknown'} retryable=${retryable}`,
        );

        if (!retryable || attempt === retries) break;

        await this.sleep(500 * (attempt + 1));
      }
    }

    throw lastError;
  }
}
