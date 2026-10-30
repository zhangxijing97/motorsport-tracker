import { Injectable } from '@nestjs/common';
import { array, integer, object, type RecordValue } from '../schema';
import {
  hash,
  UpstreamError,
  UpstreamHttp,
  type Observation,
} from '../upstream-http';
@Injectable()
export class JolpicaClient {
  readonly transport = new UpstreamHttp(
    'jolpica',
    'https://api.jolpi.ca/ergast/f1',
    { intervalMs: 3_600_000, count: 480, spacingMs: 260 },
  );
  /** total counts leaf records (e.g. result rows), not RaceTable containers. */
  async rows(
    path: string,
    table: string,
    field: string,
    leaf?: string,
    ttlMs = 300_000,
  ): Promise<Observation<RecordValue[]>> {
    const values: RecordValue[] = [];
    let offset = 0;
    let total: number | null = null;
    let source: Observation<unknown>['source'] | undefined;
    for (let page = 0; page < 100; page++) {
      const response = await this.transport.get(
        path,
        { limit: 100, offset },
        ttlMs,
      );
      const mr = object(object(response.value).MRData);
      const nextTotal = integer(mr.total);
      const limit = integer(mr.limit);
      if (
        nextTotal === null ||
        !limit ||
        integer(mr.offset) !== offset ||
        (total !== null && nextTotal !== total)
      )
        throw new UpstreamError('INCONSISTENT_PAGINATION');
      total = nextTotal;
      const containers = array(object(mr[table])[field]).map(object);
      const rows = leaf
        ? containers.flatMap((row) =>
            array(row[leaf]).map((value) => ({
              ...object(value),
              _round: row.round,
            })),
          )
        : containers;
      if (offset < total && rows.length === 0)
        throw new UpstreamError('INCOMPLETE_PAGINATION');
      values.push(...rows);
      source = response.source;
      offset += limit;
      if (offset >= total) {
        if (values.length !== total)
          throw new UpstreamError('INCOMPLETE_PAGINATION');
        return {
          value: values,
          source: { ...source, resource: path, contentHash: hash(values) },
        };
      }
    }
    throw new UpstreamError('PAGINATION_LIMIT');
  }
  calendar(year: number) {
    return this.rows(`/${year}.json`, 'RaceTable', 'Races', undefined, 900_000);
  }
  seasons() {
    return this.rows(
      '/seasons.json',
      'SeasonTable',
      'Seasons',
      undefined,
      86_400_000,
    );
  }
  results(year: number, round: number, kind: 'race' | 'qualifying' | 'sprint') {
    const path = {
      race: 'results',
      qualifying: 'qualifying',
      sprint: 'sprint',
    }[kind];
    const field = {
      race: 'Results',
      qualifying: 'QualifyingResults',
      sprint: 'SprintResults',
    }[kind];
    return this.rows(
      `/${year}/${round}/${path}.json`,
      'RaceTable',
      'Races',
      field,
    );
  }
  drivers(year: number) {
    return this.rows(
      `/${year}/drivers.json`,
      'DriverTable',
      'Drivers',
      undefined,
      3_600_000,
    );
  }
  constructors(year: number) {
    return this.rows(
      `/${year}/constructors.json`,
      'ConstructorTable',
      'Constructors',
      undefined,
      3_600_000,
    );
  }
  standings(year: number, type: 'drivers' | 'constructors', round?: number) {
    const name =
      type === 'drivers' ? 'driverStandings' : 'constructorStandings';
    return this.rows(
      `/${year}/${round ? `${round}/` : ''}${name}.json`,
      'StandingsTable',
      'StandingsLists',
      type === 'drivers' ? 'DriverStandings' : 'ConstructorStandings',
    );
  }
  invalidateStandings(year: number) {
    this.transport.invalidate(`/${year}/`, 'Standings');
  }
}
