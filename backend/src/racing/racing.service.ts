import { Injectable, NotFoundException } from '@nestjs/common';
import { RacingDataProviderRegistry } from '../data-providers/racing-data-provider.registry';
import { UpstreamError } from '../data-providers/upstream-http';
import { instant, integer, str } from '../data-providers/schema';
import { updateLifecycle } from '../data-providers/jolpica/jolpica.mapper';
import {
  meta,
  scopeMeta,
  season,
  type Envelope,
  type Event,
  type ResultSet,
  type Session,
  type Standings,
} from './model';
import { yearParam } from './query';
@Injectable()
export class RacingService {
  private readonly revisions = new Map<string, ResultSet>();
  private revisionClock = 0;
  private readonly pendingStandings = new Map<number, number>();
  constructor(private readonly registry: RacingDataProviderRegistry) {}
  async seasons() {
    const response = await this.registry
      .forCapability('seasons')
      .client.seasons();
    return {
      data: response.value.map((r) => {
        const y = integer(r.season);
        if (!y || y < 1950) throw new UpstreamError('INVALID_PAYLOAD');
        return season(y);
      }),
      meta: meta('available', [response.source]),
    };
  }
  async calendar(year: number): Promise<Envelope<Event[]>> {
    const primary = await this.registry
      .forCapability('calendar')
      .calendar(year);
    if (year < 2023)
      return {
        data: primary.value,
        meta: meta(
          'available',
          [primary.source],
          ['openf1_session_enrichment_unsupported_before_2023'],
        ),
      };
    try {
      const supplement = await this.registry
        .forCapability('sessions')
        .enrich(primary.value, year);
      return {
        data: supplement.events,
        meta: meta(
          supplement.warnings.length ? 'partial' : 'available',
          [primary.source, supplement.source],
          supplement.warnings,
        ),
      };
    } catch (error) {
      if (!(error instanceof UpstreamError)) throw error;
      return {
        data: primary.value,
        meta: meta(
          'partial',
          [primary.source],
          [`openf1_session_enrichment:${error.code}`],
        ),
      };
    }
  }
  private async aliasYear(
    id: string,
  ): Promise<{ year: number; sessionKey?: string; meetingKey?: string }> {
    const canonical =
      /^f1-(\d{4})-[a-z0-9-]+(?::(?:fp[123]|qualifying|sprint_qualifying|sprint|race))?$/.exec(
        id,
      );
    if (canonical) return { year: yearParam(canonical[1]) };
    const session = /^openf1-session-(\d+)$/.exec(id);
    const meeting = /^openf1-(\d+)$/.exec(id);
    if (!session && !meeting)
      throw new NotFoundException('Unknown resource ID');
    const response = session
      ? await this.registry
          .forCapability('sessions')
          .client.session(Number(session[1]))
      : await this.registry
          .forCapability('sessions')
          .client.meetingSessions(Number(meeting![1]));
    if (!response.value.length)
      throw new NotFoundException('Unknown external ID');
    const year = integer(response.value[0].year);
    if (!year) throw new UpstreamError('INVALID_PAYLOAD');
    return { year, sessionKey: session?.[1], meetingKey: meeting?.[1] };
  }
  async event(id: string): Promise<Envelope<Event>> {
    const target = await this.aliasYear(id);
    const response = await this.calendar(target.year);
    const event = response.data.find(
      (e) =>
        e.id === id ||
        (!!target.meetingKey &&
          e.externalIds.some(
            (x) => x.provider === 'openf1' && x.id === target.meetingKey,
          )),
    );
    if (!event) {
      if (
        target.meetingKey &&
        response.meta.warnings.some((w) =>
          w.startsWith('openf1_session_enrichment:'),
        )
      )
        throw new UpstreamError('ALIAS_LOOKUP_FAILED');
      throw new NotFoundException('Event not found');
    }
    return { data: event, meta: scopeMeta(response.meta, [event.id]) };
  }
  async session(
    id: string,
  ): Promise<Envelope<{ event: Event; session: Session }>> {
    const target = await this.aliasYear(id);
    const response = await this.calendar(target.year);
    for (const event of response.data) {
      const session = event.sessions.find(
        (s) =>
          s.id === id ||
          (!!target.sessionKey &&
            s.externalIds.some(
              (x) => x.provider === 'openf1' && x.id === target.sessionKey,
            )),
      );
      if (session)
        return {
          data: { event, session: updateLifecycle(session) },
          meta: scopeMeta(response.meta, [event.id]),
        };
    }
    if (
      target.sessionKey &&
      response.meta.warnings.some((w) =>
        w.startsWith('openf1_session_enrichment:'),
      )
    )
      throw new UpstreamError('ALIAS_LOOKUP_FAILED');
    throw new NotFoundException('Session not found');
  }
  private record(result: ResultSet, year: number): ResultSet {
    const old = this.revisions.get(result.sessionId);
    if (old?.contentHash === result.contentHash)
      return { ...result, supersedesId: old.supersedesId };
    if (old) {
      result.supersedesId = old.id;
      if (/:race$|:sprint$/.test(result.sessionId)) {
        this.registry
          .forCapability('standings')
          .client.invalidateStandings(year);
        this.pendingStandings.set(year, ++this.revisionClock);
      }
    }
    if (this.revisions.size >= 256) {
      const oldest = this.revisions.keys().next().value as string | undefined;
      if (oldest) this.revisions.delete(oldest);
    }
    this.revisions.set(result.sessionId, result);
    return result;
  }
  async results(id: string): Promise<Envelope<ResultSet | null>> {
    const detail = await this.session(id);
    const { event, session } = detail.data;
    const noData = (
      state: Parameters<typeof meta>[0],
      warnings: string[] = [],
    ) => ({ data: null, meta: meta(state, detail.meta.sources, warnings) });
    if (session.lifecycle === 'cancelled') return noData('not_applicable');
    const supplemental = !['race', 'qualifying', 'sprint'].includes(
      session.kind,
    );
    if (supplemental && event.year < 2023) return noData('unsupported');
    if (
      session.scheduledDate > new Date(Date.now()).toISOString().slice(0, 10) ||
      (session.scheduledStartAt &&
        Date.now() < Date.parse(session.scheduledStartAt))
    )
      return noData('not_published');
    if (supplemental) {
      if (!session.externalIds.some((x) => x.provider === 'openf1')) {
        if (
          detail.meta.warnings.some((w) =>
            w.startsWith('openf1_session_enrichment:'),
          )
        )
          throw new UpstreamError('SESSION_ENRICHMENT_FAILED');
        return noData('unknown', ['session_mapping_unresolved']);
      }
      // Never request paid live-window endpoints. Unknown end gets a conservative six-hour window.
      const end = session.scheduledEndAt
        ? Date.parse(session.scheduledEndAt)
        : Date.parse(session.scheduledStartAt!) + 6 * 3_600_000;
      if (Date.now() < end + 30 * 60_000)
        return noData('access_restricted', ['free_historical_access_only']);
      const primary = this.registry.forCapability('identities');
      const [drivers, teams] = await Promise.all([
        primary.client.drivers(event.year),
        primary.client.constructors(event.year),
      ]);
      const response = await this.registry
        .forCapability(
          session.kind as 'fp1' | 'fp2' | 'fp3' | 'sprint_qualifying',
        )
        .results(
          session,
          drivers.value.map((r) => primary.mapper.driver(r)),
          teams.value.map((r) => primary.mapper.team(r)),
        );
      const result = response.result
        ? this.record(response.result, event.year)
        : null;
      return {
        data: result,
        meta: meta(
          result
            ? response.warnings.length
              ? 'partial'
              : 'available'
            : 'unknown',
          [...response.sources, drivers.source, teams.source],
          result
            ? response.warnings
            : ['empty_upstream_result_publication_unknown'],
        ),
      };
    }
    if (event.round === null) return noData('unsupported');
    const response = await this.registry
      .forCapability(session.kind as 'race' | 'qualifying' | 'sprint')
      .results(event.year, event.round, session);
    if (!response.value.rows.length)
      return {
        data: null,
        meta: meta(
          'unknown',
          [response.source],
          ['empty_upstream_result_publication_unknown'],
        ),
      };
    return {
      data: this.record(response.value, event.year),
      meta: {
        ...meta('available', [response.source]),
        consistency: this.pendingStandings.has(event.year)
          ? 'standings_refresh_pending'
          : 'independent_snapshots',
      },
    };
  }
  async standings(
    year: number,
    type: 'drivers' | 'constructors',
    round?: number,
  ): Promise<Envelope<Standings | null>> {
    const provider = this.registry.forCapability('standings');
    let refreshed: Awaited<ReturnType<typeof provider.standings>> | undefined;
    if (this.pendingStandings.has(year)) {
      const generation = this.pendingStandings.get(year);
      const pair = await Promise.all([
        provider.standings(year, 'drivers'),
        provider.standings(year, 'constructors'),
      ]);
      if (
        pair.every((r) => r.value !== null) &&
        this.pendingStandings.get(year) === generation
      )
        this.pendingStandings.delete(year);
      if (round === undefined) refreshed = pair[type === 'drivers' ? 0 : 1];
    }
    const response = refreshed ?? (await provider.standings(year, type, round));
    // Refetch both snapshots, but do not claim an atomic upstream publication.
    return {
      data: response.value,
      meta: {
        ...meta(
          response.value ? 'available' : 'unknown',
          [response.source],
          response.value
            ? []
            : ['empty_upstream_standings_publication_unknown'],
        ),
        consistency: this.pendingStandings.has(year)
          ? 'standings_refresh_pending'
          : 'independent_snapshots',
      },
    };
  }
  async raceControl(id: string) {
    const detail = await this.session(id);
    const { event, session } = detail.data;
    if (session.lifecycle === 'cancelled')
      return { data: [], meta: meta('not_applicable') };
    if (event.year < 2023) return { data: [], meta: meta('unsupported') };
    const key = session.externalIds.find((x) => x.provider === 'openf1')?.id;
    if (!key)
      return {
        data: [],
        meta: meta('unknown', [], ['session_mapping_unresolved']),
      };
    if (
      !session.scheduledEndAt ||
      Date.now() < Date.parse(session.scheduledEndAt) + 1_800_000
    )
      return {
        data: [],
        meta: meta('access_restricted', [], ['free_historical_access_only']),
      };
    const response = await this.registry
      .forCapability('race_control')
      .client.raceControl(Number(key));
    if (response.value.some((row) => String(row.session_key) !== key))
      throw new UpstreamError('INVALID_PAYLOAD');
    return {
      data: response.value.map((r) => ({
        occurredAt: instant(r.date),
        category: str(r.category),
        message: str(r.message),
        flag: str(r.flag),
        carNumber:
          integer(r.driver_number) === null
            ? null
            : String(integer(r.driver_number)),
        lapNumber: integer(r.lap_number),
      })),
      meta: meta('available', [response.source]),
    };
  }
}
