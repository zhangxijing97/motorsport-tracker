import { Injectable } from '@nestjs/common';
import {
  identity,
  type Driver,
  type Constructor,
  type Entry,
  type Event,
  type Session,
  type SessionKind,
} from '../../racing/model';
import {
  emptyRow,
  makeResult,
  names,
  slug,
  updateLifecycle,
} from '../jolpica/jolpica.mapper';
import {
  array,
  instant,
  integer,
  milliseconds,
  required,
  str,
  type RecordValue,
} from '../schema';
import { UpstreamError, type Observation } from '../upstream-http';
/** Explicit circuit crosswalk; observed OpenF1 2025 meetings. Unknown circuits fail closed. */
export const circuits: Record<string, number> = {
  albert_park: 10,
  shanghai: 49,
  suzuka: 46,
  bahrain: 63,
  jeddah: 149,
  miami: 151,
  imola: 6,
  monaco: 22,
  catalunya: 15,
  villeneuve: 23,
  red_bull_ring: 19,
  silverstone: 2,
  spa: 7,
  hungaroring: 4,
  zandvoort: 55,
  monza: 39,
  baku: 144,
  marina_bay: 61,
  americas: 9,
  rodriguez: 65,
  interlagos: 14,
  vegas: 152,
  losail: 150,
  yas_marina: 70,
};
const teamAliases: Record<string, string> = {
  'red bull racing': 'red_bull',
  ferrari: 'ferrari',
  mclaren: 'mclaren',
  mercedes: 'mercedes',
  'aston martin': 'aston_martin',
  alpine: 'alpine',
  williams: 'williams',
  'haas f1 team': 'haas',
  'kick sauber': 'sauber',
  'racing bulls': 'rb',
  rb: 'rb',
  'alpha tauri': 'alphatauri',
  alphatauri: 'alphatauri',
  'alfa romeo': 'alfa',
  audi: 'audi',
  cadillac: 'cadillac',
};
const normalized = (s: string) => slug(s).replace(/-/g, '');
@Injectable()
export class OpenF1Mapper {
  kind(raw: RecordValue): SessionKind | null {
    const name = required(raw.session_name).toLowerCase();
    const type = required(raw.session_type).toLowerCase();
    const year = integer(raw.year);
    if (type === 'practice')
      return (
        (
          {
            'practice 1': 'fp1',
            'practice 2': 'fp2',
            'practice 3': 'fp3',
          } as const
        )[name] ?? null
      );
    if (
      type === 'race' &&
      (name === 'sprint' ||
        ((year ?? 0) <= 2022 && name === 'sprint qualifying'))
    )
      return 'sprint';
    if (
      type === 'qualifying' &&
      (year ?? 0) >= 2023 &&
      ['sprint qualifying', 'sprint shootout'].includes(name)
    )
      return 'sprint_qualifying';
    if (type === 'qualifying' && name === 'qualifying') return 'qualifying';
    if (type === 'race' && name === 'race') return 'race';
    return null;
  }
  session(raw: RecordValue, eventId: string): Session | null {
    const kind = this.kind(raw);
    if (!kind) return null;
    const start = instant(raw.date_start);
    const end = instant(raw.date_end);
    const key = integer(raw.session_key);
    if (
      !start ||
      !key ||
      (raw.date_end != null && !end) ||
      (end && end < start) ||
      (raw.is_cancelled != null && typeof raw.is_cancelled !== 'boolean')
    )
      throw new UpstreamError('INVALID_PAYLOAD');
    return updateLifecycle({
      id: `${eventId}:${kind}`,
      eventId,
      kind,
      name: names[kind],
      scheduledDate: start.slice(0, 10),
      scheduledStartAt: start,
      scheduledEndAt: end,
      actualEndAt: null,
      timePrecision: 'instant',
      lifecycle: raw.is_cancelled === true ? 'cancelled' : 'unknown',
      lifecycleBasis: raw.is_cancelled === true ? 'provider' : 'unknown',
      externalIds: [identity('openf1', 'session', key, String(raw.year))],
    });
  }
  enrich(
    events: Event[],
    raw: RecordValue[],
  ): { events: Event[]; warnings: string[] } {
    const warnings: string[] = [];
    const used = new Set<number>();
    const enriched = events.map((event) => {
      const circuitKey = circuits[event.venue.id.replace('f1-circuit-', '')];
      // GP race date + circuit + season. Testing is never a GP candidate.
      const candidates = raw.filter(
        (s) =>
          integer(s.year) === event.year &&
          integer(s.circuit_key) === circuitKey &&
          this.kind(s) === 'race' &&
          instant(s.date_start)?.slice(0, 10) === event.endsOn,
      );
      if (candidates.length !== 1) {
        warnings.push(`session_mapping_unresolved:${event.id}`);
        return event;
      }
      const meetingKey = integer(candidates[0].meeting_key);
      if (!meetingKey) throw new UpstreamError('INVALID_PAYLOAD');
      used.add(meetingKey);
      const linked = raw.filter((s) => integer(s.meeting_key) === meetingKey);
      const sessions = event.sessions.map((session) => {
        const matches = linked.filter((s) => this.kind(s) === session.kind);
        if (matches.length !== 1) {
          warnings.push(`session_mapping_unresolved:${session.id}`);
          return session;
        }
        const mapped = this.session(matches[0], event.id)!;
        if (mapped.scheduledStartAt !== session.scheduledStartAt)
          warnings.push(`schedule_conflict:${session.id}`);
        const end =
          mapped.scheduledEndAt &&
          (!session.scheduledStartAt ||
            mapped.scheduledEndAt > session.scheduledStartAt)
            ? mapped.scheduledEndAt
            : null;
        return updateLifecycle({
          ...session,
          scheduledEndAt: end,
          lifecycle:
            mapped.lifecycle === 'cancelled' ? 'cancelled' : session.lifecycle,
          lifecycleBasis:
            mapped.lifecycle === 'cancelled'
              ? 'provider'
              : session.lifecycleBasis,
          externalIds: [...session.externalIds, ...mapped.externalIds],
        });
      });
      for (const record of linked) {
        const mapped = this.session(record, event.id);
        if (mapped && !sessions.some((s) => s.kind === mapped.kind)) {
          sessions.push(mapped);
          warnings.push(`supplemental_session:${mapped.id}`);
        }
      }
      return {
        ...event,
        sessions,
        status: sessions.every((s) => s.lifecycle === 'cancelled')
          ? ('cancelled' as const)
          : event.status,
        externalIds: [
          ...event.externalIds,
          identity('openf1', 'event', meetingKey, String(event.year)),
        ],
      };
    });
    // Explicit retained cancellation. Jolpica removes Imola 2023; never invent a round.
    const imola = raw.filter(
      (s) =>
        integer(s.year) === 2023 &&
        integer(s.meeting_key) === 1209 &&
        integer(s.circuit_key) === 6,
    );
    if (
      imola.length &&
      !used.has(1209) &&
      imola.every((s) => s.is_cancelled === true)
    ) {
      const id = 'f1-2023-emilia-romagna-grand-prix';
      const sessions = imola
        .map((s) => this.session(s, id))
        .filter((s): s is Session => s !== null);
      enriched.push({
        id,
        seriesId: 'f1',
        seasonId: 'f1-2023',
        year: 2023,
        name: 'Emilia Romagna Grand Prix',
        round: null,
        startsOn: '2023-05-19',
        endsOn: '2023-05-21',
        status: 'cancelled',
        venue: {
          id: 'f1-circuit-imola',
          name: 'Autodromo Enzo e Dino Ferrari',
          country: 'Italy',
          locality: 'Imola',
        },
        sessions,
        externalIds: [identity('openf1', 'event', 1209, '2023')],
      });
    }
    return {
      events: enriched.sort((a, b) => a.startsOn.localeCompare(b.startsOn)),
      warnings,
    };
  }
  results(
    observation: Observation<RecordValue[]>,
    session: Session,
    participants: RecordValue[],
    roster: Driver[],
    constructors: Constructor[],
  ) {
    const warnings: string[] = [];
    const drivers = new Map<string, Driver>();
    const teams = new Map<string, Constructor>();
    const entries: Entry[] = [];
    const key = session.externalIds.find((x) => x.provider === 'openf1')?.id;
    const rows = observation.value.map((raw, i) => {
      const number = integer(raw.driver_number);
      if (number === null || String(raw.session_key) !== key)
        throw new UpstreamError('INVALID_PAYLOAD');
      for (const flag of ['dnf', 'dns', 'dsq'])
        if (raw[flag] != null && typeof raw[flag] !== 'boolean')
          throw new UpstreamError('INVALID_PAYLOAD');
      const matches = participants.filter(
        (p) => p.driver_number === number && String(p.session_key) === key,
      );
      if (matches.length > 1) throw new UpstreamError('AMBIGUOUS_DRIVER');
      const participant = matches[0];
      const fullName = participant
        ? str(participant.first_name) && str(participant.last_name)
          ? `${String(participant.first_name)} ${String(participant.last_name)}`
          : str(participant.full_name)
        : null;
      // Exact season-roster name AND acronym. Car number alone never links a person.
      const known =
        fullName && participant
          ? roster.filter(
              (d) =>
                (normalized(d.name) === normalized(fullName) ||
                  (/^f1-202[56]-/.test(session.eventId) &&
                    d.id === 'f1-driver-antonelli' &&
                    fullName === 'Kimi Antonelli')) &&
                d.code !== null &&
                d.code === str(participant.name_acronym),
            )
          : [];
      const ext = identity('openf1', 'driver', number, `session:${key}`);
      const driver: Driver =
        known.length === 1
          ? { ...known[0], externalIds: [...known[0].externalIds, ext] }
          : {
              id: `f1-unresolved-driver-${key}-${number}`,
              name: fullName ?? `Car ${number}`,
              code: participant ? str(participant.name_acronym) : null,
              externalIds: [ext],
            };
      if (known.length !== 1)
        warnings.push(`driver_mapping_unresolved:${number}`);
      const teamName = participant ? str(participant.team_name) : null;
      const teamId = teamName ? teamAliases[teamName.toLowerCase()] : undefined;
      const team = constructors.find((t) => t.id === `f1-team-${teamId}`);
      if (!team) warnings.push(`team_mapping_unresolved:${number}`);
      drivers.set(driver.id, driver);
      if (team)
        teams.set(team.id, {
          ...team,
          externalIds: [
            ...team.externalIds,
            identity('openf1', 'team', teamName!, session.eventId),
          ],
        });
      const entry: Entry = {
        id: `${session.id}:entry:${number}`,
        sessionId: session.id,
        carNumber: String(number),
        participantIds: [driver.id],
        teamId: team?.id ?? null,
      };
      entries.push(entry);
      const row = emptyRow(entry.id, integer(raw.position) ?? i + 1);
      const position = integer(raw.position);
      row.participantId = driver.id;
      row.classificationPosition =
        raw.dsq === true || raw.dns === true
          ? null
          : position && position > 0
            ? position
            : null;
      row.classificationStatus =
        raw.dsq === true
          ? 'disqualified'
          : raw.dns === true
            ? 'did_not_start'
            : row.classificationPosition !== null
              ? 'classified'
              : 'unknown';
      row.finishStatus =
        raw.dsq === true
          ? 'dsq'
          : raw.dns === true
            ? 'dns'
            : raw.dnf === true
              ? 'dnf'
              : 'unknown';
      row.rawStatus = JSON.stringify({
        dnf: raw.dnf ?? null,
        dns: raw.dns ?? null,
        dsq: raw.dsq ?? null,
      });
      row.rawPositionText = position === null ? null : String(position);
      row.lapsCompleted = integer(raw.number_of_laps);
      if (session.kind === 'sprint_qualifying') {
        if (raw.duration != null && !Array.isArray(raw.duration))
          throw new UpstreamError('INVALID_PAYLOAD');
        const phases =
          raw.duration == null ? [null, null, null] : array(raw.duration);
        if (phases.length !== 3) throw new UpstreamError('INVALID_PAYLOAD');
        row.qualifyingPhasesMs = phases.map(milliseconds);
      } else {
        if (Array.isArray(raw.duration))
          throw new UpstreamError('INVALID_PAYLOAD');
        row.practiceBestLapMs = milliseconds(raw.duration);
        if (typeof raw.gap_to_leader === 'number')
          row.gapToLeader = {
            kind: 'time',
            milliseconds: milliseconds(raw.gap_to_leader)!,
          };
        else if (typeof raw.gap_to_leader === 'string')
          row.gapToLeader = { kind: 'unknown', text: raw.gap_to_leader };
      }
      return row;
    });
    if (new Set(entries.map((e) => e.id)).size !== entries.length)
      throw new UpstreamError('DUPLICATE_ENTRY');
    return {
      result: makeResult(
        session.id,
        observation.source.observedAt,
        entries,
        [...drivers.values()],
        [...teams.values()],
        rows,
      ),
      warnings,
    };
  }
}
