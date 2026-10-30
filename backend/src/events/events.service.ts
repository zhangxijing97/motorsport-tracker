import { Injectable } from '@nestjs/common';
import { RacingDataProviderRegistry } from '../data-providers/racing-data-provider.registry';
import { RacingService } from '../racing/racing.service';
import { dateParam, yearParam } from '../racing/query';
import type {
  Event as CanonicalEvent,
  Session as CanonicalSession,
} from '../racing/model';
import type { Event, Session, SessionDetail } from './types';
import { formatLapTime } from '../common/format.util';
@Injectable()
export class EventsService {
  constructor(
    private readonly providerRegistry: RacingDataProviderRegistry,
    private readonly racing: RacingService,
  ) {}
  private session(s: CanonicalSession): Session {
    return {
      id: s.id,
      eventId: s.eventId,
      name: s.name,
      category: s.kind.startsWith('fp')
        ? 'practice'
        : s.kind === 'sprint_qualifying'
          ? 'qualifying'
          : (s.kind as 'qualifying' | 'race' | 'sprint'),
      startTime: s.scheduledStartAt ?? s.scheduledDate,
      endTime: s.scheduledEndAt,
      status:
        s.lifecycle === 'scheduled'
          ? 'upcoming'
          : s.lifecycle === 'started'
            ? 'live'
            : s.lifecycle === 'suspended'
              ? 'unknown'
              : s.lifecycle,
      statusBasis: s.lifecycleBasis,
    };
  }
  private event(e: CanonicalEvent): Event {
    return {
      id: e.id,
      series: { id: 'f1', name: 'Formula 1', category: 'Single-Seater' },
      season: { id: e.seasonId, year: e.year, name: `${e.year} Formula 1` },
      eventName: e.name,
      roundNumber: e.round ?? undefined,
      country: e.venue.country ?? 'Unknown',
      location: e.venue.locality ?? 'Unknown',
      venueName: e.venue.name,
      dateStart: e.startsOn,
      dateEnd: e.endsOn,
      sessions: e.sessions.map((s) => this.session(s)),
    };
  }
  private async list(
    method:
      | 'getEventsByDate'
      | 'getUpcomingEvents'
      | 'getLiveEvents'
      | 'getPastEvents',
    date?: string,
    series = 'f1',
  ): Promise<Event[]> {
    const selected = dateParam(date, new Date().toISOString().slice(0, 10));
    const year = yearParam(selected.slice(0, 4));
    if (series !== 'f1')
      return this.providerRegistry
        .getProvider(series)
        [method]({ date: selected, seriesId: series });
    const response = await this.racing.calendar(year);
    const status = {
      getEventsByDate: null,
      getUpcomingEvents: 'upcoming',
      getLiveEvents: 'live',
      getPastEvents: 'finished',
    }[method];
    return response.data
      .map((e) => ({
        ...this.event(e),
        availability: response.meta.availability,
        warnings: response.meta.warnings,
      }))
      .map((e) => ({
        ...e,
        sessions: e.sessions.filter(
          (s) =>
            s.startTime.slice(0, 10) === selected &&
            (!status || s.status === status),
        ),
      }))
      .filter((e) => e.sessions.length > 0);
  }
  getEventsByDate(date?: string, series?: string) {
    return this.list('getEventsByDate', date, series);
  }
  getUpcomingEvents(date?: string, series?: string) {
    return this.list('getUpcomingEvents', date, series);
  }
  getLiveEvents(date?: string, series?: string) {
    return this.list('getLiveEvents', date, series);
  }
  getPastEvents(date?: string, series?: string) {
    return this.list('getPastEvents', date, series);
  }
  async getEventById(id: string, series = 'f1') {
    if (series !== 'f1')
      return this.providerRegistry
        .getProvider(series)
        .getEventById({ id, seriesId: series });
    const response = await this.racing.event(id);
    return {
      ...this.event(response.data),
      availability: response.meta.availability,
      warnings: response.meta.warnings,
    };
  }
  async getSessionDetailById(
    id: string,
    series = 'f1',
  ): Promise<SessionDetail | null> {
    if (series !== 'f1')
      return this.providerRegistry
        .getProvider(series)
        .getSessionDetailById({ id, seriesId: series });
    const detail = await this.racing.session(id);
    const result = await this.racing.results(id);
    const event = this.event(detail.data.event);
    return {
      event: {
        id: event.id,
        eventName: event.eventName,
        seriesName: event.series.name,
        seasonName: event.season.name,
        country: event.country,
        location: event.location,
        venueName: event.venueName,
        dateStart: event.dateStart,
        dateEnd: event.dateEnd,
      },
      session: this.session(detail.data.session),
      availability: result.meta.availability,
      publicationStatus: result.data?.publicationStatus ?? null,
      classification:
        result.data?.rows.map((r) => {
          const entry = result.data!.entries.find((e) => e.id === r.entryId)!;
          const drivers = (
            r.participantId ? [r.participantId] : entry.participantIds
          ).map(
            (id) =>
              result.data!.drivers.find((d) => d.id === id)?.name ?? 'Unknown',
          );
          const team = result.data!.teams.find((t) => t.id === entry.teamId);
          return {
            position: r.classificationPosition,
            displayOrder: r.displayOrder,
            driverNumber:
              entry.carNumber === null ? null : Number(entry.carNumber),
            driverName: drivers.join(' / '),
            teamName: team?.name ?? 'Unknown',
            laps: r.lapsCompleted,
            bestLapTime:
              r.practiceBestLapMs === null
                ? null
                : formatLapTime(r.practiceBestLapMs / 1000),
            gapToLeader:
              r.gapToLeader?.kind === 'time'
                ? `+${(r.gapToLeader.milliseconds / 1000).toFixed(3)}s`
                : r.gapToLeader?.kind === 'laps'
                  ? `+${r.gapToLeader.laps} laps`
                  : null,
            classificationStatus: r.classificationStatus,
          };
        }) ?? [],
    };
  }
}
