import { JolpicaMapper } from './jolpica.mapper';
import { array, object } from '../schema';
import { observe, races } from '../../../test/fixture';
const mapper = new JolpicaMapper();
function result(name: string, kind: 'race' | 'qualifying' | 'sprint' = 'race') {
  const race = races(name)[0];
  const event = mapper.event(race);
  const session = event.sessions.find((s) => s.kind === kind) ?? {
    ...event.sessions.at(-1)!,
    id: `${event.id}:${kind}`,
    kind,
  };
  return mapper.results(
    observe(
      array(
        race[
          {
            race: 'Results',
            qualifying: 'QualifyingResults',
            sprint: 'SprintResults',
          }[kind]
        ],
      ).map(object),
    ),
    session,
  );
}
describe('Jolpica historical mappings (captured supplier fixtures)', () => {
  it('maps Australia 2026 ordinary weekend without fabricated end times', () => {
    const event = mapper.event(races('australia-2026')[0]);
    expect(event.id).toBe('f1-2026-australian-grand-prix');
    expect(event.sessions).toHaveLength(5);
    expect(event.sessions.at(-1)).toMatchObject({
      scheduledStartAt: '2026-03-08T04:00:00.000Z',
      scheduledEndAt: null,
      actualEndAt: null,
    });
    const r = result('australia-2026-race');
    expect(r.drivers.find((d) => d.id === r.rows[0].participantId)?.name).toBe(
      'George Russell',
    );
    expect(r.rows[0].classificationPosition).toBe(1);
    expect(r.publicationStatus).toBe('published_unverified');
  });
  it('preserves qualifying phases independently of race order', () => {
    const r = result('australia-2026-qualifying', 'qualifying');
    expect(r.rows[0].qualifyingPhasesMs).toHaveLength(3);
    expect(r.rows[0].classificationPosition).toBe(1);
    expect(r.rows[0].raceElapsedMs).toBeNull();
  });
  it('maps China sprint and preserves 8 points, 19 laps', () => {
    const e = mapper.event(races('china-2025')[0]);
    expect(e.sessions.map((s) => s.kind)).toContain('sprint_qualifying');
    const r = result('china-2025-sprint', 'sprint');
    expect(r.rows[0]).toMatchObject({
      participantId: 'f1-driver-hamilton',
      classificationPosition: 1,
      points: '8',
      lapsCompleted: 19,
    });
  });
  it('keeps DSQ display order but never presents it as finishing rank', () => {
    const r = result('china-2025-race');
    for (const id of ['leclerc', 'hamilton', 'gasly'])
      expect(
        r.rows.find((x) => x.participantId === `f1-driver-${id}`),
      ).toMatchObject({
        classificationPosition: null,
        classificationStatus: 'disqualified',
        finishStatus: 'dsq',
      });
    expect(
      r.rows.find((x) => x.participantId === 'f1-driver-leclerc')
        ?.lapsCompleted,
    ).toBe(0);
    expect(
      r.rows.find((x) => x.participantId === 'f1-driver-alonso'),
    ).toMatchObject({ classificationPosition: null, finishStatus: 'dnf' });
  });
  it('retains DNS for Brazil 2024, including W positionText', () => {
    const r = result('brazil-2024');
    for (const id of ['albon', 'stroll'])
      expect(
        r.rows.find((x) => x.participantId === `f1-driver-${id}`),
      ).toMatchObject({ classificationPosition: null, finishStatus: 'dns' });
  });
  it('preserves Belgium half points as exact decimal strings', () => {
    expect(result('belgium-2021').rows[0]).toMatchObject({
      points: '12.5',
      lapsCompleted: 1,
    });
  });
  it('preserves 1950 NC, shared cars, duplicate ranks and per-driver points', () => {
    const r = result('britain-1950');
    expect(r.rows).toHaveLength(23);
    expect(r.entries).toHaveLength(21);
    expect(
      r.rows.find((x) => x.participantId === 'f1-driver-kelly'),
    ).toMatchObject({
      classificationStatus: 'not_classified',
      finishStatus: 'unknown',
      rawPositionText: 'R',
    });
    const shared = r.entries.find((e) => e.carNumber === '10')!;
    expect(shared.participantIds).toEqual([
      'f1-driver-fry',
      'f1-driver-shawe_taylor',
    ]);
    expect(
      r.rows
        .filter((x) => x.entryId === shared.id)
        .map((x) => x.classificationPosition),
    ).toEqual([10, 10]);
    expect(new Set(r.rows.map((r) => r.id)).size).toBe(23);
  });
  it('does not equate classified DNF with NC or null points with zero', () => {
    const race = races('china-2025-race')[0];
    const session = mapper.event(race).sessions.at(-1)!;
    const raw = {
      ...object(array(race.Results)[0]),
      positionText: '10',
      status: 'Engine',
      points: undefined,
      laps: undefined,
    };
    const r = mapper.results(observe([raw]), session).rows[0];
    expect(r).toMatchObject({
      classificationPosition: 10,
      finishStatus: 'dnf',
      classificationStatus: 'classified',
      points: null,
      lapsCompleted: null,
    });
  });
  it('keeps Entry identities stable when classification rows are reordered', () => {
    const race = races('china-2025-race')[0];
    const session = mapper.event(race).sessions.at(-1)!;
    const rows = array(race.Results).map(object);
    const before = mapper.results(observe(rows), session);
    const after = mapper.results(observe([...rows].reverse()), session);
    expect(after.entries.map((e) => e.id).sort()).toEqual(
      before.entries.map((e) => e.id).sort(),
    );
  });
  it('keeps date-only precision and rejects malformed required calendar data', () => {
    const raw = { ...races('britain-1950')[0] };
    delete raw.time;
    expect(mapper.event(raw).sessions.at(-1)).toMatchObject({
      scheduledStartAt: null,
      timePrecision: 'date',
    });
    expect(() => mapper.event({})).toThrow();
  });
  it('keeps event identity on round/date revision', () => {
    const raw = races('china-2025')[0];
    expect(mapper.event({ ...raw, round: '3', date: '2025-03-30' }).id).toBe(
      mapper.event(raw).id,
    );
  });
  it('maps historical Sprint Qualifying name to Sprint race only before 2023', () => {
    const raw = {
      ...races('china-2025')[0],
      season: '2021',
      Sprint: undefined,
    };
    expect(mapper.event(raw).sessions.some((s) => s.kind === 'sprint')).toBe(
      true,
    );
    expect(
      mapper.event(raw).sessions.some((s) => s.kind === 'sprint_qualifying'),
    ).toBe(false);
  });
});
