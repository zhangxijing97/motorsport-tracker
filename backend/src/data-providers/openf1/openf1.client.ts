import { Injectable } from '@nestjs/common';
import { array, object, type RecordValue } from '../schema';
import { UpstreamHttp, type Observation } from '../upstream-http';
@Injectable()
export class OpenF1Client {
  readonly transport = new UpstreamHttp('openf1', 'https://api.openf1.org/v1', {
    intervalMs: 60_000,
    count: 28,
    spacingMs: 350,
  });
  async rows(
    path: string,
    params: Record<string, string | number>,
    ttl = 900_000,
  ): Promise<Observation<RecordValue[]>> {
    const response = await this.transport.get(path, params, ttl);
    return { ...response, value: array(response.value).map(object) };
  }
  sessions(year: number) {
    return this.rows('/sessions', { year });
  }
  session(key: number) {
    return this.rows('/sessions', { session_key: key });
  }
  meetingSessions(key: number) {
    return this.rows('/sessions', { meeting_key: key });
  }
  results(key: number) {
    return this.rows('/session_result', { session_key: key }, 300_000);
  }
  drivers(key: number) {
    return this.rows('/drivers', { session_key: key }, 3_600_000);
  }
  raceControl(key: number) {
    return this.rows('/race_control', { session_key: key }, 300_000);
  }
}
