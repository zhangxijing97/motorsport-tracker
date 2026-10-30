/* eslint-disable @typescript-eslint/unbound-method -- These are assertions on mocked methods, never detached invocations. */
import { EventsService } from './events.service';
import { RacingDataProviderRegistry } from '../data-providers/racing-data-provider.registry';
import { RacingService } from '../racing/racing.service';
import { UpstreamError } from '../data-providers/upstream-http';
describe('legacy EventsService', () => {
  it('defaults to F1 and propagates primary upstream failure instead of returning []', async () => {
    const registry = {
      getProvider: jest.fn(),
    } as unknown as RacingDataProviderRegistry;
    const racing = {
      calendar: jest
        .fn()
        .mockRejectedValue(new UpstreamError('UPSTREAM_ERROR')),
    } as unknown as RacingService;
    const service = new EventsService(registry, racing);
    await expect(service.getEventsByDate('2025-03-23')).rejects.toThrow(
      'UPSTREAM_ERROR',
    );
    expect(registry.getProvider).not.toHaveBeenCalled();
  });
  it('rejects invalid dates before accessing upstreams', async () => {
    const racing = { calendar: jest.fn() } as unknown as RacingService;
    const service = new EventsService({} as RacingDataProviderRegistry, racing);
    await expect(service.getEventsByDate('2025-02-30')).rejects.toThrow();
    expect(racing.calendar).not.toHaveBeenCalled();
  });
});
