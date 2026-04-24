import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  CacheEntry,
  getCachedValue,
  setCachedValue,
} from '../../common/cache.util';
import { NASCAR_SERIES_CONFIG, NascarSeriesId } from './nascar.config';
import type {
  NascarScheduleResponse,
  NascarSeriesListItem,
} from './nascar.types';

@Injectable()
export class NascarClient {
  private readonly logger = new Logger(NascarClient.name);

  private readonly http: AxiosInstance = axios.create({
    baseURL: 'https://api.sportradar.com/nascar-ot3',
    timeout: 8000,
  });

  private readonly cacheTtlMs = 60_000;
  private readonly responseCache = new Map<string, CacheEntry<unknown>>();

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

  private async getWithRetry<T>(path: string, retries = 2): Promise<T> {
    const cached = getCachedValue(this.responseCache, path);
    if (cached) return cached as T;

    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.http.get<T>(path, {
          headers: {
            'x-api-key': this.getApiKey(),
          },
        });

        setCachedValue(this.responseCache, path, response.data, this.cacheTtlMs);
        return response.data;
      } catch (error) {
        lastError = error;

        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;

        const retryable = !status || status >= 500 || status === 429;

        this.logger.warn(
          `NASCAR request failed: ${path} attempt=${attempt + 1} status=${
            status ?? 'unknown'
          } retryable=${retryable}`,
        );

        if (!retryable || attempt === retries) break;

        await this.sleep(status === 429 ? 10_000 * (attempt + 1) : 500);
      }
    }

    throw lastError;
  }

  fetchSeriesList(): Promise<NascarSeriesListItem[]> {
    return this.getWithRetry<NascarSeriesListItem[]>('/series/list.json');
  }

  fetchSchedule(
    seriesId: NascarSeriesId,
    year: number,
  ): Promise<NascarScheduleResponse> {
    const seriesCode = NASCAR_SERIES_CONFIG[seriesId].apiSeriesCode;

    return this.getWithRetry<NascarScheduleResponse>(
      `/${seriesCode}/${year}/races/schedule.json`,
    );
  }
}
