import { Injectable, NotFoundException } from '@nestjs/common';
import {
  getYearFromDate,
  isDateWithinRange,
  isSameDate,
  normalizeDate,
} from '../../common/date.util';
import type { Event, SessionDetail } from '../../events/types';
import type {
  ProviderDetailRequest,
  ProviderRequest,
  RacingDataProvider,
} from '../racing-data-provider.interface';
import type { SportradarSeriesId } from './sportradar.config';
import { SPORTRADAR_SERIES_CONFIG } from './sportradar.config';
import { SportradarClient } from './sportradar.client';
import { SportradarMapper } from './sportradar.mapper';
import type {
  SportradarSeasonsResponse,
  SportradarStage,
  SportradarSummaryResponse,
} from './sportradar.types';

@Injectable()
export class SportradarProvider implements RacingDataProvider {
  readonly supportedSeriesIds = [
    'formula-e',
    'indycar',
    'indy-nxt',
    'nascar',
    'motogp',
    'rally',
  ];

  constructor(
    private readonly sportradarClient: SportradarClient,
    private readonly sportradarMapper: SportradarMapper,
  ) {}

  private toSportradarSeriesId(seriesId: string): SportradarSeriesId {
    if (this.supportedSeriesIds.includes(seriesId)) {
      return seriesId as SportradarSeriesId;
    }

    throw new NotFoundException(`Unsupported Sportradar series "${seriesId}"`);
  }

  private isStageOnSelectedDate(
    selectedDate: string,
    scheduled?: string,
    scheduledEnd?: string,
  ): boolean {
    if (scheduled && scheduledEnd) {
      return isDateWithinRange(selectedDate, scheduled, scheduledEnd);
    }

    if (scheduled) {
      return isSameDate(selectedDate, scheduled);
    }

    return false;
  }

  private async getSeasonStage(
    seriesId: SportradarSeriesId,
    year: number,
  ): Promise<SportradarStage | null> {
    const data = await this.sportradarClient.get<SportradarSeasonsResponse>(
      seriesId,
      '/en/seasons.json',
    );

    const seasons = data.stages ?? [];

    return (
      seasons.find((season) => {
        const description = season.description ?? '';
        return description.includes(String(year));
      }) ?? null
    );
  }

  private async getSeasonEvents(
    seriesId: SportradarSeriesId,
    year: number,
  ): Promise<SportradarStage[]> {
    const season = await this.getSeasonStage(seriesId, year);

    if (!season) {
      return [];
    }

    const summary =
      await this.sportradarClient.get<SportradarSummaryResponse>(
        seriesId,
        `/en/sport_events/${season.id}/summary.json`,
      );

    return summary.stage?.stages ?? [];
  }

  async getEventsByDate(request: ProviderRequest): Promise<Event[]> {
    const seriesId = this.toSportradarSeriesId(request.seriesId);
    const selectedDate = normalizeDate(request.date);
    const year = getYearFromDate(selectedDate);

    try {
      const eventStages = await this.getSeasonEvents(seriesId, year);

      const matchedEventStages = eventStages.filter((stage) =>
        this.isStageOnSelectedDate(
          selectedDate,
          stage.scheduled,
          stage.scheduled_end,
        ),
      );

      const detailedEvents = await Promise.all(
        matchedEventStages.map(async (stage) => {
          const detail =
            await this.sportradarClient.get<SportradarSummaryResponse>(
              seriesId,
              `/en/sport_events/${stage.id}/summary.json`,
            );

          const detailedStage = detail.stage ?? stage;

          return {
            ...detailedStage,
            stages: (detailedStage.stages ?? []).filter((childStage) =>
              this.isStageOnSelectedDate(
                selectedDate,
                childStage.scheduled,
                childStage.scheduled_end,
              ),
            ),
          };
        }),
      );

      return detailedEvents
        .map((stage) =>
          this.sportradarMapper.mapEventStageToEvent(seriesId, stage, year),
        )
        .filter((event) => event.sessions.length > 0);
    } catch {
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
    const seriesId = this.toSportradarSeriesId(request.seriesId);
    const eventId = request.id.replace(`sportradar-${seriesId}-`, '');

    const detail = await this.sportradarClient.get<SportradarSummaryResponse>(
      seriesId,
      `/en/sport_events/${eventId}/summary.json`,
    );

    const stage = detail.stage;

    if (!stage) {
      throw new NotFoundException(
        `Sportradar event with id "${request.id}" not found`,
      );
    }

    const year = new Date(stage.scheduled ?? Date.now()).getFullYear();

    return this.sportradarMapper.mapEventStageToEvent(seriesId, stage, year);
  }

  async getSessionDetailById(
    request: ProviderDetailRequest,
  ): Promise<SessionDetail | null> {
    const seriesId = this.toSportradarSeriesId(request.seriesId);
    const stageId = request.id.replace(`sportradar-session-`, '');

    const detail = await this.sportradarClient.get<SportradarSummaryResponse>(
      seriesId,
      `/en/sport_events/${stageId}/summary.json`,
    );

    const stage = detail.stage;

    if (!stage) {
      return null;
    }

    const parentEvent = stage;
    const year = new Date(parentEvent.scheduled ?? Date.now()).getFullYear();

    const event = this.sportradarMapper.mapEventStageToEvent(
      seriesId,
      parentEvent,
      year,
    );

    const session = event.sessions[0];

    if (!session) {
      return null;
    }

    return {
      event: {
        id: event.id,
        eventName: event.eventName,
        seriesName: SPORTRADAR_SERIES_CONFIG[seriesId].displayName,
        seasonName: event.season.name,
        country: event.country,
        location: event.location,
        venueName: event.venueName,
        dateStart: event.dateStart,
        dateEnd: event.dateEnd,
      },
      session,
      classification: this.sportradarMapper.mapCompetitorsToClassification(
        stage.competitors ?? [],
      ),
    };
  }
}
