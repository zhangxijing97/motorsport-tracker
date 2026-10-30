import { meta, scopeMeta } from './model';
import { updateLifecycle } from '../data-providers/jolpica/jolpica.mapper';
import { JolpicaMapper } from '../data-providers/jolpica/jolpica.mapper';
import { races } from '../../test/fixture';
describe('canonical status and warning scope', () => {
  it('does not leak an unrelated calendar conflict into an event detail', () => {
    const source = meta(
      'partial',
      [],
      ['schedule_conflict:f1-2026-miami-grand-prix:race'],
    );
    expect(scopeMeta(source, ['f1-2026-australian-grand-prix'])).toMatchObject({
      availability: 'available',
      warnings: [],
    });
    expect(scopeMeta(source, ['f1-2026-miami-grand-prix']).availability).toBe(
      'partial',
    );
    expect(
      scopeMeta(
        meta('partial', [], ['openf1_session_enrichment:UPSTREAM_ERROR']),
        [],
      ).availability,
    ).toBe('partial');
  });
  it('distinguishes planned end from measured end and unknown lifecycle', () => {
    const s = new JolpicaMapper().event(races('australia-2026')[0]).sessions[0];
    expect(
      updateLifecycle(s, Date.parse('2026-03-06T03:00:00Z')).lifecycle,
    ).toBe('unknown');
    expect(
      updateLifecycle(
        { ...s, scheduledEndAt: '2026-03-06T02:30:00Z' },
        Date.parse('2026-03-06T03:00:00Z'),
      ),
    ).toMatchObject({
      lifecycle: 'finished',
      lifecycleBasis: 'clock',
      actualEndAt: null,
    });
  });
});
