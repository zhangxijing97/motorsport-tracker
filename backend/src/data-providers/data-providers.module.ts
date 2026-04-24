import { Module } from '@nestjs/common';
import { RacingDataProviderRegistry } from './racing-data-provider.registry';
import { OpenF1Client } from './openf1/openf1.client';
import { OpenF1Mapper } from './openf1/openf1.mapper';
import { OpenF1Provider } from './openf1/openf1.provider';
import { SportradarClient } from './sportradar/sportradar.client';
import { SportradarMapper } from './sportradar/sportradar.mapper';
import { SportradarProvider } from './sportradar/sportradar.provider';

@Module({
  providers: [
    RacingDataProviderRegistry,
    OpenF1Client,
    OpenF1Mapper,
    OpenF1Provider,
    SportradarClient,
    SportradarMapper,
    SportradarProvider,
  ],
  exports: [RacingDataProviderRegistry],
})
export class DataProvidersModule {}
