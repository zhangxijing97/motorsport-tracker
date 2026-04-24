import { Module } from '@nestjs/common';
import { RacingDataProviderRegistry } from './racing-data-provider.registry';
import { OpenF1Client } from './openf1/openf1.client';
import { OpenF1Mapper } from './openf1/openf1.mapper';
import { OpenF1Provider } from './openf1/openf1.provider';
import { SportradarClient } from './sportradar/sportradar.client';
import { SportradarMapper } from './sportradar/sportradar.mapper';
import { SportradarProvider } from './sportradar/sportradar.provider';
import { NascarClient } from './nascar/nascar.client';
import { NascarMapper } from './nascar/nascar.mapper';
import { NascarProvider } from './nascar/nascar.provider';

@Module({
  providers: [
    RacingDataProviderRegistry,

    OpenF1Client,
    OpenF1Mapper,
    OpenF1Provider,

    SportradarClient,
    SportradarMapper,
    SportradarProvider,

    NascarClient,
    NascarMapper,
    NascarProvider,
  ],
  exports: [RacingDataProviderRegistry],
})
export class DataProvidersModule {}
