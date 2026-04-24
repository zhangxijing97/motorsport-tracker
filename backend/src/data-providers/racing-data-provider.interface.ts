import type { Event, SessionDetail } from '../events/types';

export type ProviderRequest = {
  date?: string;
  seriesId: string;
};

export type ProviderDetailRequest = {
  id: string;
  seriesId: string;
};

export interface RacingDataProvider {
  supportedSeriesIds: string[];

  getEventsByDate(request: ProviderRequest): Promise<Event[]>;

  getUpcomingEvents(request: ProviderRequest): Promise<Event[]>;

  getLiveEvents(request: ProviderRequest): Promise<Event[]>;

  getPastEvents(request: ProviderRequest): Promise<Event[]>;

  getEventById(request: ProviderDetailRequest): Promise<Event>;

  getSessionDetailById(
    request: ProviderDetailRequest,
  ): Promise<SessionDetail | null>;
}
