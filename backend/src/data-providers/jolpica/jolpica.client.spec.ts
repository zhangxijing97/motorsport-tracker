import { JolpicaClient } from './jolpica.client';
import { observe } from '../../../test/fixture';
describe('Jolpica pagination and schema validation', () => {
  it('follows leaf-count offsets without losing or duplicating result rows', async () => {
    const client = new JolpicaClient();
    const get = jest.spyOn(client.transport, 'get');
    const envelope = (offset: number, rows: unknown[]) =>
      observe({
        MRData: {
          total: '3',
          offset: String(offset),
          limit: '2',
          RaceTable: { Races: [{ Results: rows }] },
        },
      });
    get
      .mockResolvedValueOnce(
        envelope(0, [{ position: '1' }, { position: '2' }]),
      )
      .mockResolvedValueOnce(envelope(2, [{ position: '3' }]));
    const r = await client.results(2025, 2, 'race');
    expect(r.value.map((r) => r.position)).toEqual(['1', '2', '3']);
    expect(get.mock.calls[1][1]).toEqual({ limit: 100, offset: 2 });
  });
  it.each([
    { MRData: {} },
    {
      MRData: {
        total: '2',
        offset: '0',
        limit: '100',
        RaceTable: { Races: [] },
      },
    },
    {
      MRData: { total: '0', offset: '0', limit: '0', RaceTable: { Races: [] } },
    },
  ])('rejects malformed/truncated envelopes', async (value) => {
    const client = new JolpicaClient();
    jest.spyOn(client.transport, 'get').mockResolvedValue(observe(value));
    await expect(client.calendar(2025)).rejects.toThrow();
  });
  it('accepts a genuine empty successful calendar', async () => {
    const client = new JolpicaClient();
    jest.spyOn(client.transport, 'get').mockResolvedValue(
      observe({
        MRData: {
          total: '0',
          offset: '0',
          limit: '100',
          RaceTable: { Races: [] },
        },
      }),
    );
    expect((await client.calendar(2025)).value).toEqual([]);
  });
});
