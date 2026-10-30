import { Injectable, NotFoundException } from '@nestjs/common';
import { JolpicaProvider } from './jolpica/jolpica.provider';
import { OpenF1Provider } from './openf1/openf1.provider';
import { SportradarProvider } from './sportradar/sportradar.provider';
import { NascarProvider } from './nascar/nascar.provider';
import type { RacingDataProvider } from './racing-data-provider.interface';
export type PrimaryCapability =
  | 'calendar'
  | 'identities'
  | 'seasons'
  | 'race'
  | 'qualifying'
  | 'sprint'
  | 'standings';
export type SupplementaryCapability =
  | 'sessions'
  | 'fp1'
  | 'fp2'
  | 'fp3'
  | 'sprint_qualifying'
  | 'race_control';
@Injectable()
export class RacingDataProviderRegistry {
  constructor(
    private readonly jolpica: JolpicaProvider,
    private readonly openf1: OpenF1Provider,
    private readonly sportradar: SportradarProvider,
    private readonly nascar: NascarProvider,
  ) {}
  forCapability(capability: PrimaryCapability): JolpicaProvider;
  forCapability(capability: SupplementaryCapability): OpenF1Provider;
  forCapability(
    capability: PrimaryCapability | SupplementaryCapability,
  ): JolpicaProvider | OpenF1Provider {
    switch (capability) {
      case 'calendar':
      case 'identities':
      case 'seasons':
      case 'race':
      case 'qualifying':
      case 'sprint':
      case 'standings':
        return this.jolpica;
      case 'sessions':
      case 'fp1':
      case 'fp2':
      case 'fp3':
      case 'sprint_qualifying':
      case 'race_control':
        return this.openf1;
    }
  }
  /** Legacy non-F1 adapters remain explicit opt-ins, outside the supported v1 catalog. */
  getProvider(seriesId: string): RacingDataProvider {
    const id = seriesId.toLowerCase();
    if (this.nascar.supportedSeriesIds.includes(id)) return this.nascar;
    if (this.sportradar.supportedSeriesIds.includes(id)) return this.sportradar;
    throw new NotFoundException(`Series ${seriesId} is not supported`);
  }
}
