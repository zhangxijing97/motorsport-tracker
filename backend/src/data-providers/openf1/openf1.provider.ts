import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CacheEntry,
  getCachedValue,
  setCachedValue,
} from '../../common/cache.util';
import {
  getYearFromDate,
  isDateWithinRange,
  isSameDate,
  normalizeDate,
} from '../../common/date.util';
import { formatGap, formatLapTime } from '../../common/format.util';
import type {
  Event,
  SessionClassificationRow,
  SessionDetail,
} from '../../events/types';
import type {
  ProviderDetailRequest,
  ProviderRequest,
  RacingDataProvider,
} from '../racing-data-provider.interface';
import { OpenF1Client } from './openf1.client';
import { OpenF1Mapper } from './openf1.mapper';
import type { OpenF1Meeting } from './openf1.types';

@Injectable()
export class OpenF1Provider implements RacingDataProvider {
  readonly supportedSeriesIds = ['f1'];

  private readonly logger = new Logger(OpenF1Provider.name);
  private readonly cacheTtlMs = 60_000;
  private readonly sessionDetailCache = new Map<string, CacheEntry<SessionDetail>>();

  constructor(
    private readonly openF1Client: OpenF1Client,
    private readonly openF1Mapper: OpenF1Mapper,
  ) {}

  private parseSessionKeyFromId(id: string): number {
    const parts = id.split('-');
    const sessionKey = Number(parts[parts.length - 1]);

    if (!Number.isFinite(sessionKey)) {
      throw new NotFoundException(`Invalid session id "${id}"`);
    }

    return sessionKey;
  }

  async getEventsByDate(request: ProviderRequest): Promise<Event[]> {
    const selectedDate = normalizeDate(request.date);
    const year = getYearFromDate(selectedDate);

    const meetings = await this.openF1Client.fetchMeetings(year);

    const relevantMeetings = meetings.filter((meeting) =>
      isDateWithinRange(
        selectedDate,
        meeting.date_start,
        meeting.date_end,
      ),
    );

    const events = await Promise.all(
      relevantMeetings.map(async (meeting) => {
        const sessions = await this.openF1Client.fetchSessionsByMeetingKey(
          meeting.meeting_key,
        );

        const sessionsOnSelectedDate = sessions.filter((session) =>
          isSameDate(selectedDate, session.date_start),
        );

        return this.openF1Mapper.mapMeetingAndSessionsToEvent(
          meeting,
          sessionsOnSelectedDate,
        );
      }),
    );

    return events.filter((event) => event.sessions.length > 0);
  }

  async getUpcomingEvents(request: ProviderRequest): Promise<Event[]> {
    const events = await this.getEventsByDate(request);

    return events
      .map((event) => ({
        ...event,
        sessions: event.sessions.filter(
          (session) => session.status === 'upcoming',
        ),
      }))
      .filter((event) => event.sessions.length > 0);
  }

  async getLiveEvents(request: ProviderRequest): Promise<Event[]> {
    const events = await this.getEventsByDate(request);

    return events
      .map((event) => ({
        ...event,
        sessions: event.sessions.filter((session) => session.status === 'live'),
      }))
      .filter((event) => event.sessions.length > 0);
  }

  async getPastEvents(request: ProviderRequest): Promise<Event[]> {
    const events = await this.getEventsByDate(request);

    return events
      .map((event) => ({
        ...event,
        sessions: event.sessions.filter(
          (session) => session.status === 'finished',
        ),
      }))
      .filter((event) => event.sessions.length > 0);
  }

  async getEventById(request: ProviderDetailRequest): Promise<Event> {
    const currentYear = new Date().getFullYear();

    const meetings = await this.openF1Client
      .fetchMeetings(currentYear)
      .catch(() => []);

    const events = await Promise.all(
      meetings.map(async (meeting) => {
        const sessions = await this.openF1Client.fetchSessionsByMeetingKey(
          meeting.meeting_key,
        );

        return this.openF1Mapper.mapMeetingAndSessionsToEvent(
          meeting,
          sessions,
        );
      }),
    );

    const event = events.find((item) => item.id === request.id);

    if (!event) {
      throw new NotFoundException(`Event with id "${request.id}" not found`);
    }

    return event;
  }

  async getSessionDetailById(
    request: ProviderDetailRequest,
  ): Promise<SessionDetail | null> {
    const cached = getCachedValue(this.sessionDetailCache, request.id);
    if (cached) return cached;

    try {
      const sessionKey = this.parseSessionKeyFromId(request.id);

      const sessionResults =
        await this.openF1Client.fetchSessionsBySessionKey(sessionKey);

      const targetSession = sessionResults[0];

      if (!targetSession) {
        throw new NotFoundException(`Session with id "${request.id}" not found`);
      }

      let meeting: OpenF1Meeting | null = null;

      try {
        const meetings = await this.openF1Client.fetchMeetings(
          targetSession.year,
        );

        meeting =
          meetings.find(
            (item) =>
              Number(item.meeting_key) === Number(targetSession.meeting_key),
          ) ?? null;
      } catch {
        this.logger.warn(
          `Failed to fetch meeting for session ${sessionKey}, using fallback`,
        );
      }

      const mappedEvent = meeting
        ? this.openF1Mapper.mapMeetingAndSessionsToEvent(
            meeting,
            await this.openF1Client.fetchSessionsByMeetingKey(
              meeting.meeting_key,
            ),
          )
        : this.openF1Mapper.buildFallbackEventFromSession(targetSession);

      const mappedSession =
        mappedEvent.sessions.find(
          (session) =>
            session.id === `openf1-session-${targetSession.session_key}`,
        ) ??
        this.openF1Mapper.mapOpenF1SessionToSession(
          targetSession,
          mappedEvent.id,
        );

      const [driversResult, lapsResult] = await Promise.allSettled([
        this.openF1Client.fetchDriversBySessionKey(sessionKey),
        this.openF1Client.fetchLapsBySessionKey(sessionKey),
      ]);

      const drivers =
        driversResult.status === 'fulfilled' ? driversResult.value : [];

      const laps =
        lapsResult.status === 'fulfilled' ? lapsResult.value : [];

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
              ? formatLapTime(row.bestLapSeconds)
              : null,
            gapToLeader:
              !isLeader && row.bestLapSeconds !== null && leaderBestLap !== null
                ? formatGap(row.bestLapSeconds - leaderBestLap)
                : null,
            laps: row.laps,
          };
        },
      );

      const payload: SessionDetail = {
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

      setCachedValue(this.sessionDetailCache, request.id, payload, this.cacheTtlMs);

      return payload;
    } catch (error) {
      this.logger.error(
        `Session detail failed for id=${request.id}`,
        error as Error,
      );

      if (error instanceof NotFoundException) throw error;
      if (error instanceof InternalServerErrorException) throw error;

      throw new InternalServerErrorException(
        'Failed to build session detail from upstream data',
      );
    }
  }
}
