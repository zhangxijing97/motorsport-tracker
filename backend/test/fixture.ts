import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { array, object, type RecordValue } from '../src/data-providers/schema';
import { hash, type Observation } from '../src/data-providers/upstream-http';
import type { Provider } from '../src/racing/model';
export function fixture(name: string): unknown {
  return JSON.parse(
    readFileSync(join(__dirname, 'fixtures', `${name}.json`), 'utf8'),
  ) as unknown;
}
export function races(name: string): RecordValue[] {
  return array(
    object(object(object(fixture(name)).MRData).RaceTable).Races,
  ).map(object);
}
export function records(name: string): RecordValue[] {
  return array(fixture(name)).map(object);
}
export function observe<T>(
  value: T,
  provider: Provider = 'jolpica',
  resource = '/fixture',
): Observation<T> {
  return {
    value,
    source: {
      provider,
      resource,
      observedAt: '2026-10-30T07:30:00Z',
      contentHash: hash(value),
      mappingVersion: '1',
      attribution: `${provider} · CC BY-NC-SA 4.0`,
    },
  };
}
