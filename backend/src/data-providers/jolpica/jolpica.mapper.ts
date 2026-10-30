import { Injectable } from '@nestjs/common';
import {
  identity,
  type ClassificationRow,
  type Constructor,
  type Driver,
  type Entry,
  type Event,
  type ResultSet,
  type Session,
  type SessionKind,
  type Standings,
} from '../../racing/model';
import {
  array,
  decimal,
  instant,
  integer,
  lapMs,
  object,
  required,
  str,
  type RecordValue,
} from '../schema';
import { hash, UpstreamError, type Observation } from '../upstream-http';
export const slug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
export const names: Record<SessionKind, string> = {
  fp1: 'Practice 1',
  fp2: 'Practice 2',
  fp3: 'Practice 3',
  sprint_qualifying: 'Sprint Qualifying',
  sprint: 'Sprint',
  qualifying: 'Qualifying',
  race: 'Race',
};
export function updateLifecycle(session: Session, now = Date.now()): Session {
  if (session.lifecycle === 'cancelled') return session;
  const start = session.scheduledStartAt
    ? Date.parse(session.scheduledStartAt)
    : null;
  const end = session.scheduledEndAt
    ? Date.parse(session.scheduledEndAt)
    : null;
  // Without an end time, elapsed date alone is not proof of a finished session.
  return {
    ...session,
    lifecycle:
      start === null
        ? 'unknown'
        : now < start
          ? 'scheduled'
          : end !== null
            ? now >= end
              ? 'finished'
              : 'started'
            : 'unknown',
    lifecycleBasis: start === null ? 'unknown' : 'clock',
  };
}
export function emptyRow(entryId: string, order: number): ClassificationRow {
  return {
    id: `${entryId}:result`,
    entryId,
    participantId: null,
    displayOrder: order,
    classificationPosition: null,
    classificationStatus: 'unknown',
    finishStatus: 'unknown',
    points: null,
    lapsCompleted: null,
    raceElapsedMs: null,
    gapToLeader: null,
    practiceBestLapMs: null,
    qualifyingPhasesMs: null,
    gridPosition: null,
    gridStatus: 'unknown',
    rawStatus: null,
    rawPositionText: null,
  };
}
export function makeResult(
  sessionId: string,
  observedAt: string,
  entries: Entry[],
  drivers: Driver[],
  teams: Constructor[],
  rows: ClassificationRow[],
): ResultSet {
  const contentHash = hash({ entries, drivers, teams, rows });
  return {
    id: `${sessionId}:results:${contentHash.slice(0, 16)}`,
    sessionId,
    publicationStatus: 'published_unverified',
    contentHash,
    observedAt,
    supersedesId: null,
    entries,
    drivers,
    teams,
    rows,
  };
}
@Injectable()
export class JolpicaMapper {
  driver(raw: RecordValue): Driver {
    const id = required(raw.driverId);
    return {
      id: `f1-driver-${id}`,
      name: `${required(raw.givenName)} ${required(raw.familyName)}`,
      code: str(raw.code),
      externalIds: [identity('jolpica', 'driver', id)],
    };
  }
  team(raw: RecordValue): Constructor {
    const id = required(raw.constructorId);
    return {
      id: `f1-team-${id}`,
      name: required(raw.name),
      externalIds: [identity('jolpica', 'constructor', id)],
    };
  }
  event(raw: RecordValue): Event {
    const year = integer(raw.season);
    const round = integer(raw.round);
    if (!year || !round) throw new UpstreamError('INVALID_PAYLOAD');
    const name = required(raw.raceName);
    const id = `f1-${year}-${slug(name)}`;
    const circuit = object(raw.Circuit);
    const location = object(circuit.Location);
    const sessions: Session[] = [];
    const schedule: [SessionKind, unknown][] = [
      ['fp1', raw.FirstPractice],
      ['fp2', raw.SecondPractice],
      ['fp3', raw.ThirdPractice],
      ['qualifying', raw.Qualifying],
      [
        'sprint_qualifying',
        year >= 2023 ? (raw.SprintQualifying ?? raw.SprintShootout) : undefined,
      ],
      [
        'sprint',
        raw.Sprint ?? (year <= 2022 ? raw.SprintQualifying : undefined),
      ],
      ['race', raw],
    ];
    for (const [kind, value] of schedule) {
      if (value === undefined) continue;
      const time = object(value);
      const date = required(time.date);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date
      )
        throw new UpstreamError('INVALID_PAYLOAD');
      const start = time.time
        ? instant(`${date}T${required(time.time)}`)
        : null;
      if (time.time && !start) throw new UpstreamError('INVALID_PAYLOAD');
      sessions.push(
        updateLifecycle({
          id: `${id}:${kind}`,
          eventId: id,
          kind,
          name: names[kind],
          scheduledDate: date,
          scheduledStartAt: start,
          scheduledEndAt: null,
          actualEndAt: null,
          timePrecision: start ? 'instant' : 'date',
          lifecycle: 'unknown',
          lifecycleBasis: 'unknown',
          externalIds: [
            identity(
              'jolpica',
              'session',
              `${year}/${round}/${kind}`,
              String(year),
            ),
          ],
        }),
      );
    }
    const dates = sessions.map((s) => s.scheduledDate).sort();
    return {
      id,
      seriesId: 'f1',
      seasonId: `f1-${year}`,
      year,
      name,
      round,
      startsOn: dates[0],
      endsOn: dates.at(-1)!,
      status: 'scheduled',
      venue: {
        id: `f1-circuit-${required(circuit.circuitId)}`,
        name: required(circuit.circuitName),
        country: str(location.country),
        locality: str(location.locality),
      },
      sessions,
      externalIds: [
        identity('jolpica', 'event', `${year}/${round}`, String(year)),
      ],
    };
  }
  results(
    observation: Observation<RecordValue[]>,
    session: Session,
  ): ResultSet {
    const drivers = new Map<string, Driver>();
    const teams = new Map<string, Constructor>();
    const entries: Entry[] = [];
    const rows = observation.value.map((raw, i) => {
      const driver = this.driver(object(raw.Driver));
      const team = this.team(object(raw.Constructor));
      drivers.set(driver.id, driver);
      teams.set(team.id, team);
      // A source row is an observation for a participant. Do not deduplicate shared cars/positions.
      // W02/captured 1950 Britain shared-car pairs only; never infer shared ownership globally.
      const shared =
        session.id === 'f1-1950-british-grand-prix:race' &&
        ((raw.number === '10' &&
          ['f1-driver-fry', 'f1-driver-shawe_taylor'].includes(driver.id)) ||
          (raw.number === '9' &&
            ['f1-driver-rolt', 'f1-driver-peter_walker'].includes(driver.id)));
      const entryId = shared
        ? `${session.id}:entry:shared-${String(raw.number)}`
        : `${session.id}:entry:${driver.id}:${str(raw.number) ?? 'unknown'}:${team.id}`;
      let entry = entries.find((e) => e.id === entryId);
      if (entry) {
        if (!entry.participantIds.includes(driver.id))
          entry.participantIds.push(driver.id);
      } else {
        entry = {
          id: entryId,
          sessionId: session.id,
          carNumber: str(raw.number),
          participantIds: [driver.id],
          teamId: team.id,
        };
        entries.push(entry);
      }
      const row = emptyRow(entry.id, integer(raw.position) ?? i + 1);
      row.id = `${entry.id}:result:${driver.id}:${i}`;
      row.participantId = driver.id;
      const text = str(raw.positionText);
      const status = str(raw.status);
      const lower = status?.toLowerCase() ?? '';
      const dsq =
        text === 'D' || lower === 'disqualified' || lower === 'excluded';
      const dns =
        /did not start|did not qualify|did not prequalify|withdrawn/.test(
          lower,
        );
      const nc = lower === 'not classified' || text === 'N';
      const position =
        session.kind === 'qualifying'
          ? integer(raw.position)
          : text && /^\d+$/.test(text)
            ? integer(text)
            : null;
      row.classificationPosition =
        dsq || dns || nc ? null : position && position > 0 ? position : null;
      row.classificationStatus = dsq
        ? 'disqualified'
        : dns
          ? 'did_not_start'
          : row.classificationPosition !== null
            ? 'classified'
            : nc || text === 'R'
              ? 'not_classified'
              : 'unknown';
      row.finishStatus = dsq
        ? 'dsq'
        : dns
          ? 'dns'
          : lower === 'finished' || /^\+\d+ laps?$/.test(lower)
            ? 'finished'
            : nc || session.kind === 'qualifying' || !status
              ? 'unknown'
              : 'dnf';
      row.rawStatus = status;
      row.rawPositionText = text;
      row.points = decimal(raw.points);
      row.lapsCompleted = integer(raw.laps);
      const time = raw.Time ? object(raw.Time) : {};
      row.raceElapsedMs = integer(time.millis);
      const gap = str(time.time);
      const lapped = /^\+(\d+) Lap/.exec(status ?? '');
      row.gapToLeader = gap?.startsWith('+')
        ? { kind: 'time', milliseconds: lapMs(gap.slice(1)) ?? 0 }
        : lapped
          ? { kind: 'laps', laps: Number(lapped[1]) }
          : null;
      if (gap?.startsWith('+') && lapMs(gap.slice(1)) === null)
        row.gapToLeader = { kind: 'unknown', text: gap };
      if (session.kind === 'qualifying')
        row.qualifyingPhasesMs = [lapMs(raw.Q1), lapMs(raw.Q2), lapMs(raw.Q3)];
      const grid = integer(raw.grid);
      row.gridPosition = grid && grid > 0 ? grid : null;
      row.gridStatus =
        grid === 0
          ? 'pit_lane_or_unknown'
          : row.gridPosition !== null
            ? 'position'
            : 'unknown';
      return row;
    });
    return makeResult(
      session.id,
      observation.source.observedAt,
      entries,
      [...drivers.values()],
      [...teams.values()],
      rows,
    );
  }
  standings(
    observation: Observation<RecordValue[]>,
    year: number,
    type: 'drivers' | 'constructors',
  ): Standings | null {
    if (!observation.value.length) return null;
    const drivers = new Map<string, Driver>();
    const teams = new Map<string, Constructor>();
    const rounds = new Set(observation.value.map((r) => integer(r._round)));
    if (rounds.size !== 1 || rounds.has(null))
      throw new UpstreamError('INCONSISTENT_STANDINGS');
    const rows = observation.value.map((raw) => {
      const constructors =
        type === 'constructors'
          ? [object(raw.Constructor)]
          : array(raw.Constructors).map(object);
      const ts = constructors.map((c) => this.team(c));
      ts.forEach((t) => teams.set(t.id, t));
      const driver =
        type === 'drivers' ? this.driver(object(raw.Driver)) : null;
      if (driver) drivers.set(driver.id, driver);
      return {
        position: integer(raw.position),
        points: decimal(raw.points),
        wins: integer(raw.wins),
        competitorId: driver?.id ?? ts[0].id,
        teamIds: ts.map((t) => t.id),
      };
    });
    return {
      seasonId: `f1-${year}`,
      type,
      asOfRound: [...rounds][0]!,
      publicationStatus: 'published_unverified',
      rows,
      drivers: [...drivers.values()],
      teams: [...teams.values()],
    };
  }
}
