/** OpenGP-owned v1 DTOs. Monetary/scoring decimals remain strings. */
export type Provider = 'jolpica' | 'openf1';
export type Availability =
  | 'available'
  | 'partial'
  | 'not_published'
  | 'unsupported'
  | 'upstream_error'
  | 'access_restricted'
  | 'not_applicable'
  | 'unknown';
export type SessionKind =
  | 'fp1'
  | 'fp2'
  | 'fp3'
  | 'qualifying'
  | 'sprint_qualifying'
  | 'sprint'
  | 'race';
export interface ExternalIdentity {
  provider: Provider;
  entity: string;
  id: string;
  scope: string;
}
export interface Source {
  provider: Provider;
  resource: string;
  observedAt: string;
  contentHash: string;
  mappingVersion: '1';
  attribution: string;
}
export interface Meta {
  availability: Availability;
  sources: Source[];
  warnings: string[];
  pagination?: { limit: number; offset: number; total: number };
  consistency?: 'independent_snapshots' | 'standings_refresh_pending';
}
export interface Envelope<T> {
  data: T;
  meta: Meta;
}
export interface Series {
  id: string;
  name: string;
  category: string;
}
export interface Season {
  id: string;
  seriesId: string;
  year: number;
  name: string;
}
export interface Session {
  id: string;
  eventId: string;
  kind: SessionKind;
  name: string;
  scheduledDate: string;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  actualEndAt: string | null;
  timePrecision: 'instant' | 'date';
  lifecycle:
    | 'scheduled'
    | 'started'
    | 'suspended'
    | 'finished'
    | 'cancelled'
    | 'unknown';
  lifecycleBasis: 'clock' | 'provider' | 'unknown';
  externalIds: ExternalIdentity[];
}
export interface Event {
  id: string;
  seriesId: string;
  seasonId: string;
  year: number;
  name: string;
  round: number | null;
  startsOn: string;
  endsOn: string;
  status: 'scheduled' | 'cancelled';
  venue: {
    id: string;
    name: string;
    country: string | null;
    locality: string | null;
  };
  sessions: Session[];
  externalIds: ExternalIdentity[];
}
export interface Driver {
  id: string;
  name: string;
  code: string | null;
  externalIds: ExternalIdentity[];
}
export interface Constructor {
  id: string;
  name: string;
  externalIds: ExternalIdentity[];
}
export interface Entry {
  id: string;
  sessionId: string;
  carNumber: string | null;
  participantIds: string[];
  teamId: string | null;
}
export type Gap =
  | { kind: 'time'; milliseconds: number }
  | { kind: 'laps'; laps: number }
  | { kind: 'unknown'; text: string };
export interface ClassificationRow {
  id: string;
  entryId: string;
  participantId: string | null;
  displayOrder: number;
  classificationPosition: number | null;
  classificationStatus:
    | 'classified'
    | 'not_classified'
    | 'disqualified'
    | 'did_not_start'
    | 'unknown';
  finishStatus: 'finished' | 'dnf' | 'dns' | 'dsq' | 'unknown';
  points: string | null;
  lapsCompleted: number | null;
  raceElapsedMs: number | null;
  gapToLeader: Gap | null;
  practiceBestLapMs: number | null;
  qualifyingPhasesMs: (number | null)[] | null;
  gridPosition: number | null;
  gridStatus: 'position' | 'pit_lane_or_unknown' | 'unknown';
  rawStatus: string | null;
  rawPositionText: string | null;
}
export interface ResultSet {
  id: string;
  sessionId: string;
  publicationStatus: 'published_unverified';
  contentHash: string;
  observedAt: string;
  supersedesId: string | null;
  entries: Entry[];
  drivers: Driver[];
  teams: Constructor[];
  rows: ClassificationRow[];
}
export interface Standings {
  seasonId: string;
  type: 'drivers' | 'constructors';
  asOfRound: number;
  publicationStatus: 'published_unverified';
  rows: {
    position: number | null;
    points: string | null;
    wins: number | null;
    competitorId: string;
    teamIds: string[];
  }[];
  drivers: Driver[];
  teams: Constructor[];
}
export const F1: Series = {
  id: 'f1',
  name: 'Formula 1',
  category: 'open-wheel',
};
export const season = (year: number): Season => ({
  id: `f1-${year}`,
  seriesId: 'f1',
  year,
  name: `${year} Formula 1`,
});
export const identity = (
  provider: Provider,
  entity: string,
  id: string | number,
  scope = 'f1',
): ExternalIdentity => ({ provider, entity, id: String(id), scope });
export const meta = (
  availability: Availability = 'available',
  sources: Source[] = [],
  warnings: string[] = [],
): Meta => ({ availability, sources, warnings });

/** Keep date-filtered/detail availability tied to the resources actually returned. */
export function scopeMeta(original: Meta, eventIds: string[]): Meta {
  const warnings = original.warnings.filter(
    (warning) =>
      !warning.includes(':f1-') ||
      eventIds.some((id) => warning.includes(`:${id}`)),
  );
  return {
    ...original,
    warnings,
    availability:
      original.availability === 'partial' && warnings.length === 0
        ? 'available'
        : original.availability,
  };
}
