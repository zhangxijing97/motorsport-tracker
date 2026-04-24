import { Injectable, NotFoundException } from '@nestjs/common';
import type { RacingDataProvider } from './racing-data-provider.interface';
import { OpenF1Provider } from './openf1/openf1.provider';
import { SportradarProvider } from './sportradar/sportradar.provider';
import { NascarProvider } from './nascar/nascar.provider';

@Injectable()
export class RacingDataProviderRegistry {
  constructor(
    private readonly openF1Provider: OpenF1Provider,
    private readonly sportradarProvider: SportradarProvider,
    private readonly nascarProvider: NascarProvider,
  ) {}

  getAllProviders(): RacingDataProvider[] {
    return [
      this.openF1Provider,
      this.sportradarProvider,
      this.nascarProvider,
    ];
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
