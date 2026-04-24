import { Injectable, NotFoundException } from '@nestjs/common';
import { getYearFromDate, normalizeDate } from '../../common/date.util';
import type { Event, SessionDetail } from '../../events/types';
import type {
  ProviderDetailRequest,
  ProviderRequest,
  RacingDataProvider,
} from '../racing-data-provider.interface';
import type { NascarSeriesId } from './nascar.config';
import { NASCAR_SERIES_CONFIG } from './nascar.config';
import { NascarClient } from './nascar.client';
import { NascarMapper } from './nascar.mapper';

@Injectable()
export class NascarProvider implements RacingDataProvider {
  readonly supportedSeriesIds = [
    'nascar-cup',
    'nascar-xfinity',
    'nascar-truck',
  ];

  constructor(
    private readonly nascarClient: NascarClient,
    private readonly nascarMapper: NascarMapper,
  ) {}

  private toNascarSeriesId(seriesId: string): NascarSeriesId {
    if (this.supportedSeriesIds.includes(seriesId)) {
      return seriesId as NascarSeriesId;
    }

    throw new NotFoundException(`Unsupported NASCAR series "${seriesId}"`);
  }

  async getEventsByDate(request: ProviderRequest): Promise<Event[]> {
    const seriesId = this.toNascarSeriesId(request.seriesId);
    const selectedDate = normalizeDate(request.date);
    const year = getYearFromDate(selectedDate);

    try {
      const schedule = await this.nascarClient.fetchSchedule(seriesId, year);

      const events = schedule.events ?? [];

      return events
        .map((event) =>
          this.nascarMapper.mapNascarEventToEvent(
            seriesId,
            event,
            year,
            selectedDate,
          ),
        )
        .filter((event) => event.sessions.length > 0);
    } catch (error) {
      console.error('NASCAR provider failed:', error);
      return [];
    }
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
    const seriesId = this.toNascarSeriesId(request.seriesId);

    throw new NotFoundException(
      `NASCAR event detail is not implemented yet for ${seriesId}: ${request.id}`,
    );
  }

  async getSessionDetailById(): Promise<SessionDetail | null> {
    return null;
  }

  getDisplayName(seriesId: NascarSeriesId) {
    return NASCAR_SERIES_CONFIG[seriesId].displayName;
  }
}
