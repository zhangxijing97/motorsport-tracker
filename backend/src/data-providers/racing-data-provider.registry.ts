import { Injectable, NotFoundException } from '@nestjs/common';
import type { RacingDataProvider } from './racing-data-provider.interface';
import { OpenF1Provider } from './openf1/openf1.provider';
import { SportradarProvider } from './sportradar/sportradar.provider';

@Injectable()
export class RacingDataProviderRegistry {
  constructor(
    private readonly openF1Provider: OpenF1Provider,
    private readonly sportradarProvider: SportradarProvider,
  ) {}

  getAllProviders(): RacingDataProvider[] {
    return [this.openF1Provider, this.sportradarProvider];
  }

  getProvider(seriesId = 'f1'): RacingDataProvider {
    const normalizedSeriesId = seriesId.toLowerCase();

    const provider = this.getAllProviders().find((item) =>
      item.supportedSeriesIds.includes(normalizedSeriesId),
    );

    if (!provider) {
      throw new NotFoundException(
        `Racing data provider "${seriesId}" is not supported`,
      );
    }

    return provider;
  }
}
