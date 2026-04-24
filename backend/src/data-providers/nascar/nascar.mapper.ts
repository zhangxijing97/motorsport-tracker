import { Injectable } from '@nestjs/common';
import { computeSessionStatus } from '../../common/date.util';
import type { Event, Session, SessionCategory } from '../../events/types';
import { NASCAR_SERIES_CONFIG, NascarSeriesId } from './nascar.config';
import type { NascarEvent, NascarRace } from './nascar.types';

@Injectable()
export class NascarMapper {
  private mapRaceToCategory(race: NascarRace): SessionCategory {
    const name = race.name.toLowerCase();

    if (name.includes('practice')) return 'practice';
    if (name.includes('qualifying')) return 'qualifying';
    if (name.includes('heat')) return 'heat';

    return 'race';
  }

  private mapStatusToCancelled(status?: string): boolean {
    const normalized = status?.toLowerCase() ?? '';

    return normalized === 'canceled' || normalized === 'cancelled';
  }

  mapNascarEventToEvent(
    seriesId: NascarSeriesId,
    event: NascarEvent,
    year: number,
    selectedDate: string,
  ): Event {
    const config = NASCAR_SERIES_CONFIG[seriesId];

    const eventId = `nascar-${seriesId}-${event.id}`;

    const races = event.races ?? [];

    const sessions: Session[] = races
      .filter((race) => race.scheduled?.slice(0, 10) === selectedDate)
      .map((race) => this.mapRaceToSession(race, eventId));

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
      eventName: event.name,
      country: event.track?.country ?? 'USA',
      location:
        event.track?.city ??
        event.track?.market ??
        event.track?.state ??
        'Unknown',
      venueName: event.track?.name ?? 'Unknown',
      dateStart:
        event.start_date ??
        sessions[0]?.startTime ??
        new Date().toISOString(),
      dateEnd:
        sessions[sessions.length - 1]?.endTime ??
        event.start_date ??
        new Date().toISOString(),
      sessions,
    };
  }

  private mapRaceToSession(race: NascarRace, eventId: string): Session {
    const startTime = race.scheduled ?? new Date().toISOString();

    return {
      id: `nascar-session-${race.id}`,
      eventId,
      name: race.name,
      category: this.mapRaceToCategory(race),
      startTime,
      endTime: startTime,
      status: computeSessionStatus(
        startTime,
        startTime,
        this.mapStatusToCancelled(race.status),
      ),
    };
  }
}
