import { Injectable } from '@nestjs/common';
import { computeSessionStatus } from '../../common/date.util';
import type {
  Event,
  Session,
  SessionCategory,
  SessionClassificationRow,
} from '../../events/types';
import {
  SPORTRADAR_SERIES_CONFIG,
  SportradarSeriesId,
} from './sportradar.config';
import type { SportradarCompetitor, SportradarStage } from './sportradar.types';

@Injectable()
export class SportradarMapper {
  private mapStageTypeToCategory(type?: string): SessionCategory {
    const normalizedType = type?.toLowerCase() ?? '';

    if (normalizedType.includes('practice')) return 'practice';
    if (normalizedType.includes('qualifying')) return 'qualifying';
    if (normalizedType.includes('race')) return 'race';

    return 'other';
  }

  mapEventStageToEvent(
    seriesId: SportradarSeriesId,
    eventStage: SportradarStage,
    year: number,
  ): Event {
    const config = SPORTRADAR_SERIES_CONFIG[seriesId];
    const eventId = `sportradar-${seriesId}-${eventStage.id}`;

    const childStages = eventStage.stages ?? [];

    const sessions: Session[] = childStages.map((stage) => ({
      id: `sportradar-session-${stage.id}`,
      eventId,
      name: stage.description ?? 'Session',
      category: this.mapStageTypeToCategory(stage.type),
      startTime: stage.scheduled ?? eventStage.scheduled ?? new Date().toISOString(),
      endTime:
        stage.scheduled_end ??
        stage.scheduled ??
        eventStage.scheduled_end ??
        eventStage.scheduled ??
        new Date().toISOString(),
      status: computeSessionStatus(
        stage.scheduled ?? eventStage.scheduled ?? new Date().toISOString(),
        stage.scheduled_end ??
          stage.scheduled ??
          eventStage.scheduled_end ??
          eventStage.scheduled ??
          new Date().toISOString(),
        eventStage.status?.toLowerCase() === 'cancelled',
      ),
    }));

    return {
      id: eventId,
      series: {
        id: seriesId,
        name: config.displayName,
        category: config.category,
      },
      season: {
        id: `${seriesId}-${year}`,
        year,
        name: `${year} ${config.displayName}`,
      },
      eventName: eventStage.description ?? config.displayName,
      country:
        eventStage.venue?.country ??
        eventStage.venue?.country_name ??
        'Unknown',
      location:
        eventStage.venue?.city ??
        eventStage.venue?.city_name ??
        'Unknown',
      venueName: eventStage.venue?.name ?? 'Unknown',
      dateStart: eventStage.scheduled ?? new Date().toISOString(),
      dateEnd:
        eventStage.scheduled_end ??
        eventStage.scheduled ??
        new Date().toISOString(),
      sessions,
    };
  }

  mapCompetitorsToClassification(
    competitors: SportradarCompetitor[] = [],
  ): SessionClassificationRow[] {
    return competitors
      .filter((competitor) => competitor.result?.position !== undefined)
      .sort(
        (a, b) =>
          (a.result?.position ?? Number.MAX_SAFE_INTEGER) -
          (b.result?.position ?? Number.MAX_SAFE_INTEGER),
      )
      .map((competitor, index) => ({
        position: competitor.result?.position ?? index + 1,
        driverNumber: competitor.result?.car_number ?? 0,
        driverName: competitor.name,
        teamName: competitor.team?.name ?? 'Unknown',
        headshotUrl: null,
        bestLapTime: null,
        gapToLeader:
          competitor.result?.points !== undefined
            ? `${competitor.result.points} pts`
            : null,
        laps: 0,
      }));
  }
}
