// -----------------------------
// Raw data types
// -----------------------------
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  Event,
  Session,
  SessionCategory,
  SessionClassificationRow,
  SessionStatus,
} from './types';

type OpenF1Meeting = {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  location: string;
  country_name: string;
  circuit_short_name: string;
  year: number;
  date_start: string;
  date_end: string;
  is_cancelled: boolean;
};

type OpenF1Session = {
  session_key: number;
  session_type: string;
  session_name: string;
  date_start: string;
  date_end: string;
  meeting_key: number;
  circuit_short_name: string;
  country_name: string;
  location: string;
  year: number;
  is_cancelled: boolean;
};

type OpenF1Driver = {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  first_name: string;
  last_name: string;
  headshot_url: string | null;
  country_code: string;
};

type OpenF1Lap = {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  lap_number: number;
  date_start: string;
  lap_duration: number | null;
};


// -----------------------------
// Cache helpers
// -----------------------------
type CacheEntry<T> = {
  expiresAt: number;
  data: T;
};


// -----------------------------
// Events service
// -----------------------------
@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

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
  private readonly sessionDetailCache = new Map<string, CacheEntry<any>>();

  private getCachedValue<T>(cache: Map<any, CacheEntry<T>>, key: any): T | null {
    const cached = cache.get(key);

    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
      cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCachedValue<T>(cache: Map<any, CacheEntry<T>>, key: any, data: T) {
    cache.set(key, {
      expiresAt: Date.now() + this.cacheTtlMs,
      data,
    });
  }

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

        if (!retryable || attempt === retries) {
          break;
        }

        await this.sleep(500 * (attempt + 1));
      }
    }

    throw lastError;
  }

  private normalizeDate(date?: string): string {
    if (date) return date;

    const today = new Date();
    return today.toISOString().slice(0, 10);
  }

  private getYearFromDate(date: string): number {
    return Number(date.slice(0, 4));
  }

  private isDateWithinMeetingRange(
    selectedDate: string,
    meetingStart: string,
    meetingEnd: string,
  ): boolean {
    const start = meetingStart.slice(0, 10);
    const end = meetingEnd.slice(0, 10);
    return selectedDate >= start && selectedDate <= end;
  }

  private isSameSessionDate(selectedDate: string, sessionStart: string): boolean {
    return sessionStart.slice(0, 10) === selectedDate;
  }

  private async fetchMeetings(year: number): Promise<OpenF1Meeting[]> {
    const cached = this.getCachedValue(this.meetingsCache, year);
    if (cached) return cached;

    const data = await this.requestWithRetry<OpenF1Meeting[]>(
      '/meetings',
      { year },
      2,
    );

    this.setCachedValue(this.meetingsCache, year, data);
    return data;
  }

  private async fetchSessionsByMeetingKey(
    meetingKey: number,
  ): Promise<OpenF1Session[]> {
    const cached = this.getCachedValue(this.sessionsByMeetingCache, meetingKey);
    if (cached) return cached;

    const data = await this.requestWithRetry<OpenF1Session[]>(
      '/sessions',
      { meeting_key: meetingKey },
      2,
    );

    this.setCachedValue(this.sessionsByMeetingCache, meetingKey, data);
    return data;
  }

  private async fetchSessionsBySessionKey(
    sessionKey: number,
  ): Promise<OpenF1Session[]> {
    const cached = this.getCachedValue(this.sessionsBySessionKeyCache, sessionKey);
    if (cached) return cached;

    const data = await this.requestWithRetry<OpenF1Session[]>(
      '/sessions',
      { session_key: sessionKey },
      2,
    );

    this.setCachedValue(this.sessionsBySessionKeyCache, sessionKey, data);
    return data;
  }

  private async fetchDriversBySessionKey(
    sessionKey: number,
  ): Promise<OpenF1Driver[]> {
    return this.requestWithRetry<OpenF1Driver[]>(
      '/drivers',
      { session_key: sessionKey },
      2,
    );
  }

  private async fetchLapsBySessionKey(sessionKey: number): Promise<OpenF1Lap[]> {
    return this.requestWithRetry<OpenF1Lap[]>(
      '/laps',
      { session_key: sessionKey },
      2,
    );
  }

  private mapSessionTypeToCategory(
    sessionType: string,
    sessionName: string,
  ): SessionCategory {
    const type = sessionType.toLowerCase();
    const name = sessionName.toLowerCase();

    if (name.includes('sprint')) return 'sprint';
    if (type.includes('practice')) return 'practice';
    if (type.includes('qualifying')) return 'qualifying';
    if (type.includes('race')) return 'race';

    return 'other';
  }

  private computeSessionStatus(
    startTime: string,
    endTime: string,
    isCancelled: boolean,
  ): SessionStatus {
    if (isCancelled) return 'cancelled';

    const now = Date.now();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (now < start) return 'upcoming';
    if (now > end) return 'finished';
    return 'live';
  }

  private mapOpenF1SessionToSession(
    session: OpenF1Session,
    eventId: string,
  ): Session {
    return {
      id: `openf1-session-${session.session_key}`,
      eventId,
      name: session.session_name,
      category: this.mapSessionTypeToCategory(
        session.session_type,
        session.session_name,
      ),
      startTime: session.date_start,
      endTime: session.date_end,
      status: this.computeSessionStatus(
        session.date_start,
        session.date_end,
        session.is_cancelled,
      ),
    };
  }

  private mapMeetingAndSessionsToEvent(
    meeting: OpenF1Meeting,
    sessions: OpenF1Session[],
  ): Event {
    const eventId = `openf1-${meeting.meeting_key}`;

    const mappedSessions: Session[] = sessions.map((session) =>
      this.mapOpenF1SessionToSession(session, eventId),
    );

    return {
      id: eventId,
      series: {
        id: 'f1',
        name: 'Formula 1',
        category: 'Single-Seater',
      },
      season: {
        id: `f1-${meeting.year}`,
        year: meeting.year,
        name: `${meeting.year} Formula 1 World Championship`,
      },
      eventName: meeting.meeting_name,
      country: meeting.country_name,
      location: meeting.location,
      venueName: meeting.circuit_short_name,
      dateStart: meeting.date_start,
      dateEnd: meeting.date_end,
      sessions: mappedSessions,
    };
  }

  private async getOpenF1EventsByDate(selectedDateInput?: string): Promise<Event[]> {
    const selectedDate = this.normalizeDate(selectedDateInput);
    const year = this.getYearFromDate(selectedDate);

    const meetings = await this.fetchMeetings(year);

    const relevantMeetings = meetings.filter((meeting) =>
      this.isDateWithinMeetingRange(
        selectedDate,
        meeting.date_start,
        meeting.date_end,
      ),
    );

    const events = await Promise.all(
      relevantMeetings.map(async (meeting) => {
        const sessions = await this.fetchSessionsByMeetingKey(meeting.meeting_key);

        const sessionsOnSelectedDate = sessions.filter((session) =>
          this.isSameSessionDate(selectedDate, session.date_start),
        );

        return this.mapMeetingAndSessionsToEvent(meeting, sessionsOnSelectedDate);
      }),
    );

    return events.filter((event) => event.sessions.length > 0);
  }

  private parseSessionKeyFromId(id: string): number {
    const parts = id.split('-');
    const sessionKey = Number(parts[parts.length - 1]);

    if (!Number.isFinite(sessionKey)) {
      throw new NotFoundException(`Invalid session id "${id}"`);
    }

    return sessionKey;
  }

  private formatLapTime(seconds: number | null): string | null {
    if (seconds === null || !Number.isFinite(seconds)) return null;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds - minutes * 60;

    return `${minutes}:${remainingSeconds.toFixed(3).padStart(6, '0')}`;
  }

  private formatGap(seconds: number | null): string | null {
    if (seconds === null || !Number.isFinite(seconds)) return null;
    return `+${seconds.toFixed(3)}s`;
  }

  async getEventsByDate(date?: string) {
    return this.getOpenF1EventsByDate(date);
  }

  async getUpcomingEvents(date?: string) {
    const events = await this.getOpenF1EventsByDate(date);

    return events
      .map((event) => ({
        ...event,
        sessions: event.sessions.filter(
          (session) => session.status === 'upcoming',
        ),
      }))
      .filter((event) => event.sessions.length > 0);
  }

  async getLiveEvents(date?: string) {
    const events = await this.getOpenF1EventsByDate(date);

    return events
      .map((event) => ({
        ...event,
        sessions: event.sessions.filter((session) => session.status === 'live'),
      }))
      .filter((event) => event.sessions.length > 0);
  }

  async getPastEvents(date?: string) {
    const events = await this.getOpenF1EventsByDate(date);

    return events
      .map((event) => ({
        ...event,
        sessions: event.sessions.filter(
          (session) => session.status === 'finished',
        ),
      }))
      .filter((event) => event.sessions.length > 0);
  }

  async getEventById(id: string) {
    const currentYear = new Date().getFullYear();
    const meetings = await this.fetchMeetings(currentYear).catch(() => []);

    const events = await Promise.all(
      meetings.map(async (meeting) => {
        const sessions = await this.fetchSessionsByMeetingKey(meeting.meeting_key);
        return this.mapMeetingAndSessionsToEvent(meeting, sessions);
      }),
    );

    const event = events.find((item) => item.id === id);

    if (!event) {
      throw new NotFoundException(`Event with id "${id}" not found`);
    }

    return event;
  }

  async getSessionDetailById(id: string) {
    const cached = this.getCachedValue(this.sessionDetailCache, id);
    if (cached) return cached;

    try {
      const sessionKey = this.parseSessionKeyFromId(id);

      const sessionResults = await this.fetchSessionsBySessionKey(sessionKey);
      const targetSession = sessionResults[0];

      if (!targetSession) {
        throw new NotFoundException(`Session with id "${id}" not found`);
      }

      let meeting: OpenF1Meeting | null = null;

      try {
        const meetings = await this.fetchMeetings(targetSession.year);
        meeting =
          meetings.find(
            (item) =>
              Number(item.meeting_key) === Number(targetSession.meeting_key),
          ) ?? null;
      } catch (error) {
        this.logger.warn(
          `Failed to fetch meeting for session ${sessionKey}, using fallback event info`,
        );
      }

      let mappedEvent: Event;

      try {
        if (meeting) {
          const allSessionsForMeeting = await this.fetchSessionsByMeetingKey(
            meeting.meeting_key,
          );
          mappedEvent = this.mapMeetingAndSessionsToEvent(
            meeting,
            allSessionsForMeeting,
          );
        } else {
          const fallbackEventId = `openf1-${targetSession.meeting_key}`;

          mappedEvent = {
            id: fallbackEventId,
            series: {
              id: 'f1',
              name: 'Formula 1',
              category: 'Single-Seater',
            },
            season: {
              id: `f1-${targetSession.year}`,
              year: targetSession.year,
              name: `${targetSession.year} Formula 1 World Championship`,
            },
            eventName: `${targetSession.country_name} Grand Prix`,
            country: targetSession.country_name,
            location: targetSession.location,
            venueName: targetSession.circuit_short_name,
            dateStart: targetSession.date_start,
            dateEnd: targetSession.date_end,
            sessions: [
              this.mapOpenF1SessionToSession(targetSession, fallbackEventId),
            ],
          };
        }
      } catch (error) {
        throw new InternalServerErrorException(
          'Failed while building mapped event for session detail',
        );
      }

      const mappedSession =
        mappedEvent.sessions.find(
          (session) => session.id === `openf1-session-${targetSession.session_key}`,
        ) ?? this.mapOpenF1SessionToSession(targetSession, mappedEvent.id);

      const [driversResult, lapsResult] = await Promise.allSettled([
        this.fetchDriversBySessionKey(sessionKey),
        this.fetchLapsBySessionKey(sessionKey),
      ]);

      const drivers =
        driversResult.status === 'fulfilled' ? driversResult.value : [];
      const laps = lapsResult.status === 'fulfilled' ? lapsResult.value : [];

      if (driversResult.status === 'rejected') {
        this.logger.warn(`Drivers request failed for session ${sessionKey}`);
      }

      if (lapsResult.status === 'rejected') {
        this.logger.warn(`Laps request failed for session ${sessionKey}`);
      }

      const rows = drivers.map((driver) => {
        const driverLaps = laps.filter(
          (lap) => lap.driver_number === driver.driver_number,
        );

        const uniqueLaps = new Set(
          driverLaps
            .map((lap) => lap.lap_number)
            .filter((lapNumber) => Number.isFinite(lapNumber)),
        );

        const validLapDurations = driverLaps
          .map((lap) => lap.lap_duration)
          .filter(
            (duration): duration is number =>
              duration !== null && Number.isFinite(duration),
          );

        const bestLap =
          validLapDurations.length > 0 ? Math.min(...validLapDurations) : null;

        return {
          driverNumber: driver.driver_number,
          driverName: driver.full_name,
          teamName: driver.team_name,
          headshotUrl: driver.headshot_url,
          laps: uniqueLaps.size,
          bestLapSeconds: bestLap,
        };
      });

      const rowsWithTimes = rows.sort((a, b) => {
        if (a.bestLapSeconds === null && b.bestLapSeconds === null) return 0;
        if (a.bestLapSeconds === null) return 1;
        if (b.bestLapSeconds === null) return -1;
        return a.bestLapSeconds - b.bestLapSeconds;
      });

      const leaderBestLap =
        rowsWithTimes.length > 0 ? rowsWithTimes[0].bestLapSeconds : null;

      const classification: SessionClassificationRow[] = rowsWithTimes.map(
        (row, index) => {
          const isLeader =
            index === 0 &&
            row.bestLapSeconds !== null &&
            leaderBestLap !== null &&
            row.bestLapSeconds === leaderBestLap;

          return {
            position: index + 1,
            driverNumber: row.driverNumber,
            driverName: row.driverName,
            teamName: row.teamName,
            headshotUrl: row.headshotUrl,
            bestLapTime: isLeader
              ? this.formatLapTime(row.bestLapSeconds)
              : null,
            gapToLeader:
              !isLeader && row.bestLapSeconds !== null && leaderBestLap !== null
                ? this.formatGap(row.bestLapSeconds - leaderBestLap)
                : null,
            laps: row.laps,
          };
        },
      );

      const payload = {
        event: {
          id: mappedEvent.id,
          eventName: mappedEvent.eventName,
          seriesName: mappedEvent.series.name,
          seasonName: mappedEvent.season.name,
          country: mappedEvent.country,
          location: mappedEvent.location,
          venueName: mappedEvent.venueName,
          dateStart: mappedEvent.dateStart,
          dateEnd: mappedEvent.dateEnd,
        },
        session: mappedSession,
        classification,
      };

      this.setCachedValue(this.sessionDetailCache, id, payload);
      return payload;
    } catch (error) {
      this.logger.error(`Session detail failed for id=${id}`, error as Error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to build session detail from upstream data',
      );
    }
  }
}
