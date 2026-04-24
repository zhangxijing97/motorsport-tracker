import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  CacheEntry,
  getCachedValue,
  setCachedValue,
} from '../../common/cache.util';
import type {
  OpenF1Driver,
  OpenF1Lap,
  OpenF1Meeting,
  OpenF1Session,
} from './openf1.types';

@Injectable()
export class OpenF1Client {
  private readonly logger = new Logger(OpenF1Client.name);

  private readonly http: AxiosInstance = axios.create({
    baseURL: 'https://api.openf1.org/v1',
    timeout: 8000,
  });

  private readonly cacheTtlMs = 60_000;

  private readonly meetingsCache = new Map<number, CacheEntry<OpenF1Meeting[]>>();
  private readonly sessionsByMeetingCache = new Map<
    number,
    CacheEntry<OpenF1Session[]>
  >();
  private readonly sessionsBySessionKeyCache = new Map<
    number,
    CacheEntry<OpenF1Session[]>
  >();

  private async sleep(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async requestWithRetry<T>(
    url: string,
    params: Record<string, unknown>,
    retries = 2,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.http.get<T>(url, { params });
        return response.data;
      } catch (error) {
        lastError = error;

        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;

        const retryable = !status || status >= 500 || status === 429;

        this.logger.warn(
          `OpenF1 request failed: ${url} attempt=${attempt + 1} status=${
            status ?? 'unknown'
          } retryable=${retryable}`,
        );

        if (!retryable || attempt === retries) break;

        await this.sleep(500 * (attempt + 1));
      }
    }

    throw lastError;
  }

  async fetchMeetings(year: number): Promise<OpenF1Meeting[]> {
    const cached = getCachedValue(this.meetingsCache, year);
    if (cached) return cached;

    const data = await this.requestWithRetry<OpenF1Meeting[]>(
      '/meetings',
      { year },
      2,
    );

    setCachedValue(this.meetingsCache, year, data, this.cacheTtlMs);
    return data;
  }

  async fetchSessionsByMeetingKey(
    meetingKey: number,
  ): Promise<OpenF1Session[]> {
    const cached = getCachedValue(this.sessionsByMeetingCache, meetingKey);
    if (cached) return cached;

    const data = await this.requestWithRetry<OpenF1Session[]>(
      '/sessions',
      { meeting_key: meetingKey },
      2,
    );

    setCachedValue(this.sessionsByMeetingCache, meetingKey, data, this.cacheTtlMs);
    return data;
  }

  async fetchSessionsBySessionKey(
    sessionKey: number,
  ): Promise<OpenF1Session[]> {
    const cached = getCachedValue(this.sessionsBySessionKeyCache, sessionKey);
    if (cached) return cached;

    const data = await this.requestWithRetry<OpenF1Session[]>(
      '/sessions',
      { session_key: sessionKey },
      2,
    );

    setCachedValue(
      this.sessionsBySessionKeyCache,
      sessionKey,
      data,
      this.cacheTtlMs,
    );

    return data;
  }

  async fetchDriversBySessionKey(
    sessionKey: number,
  ): Promise<OpenF1Driver[]> {
    return this.requestWithRetry<OpenF1Driver[]>(
      '/drivers',
      { session_key: sessionKey },
      2,
    );
  }

  async fetchLapsBySessionKey(sessionKey: number): Promise<OpenF1Lap[]> {
    return this.requestWithRetry<OpenF1Lap[]>(
      '/laps',
      { session_key: sessionKey },
      2,
    );
  }
}
