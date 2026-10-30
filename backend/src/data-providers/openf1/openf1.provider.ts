import { Injectable } from '@nestjs/common';
import type { Constructor, Driver, Event, Session } from '../../racing/model';
import { OpenF1Client } from './openf1.client';
import { OpenF1Mapper } from './openf1.mapper';
@Injectable()
export class OpenF1Provider {
  constructor(
    readonly client: OpenF1Client,
    readonly mapper: OpenF1Mapper,
  ) {}
  async enrich(events: Event[], year: number) {
    const response = await this.client.sessions(year);
    return {
      ...this.mapper.enrich(events, response.value),
      source: response.source,
    };
  }
  async results(
    session: Session,
    roster: Driver[],
    constructors: Constructor[],
  ) {
    const key = Number(
      session.externalIds.find(
        (x) => x.provider === 'openf1' && x.entity === 'session',
      )?.id,
    );
    const response = await this.client.results(key);
    if (!response.value.length)
      return { result: null, sources: [response.source], warnings: [] };
    const drivers = await this.client.drivers(key);
    return {
      ...this.mapper.results(
        response,
        session,
        drivers.value,
        roster,
        constructors,
      ),
      sources: [response.source, drivers.source],
    };
  }
}
