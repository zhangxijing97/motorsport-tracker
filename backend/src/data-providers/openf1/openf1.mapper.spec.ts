import { OpenF1Mapper } from './openf1.mapper';
import { JolpicaMapper } from '../jolpica/jolpica.mapper';
import { array, object } from '../schema';
import { fixture, observe, races, records } from '../../../test/fixture';
const mapper = new OpenF1Mapper();
const primary = new JolpicaMapper();
const roster = array(
  object(object(object(fixture('drivers-2025')).MRData).DriverTable).Drivers,
).map((r) => primary.driver(object(r)));
const teams = array(
  object(object(object(fixture('constructors-2025')).MRData).ConstructorTable)
    .Constructors,
).map((r) => primary.team(object(r)));
const event = primary.event(races('china-2025')[0]);
const sessions = records('openf1-2025-sessions');
describe('OpenF1 mappings', () => {
  it('matches China season/circuit/race date and all five external session IDs', () => {
    const r = mapper.enrich([event], sessions);
    expect(r.warnings).toEqual([]);
    expect(r.events[0].externalIds).toContainEqual({
      provider: 'openf1',
      entity: 'event',
      id: '1255',
      scope: '2025',
    });
    expect(r.events[0].sessions.map((s) => s.externalIds.at(-1)?.id)).toEqual([
      '9988',
      '9994',
      '9989',
      '9993',
      '9998',
    ]);
    expect(r.events[0].sessions[0].actualEndAt).toBeNull();
  });
  it('matches Australia 2026 and preserves planned end separately', () => {
    const r = mapper.enrich(
      [primary.event(races('australia-2026')[0])],
      records('openf1-australia-2026'),
    );
    expect(r.warnings).toEqual([]);
    expect(r.events[0].sessions[0].scheduledEndAt).toBe(
      '2026-03-06T02:30:00.000Z',
    );
  });
  it('rejects country-only, wrong-year and ambiguous event matching', () => {
    expect(
      mapper.enrich(
        [event],
        sessions.map((s) => ({ ...s, circuit_key: 10 })),
      ).events[0].externalIds,
    ).toHaveLength(1);
    expect(
      mapper.enrich(
        [event],
        sessions.map((s) => ({ ...s, year: 2026 })),
      ).warnings,
    ).not.toEqual([]);
    expect(
      mapper.enrich([event], [...sessions, ...sessions]).warnings,
    ).not.toEqual([]);
  });
  it('records time conflict without overwriting Jolpica schedule', () => {
    const changed = sessions.map((s, i) =>
      i === 0 ? { ...s, date_start: '2025-03-21T03:35:00Z' } : s,
    );
    const r = mapper.enrich([event], changed);
    expect(r.warnings).toContain(`schedule_conflict:${event.id}:fp1`);
    expect(r.events[0].sessions[0].scheduledStartAt).toBe(
      '2025-03-21T03:30:00.000Z',
    );
  });
  it('retains all five Imola cancelled sessions without a fabricated GP round', () => {
    const r = mapper.enrich([], records('openf1-imola-2023'));
    expect(r.events).toHaveLength(1);
    expect(r.events[0]).toMatchObject({ round: null, status: 'cancelled' });
    expect(r.events[0].sessions).toHaveLength(5);
    expect(
      r.events[0].sessions.every(
        (s) => s.lifecycle === 'cancelled' && s.lifecycleBasis === 'provider',
      ),
    ).toBe(true);
  });
  it('uses published Practice ranks and lap times; maps canonical Norris identity', () => {
    const session = mapper
      .enrich([event], sessions)
      .events[0].sessions.find((s) => s.kind === 'fp1')!;
    const r = mapper.results(
      observe(records('openf1-china-fp1'), 'openf1'),
      session,
      records('openf1-china-drivers'),
      roster,
      teams,
    );
    expect(r.result.rows).toHaveLength(20);
    expect(r.warnings).toEqual([]);
    expect(
      r.result.rows.find((r) => r.classificationPosition === 1),
    ).toMatchObject({
      participantId: 'f1-driver-norris',
      practiceBestLapMs: 91504,
      lapsCompleted: 23,
      points: null,
    });
    // Disturb fastest lap ordering without changing supplier classification.
    const changed = records('openf1-china-fp1');
    changed[0].duration = 999;
    expect(
      mapper.results(
        observe(changed, 'openf1'),
        session,
        records('openf1-china-drivers'),
        roster,
        teams,
      ).result.rows[0].classificationPosition,
    ).toBe(changed[0].position);
  });
  it('preserves Hadjar P15 with DNF and null SQ phases', () => {
    const session = mapper
      .enrich([event], sessions)
      .events[0].sessions.find((s) => s.kind === 'sprint_qualifying')!;
    const participants = records('openf1-china-drivers').map((d) => ({
      ...d,
      session_key: 9989,
    })); // Synthetic participation scope for mapper-only test.
    const r = mapper.results(
      observe(records('openf1-china-sq'), 'openf1'),
      session,
      participants,
      roster,
      teams,
    );
    expect(
      r.result.rows.find((r) => r.participantId === 'f1-driver-hadjar'),
    ).toMatchObject({
      classificationPosition: 15,
      finishStatus: 'dnf',
      qualifyingPhasesMs: [92171, null, null],
    });
  });
  it('keeps unknown stand-ins scoped; never maps by number alone', () => {
    const session = mapper.enrich([event], sessions).events[0].sessions[0];
    const participants = records('openf1-china-drivers').map((d) => ({
      ...d,
      first_name: 'Unknown',
    }));
    const r = mapper.results(
      observe(records('openf1-china-fp1'), 'openf1'),
      session,
      participants,
      roster,
      teams,
    );
    expect(
      r.result.drivers.every((d) => d.id.startsWith('f1-unresolved-driver-')),
    ).toBe(true);
    expect(r.warnings.length).toBe(20);
  });
  it('validates result session scope, booleans and duration shape', () => {
    const session = mapper.enrich([event], sessions).events[0].sessions[0];
    const raw = records('openf1-china-fp1')[0];
    for (const change of [
      { session_key: 999 },
      { dnf: 'false' },
      { duration: [10] },
    ])
      expect(() =>
        mapper.results(
          observe([{ ...raw, ...change }], 'openf1'),
          session,
          [],
          [],
          [],
        ),
      ).toThrow();
  });
});
