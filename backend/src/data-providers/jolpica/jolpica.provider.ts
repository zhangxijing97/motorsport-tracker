import { Injectable } from '@nestjs/common';
import type { Session } from '../../racing/model';
import { JolpicaClient } from './jolpica.client';
import { JolpicaMapper } from './jolpica.mapper';
@Injectable()
export class JolpicaProvider {
  constructor(
    readonly client: JolpicaClient,
    readonly mapper: JolpicaMapper,
  ) {}
  async calendar(year: number) {
    const response = await this.client.calendar(year);
    return {
      value: response.value.map((r) => this.mapper.event(r)),
      source: response.source,
    };
  }
  async results(year: number, round: number, session: Session) {
    if (
      session.kind !== 'race' &&
      session.kind !== 'qualifying' &&
      session.kind !== 'sprint'
    )
      throw new Error('Unsupported Jolpica result capability');
    const response = await this.client.results(year, round, session.kind);
    return {
      value: this.mapper.results(response, session),
      source: response.source,
    };
  }
  async standings(
    year: number,
    type: 'drivers' | 'constructors',
    round?: number,
  ) {
    const response = await this.client.standings(year, type, round);
    return {
      value: this.mapper.standings(response, year, type),
      source: response.source,
    };
  }
}
