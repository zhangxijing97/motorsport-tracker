// import { Injectable } from '@nestjs/common';
// import { RacingDataProviderRegistry } from '../data-providers/racing-data-provider.registry';

// @Injectable()
// export class EventsService {
//   constructor(private readonly providerRegistry: RacingDataProviderRegistry) {}

//   getEventsByDate(date?: string, seriesId = 'f1') {
//     return this.providerRegistry
//       .getProvider(seriesId)
//       .getEventsByDate({ date, seriesId });
//   }

//   getUpcomingEvents(date?: string, seriesId = 'f1') {
//     return this.providerRegistry
//       .getProvider(seriesId)
//       .getUpcomingEvents({ date, seriesId });
//   }

//   getLiveEvents(date?: string, seriesId = 'f1') {
//     return this.providerRegistry
//       .getProvider(seriesId)
//       .getLiveEvents({ date, seriesId });
//   }

//   getPastEvents(date?: string, seriesId = 'f1') {
//     return this.providerRegistry
//       .getProvider(seriesId)
//       .getPastEvents({ date, seriesId });
//   }

//   getEventById(id: string, seriesId = 'f1') {
//     return this.providerRegistry
//       .getProvider(seriesId)
//       .getEventById({ id, seriesId });
//   }

//   getSessionDetailById(id: string, seriesId = 'f1') {
//     return this.providerRegistry
//       .getProvider(seriesId)
//       .getSessionDetailById({ id, seriesId });
//   }
// }

import { Injectable } from '@nestjs/common';
import { RacingDataProviderRegistry } from '../data-providers/racing-data-provider.registry';
import type { Event } from './types';

@Injectable()
export class EventsService {
  constructor(private readonly providerRegistry: RacingDataProviderRegistry) {}

  private async getFromAllProviders(
    date: string | undefined,
    methodName: 'getEventsByDate' | 'getUpcomingEvents' | 'getLiveEvents' | 'getPastEvents',
  ): Promise<Event[]> {
    const providers = this.providerRegistry.getAllProviders();

    const results = await Promise.allSettled(
      providers.flatMap((provider) =>
        provider.supportedSeriesIds.map((seriesId) =>
          provider[methodName]({ date, seriesId }),
        ),
      ),
    );

    return results.flatMap((result) =>
      result.status === 'fulfilled' ? result.value : [],
    );
  }

  getEventsByDate(date?: string, seriesId?: string) {
    if (seriesId) {
      return this.providerRegistry
        .getProvider(seriesId)
        .getEventsByDate({ date, seriesId });
    }

    return this.getFromAllProviders(date, 'getEventsByDate');
  }

  getUpcomingEvents(date?: string, seriesId?: string) {
    if (seriesId) {
      return this.providerRegistry
        .getProvider(seriesId)
        .getUpcomingEvents({ date, seriesId });
    }

    return this.getFromAllProviders(date, 'getUpcomingEvents');
  }

  getLiveEvents(date?: string, seriesId?: string) {
    if (seriesId) {
      return this.providerRegistry
        .getProvider(seriesId)
        .getLiveEvents({ date, seriesId });
    }

    return this.getFromAllProviders(date, 'getLiveEvents');
  }

  getPastEvents(date?: string, seriesId?: string) {
    if (seriesId) {
      return this.providerRegistry
        .getProvider(seriesId)
        .getPastEvents({ date, seriesId });
    }

    return this.getFromAllProviders(date, 'getPastEvents');
  }

  getEventById(id: string, seriesId = 'f1') {
    return this.providerRegistry
      .getProvider(seriesId)
      .getEventById({ id, seriesId });
  }

  getSessionDetailById(id: string, seriesId = 'f1') {
    return this.providerRegistry
      .getProvider(seriesId)
      .getSessionDetailById({ id, seriesId });
  }
}
