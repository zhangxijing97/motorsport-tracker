import { RacingService } from './racing.service';
import { RacingDataProviderRegistry } from '../data-providers/racing-data-provider.registry';
import { JolpicaMapper } from '../data-providers/jolpica/jolpica.mapper';
import { meta } from './model';
import { races } from '../../test/fixture';
describe('capability availability', () => {
  it('reports pre-2023 Practice as unsupported without querying a result provider', async () => {
    const registry = { forCapability: jest.fn() };
    const service = new RacingService(
      registry as unknown as RacingDataProviderRegistry,
    );
    const event = new JolpicaMapper().event(races('britain-1950')[0]);
    // Synthetic historical session; tests capability policy, not a claimed 1950 Practice schedule.
    const session = {
      ...event.sessions[0],
      kind: 'fp1' as const,
      id: `${event.id}:fp1`,
    };
    jest
      .spyOn(service, 'session')
      .mockResolvedValue({ data: { event, session }, meta: meta() });
    expect((await service.results(session.id)).meta.availability).toBe(
      'unsupported',
    );
    expect(registry.forCapability).not.toHaveBeenCalled();
  });
});
