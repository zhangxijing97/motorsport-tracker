/* Supertest response.body is intentionally asserted as received; these tests verify the wire schema. */
/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JolpicaClient } from '../src/data-providers/jolpica/jolpica.client';
import { OpenF1Client } from '../src/data-providers/openf1/openf1.client';
import { UpstreamError } from '../src/data-providers/upstream-http';
import { array, object } from '../src/data-providers/schema';
import { fixture, observe, records } from './fixture';

describe('F1 HTTP integration: real Nest app / clients / mappers, fixture transport', () => {
  let app: INestApplication<App>;
  let primary: JolpicaClient;
  let open: OpenF1Client;
  let primaryError: UpstreamError | undefined;
  let openError: UpstreamError | undefined;
  let emptyResult: boolean;
  let amended: boolean;
  let invalidated: jest.SpyInstance;
  let controlEmpty: boolean;
  function primaryPayload(path: string) {
    if (primaryError) throw primaryError;
    const files: Record<string, string> = {
      '/2025.json': 'china-2025',
      '/2026.json': 'australia-2026',
      '/2021.json': 'belgium-2021',
      '/1950.json': 'britain-1950',
      '/2025/2/results.json': 'china-2025-race',
      '/2025/2/sprint.json': 'china-2025-sprint',
      '/2026/1/results.json': 'australia-2026-race',
      '/2026/1/qualifying.json': 'australia-2026-qualifying',
      '/2025/drivers.json': 'drivers-2025',
      '/2025/constructors.json': 'constructors-2025',
      '/2025/driverStandings.json': 'china-2025-standings',
      '/2025/2/driverStandings.json': 'china-2025-standings',
      '/2025/constructorStandings.json': 'china-2025-constructors',
      '/2025/2/constructorStandings.json': 'china-2025-constructors',
      '/1950/1/results.json': 'britain-1950',
      '/2021/12/results.json': 'belgium-2021',
    };
    if (path === '/2023.json')
      return {
        MRData: {
          total: '0',
          offset: '0',
          limit: '100',
          RaceTable: { Races: [] },
        },
      };
    if (path === '/seasons.json')
      return {
        MRData: {
          total: '2',
          offset: '0',
          limit: '100',
          SeasonTable: { Seasons: [{ season: '2025' }, { season: '2026' }] },
        },
      };
    if (!files[path]) throw new Error(`Unmocked primary request ${path}`);
    const payload = object(fixture(files[path]));
    const mr = object(payload.MRData);
    if (['/2021.json', '/1950.json'].includes(path)) mr.total = '1'; // Minimized historical calendar from captured result container.
    if (path.endsWith('/results.json')) {
      if (emptyResult) {
        mr.total = '0';
        object(mr.RaceTable).Races = [];
      }
      if (amended && path === '/2025/2/results.json') {
        const race = object(array(object(mr.RaceTable).Races)[0]);
        const row = object(array(race.Results)[0]);
        row.positionText = 'D';
        row.status = 'Disqualified';
        row.points = '0';
      }
    }
    return payload;
  }
  function openPayload(
    path: string,
    params: Record<string, string | number> = {},
  ) {
    if (openError) throw openError;
    const sessions = [
      ...records('openf1-2025-sessions'),
      ...records('openf1-australia-2026'),
      ...records('openf1-imola-2023'),
    ];
    if (path === '/sessions')
      return sessions.filter((s) =>
        Object.entries(params).every(([k, v]) => String(s[k]) === String(v)),
      );
    if (path === '/session_result')
      return emptyResult
        ? []
        : fixture(
            params.session_key === 9988
              ? 'openf1-china-fp1'
              : 'openf1-china-sq',
          );
    if (path === '/drivers')
      return records('openf1-china-drivers').map((d) => ({
        ...d,
        session_key: params.session_key,
      }));
    if (path === '/race_control')
      return controlEmpty
        ? []
        : [
            {
              session_key: params.session_key,
              date: '2025-03-23T08:30:00+00:00',
              category: 'Flag',
              flag: 'CHEQUERED',
              message: 'SESSION FINISHED',
            },
          ];
    throw new Error(`Unmocked OpenF1 request ${path}`);
  }
  beforeEach(async () => {
    primaryError = undefined;
    openError = undefined;
    emptyResult = false;
    amended = false;
    controlEmpty = false;
    primary = new JolpicaClient();
    open = new OpenF1Client();
    jest
      .spyOn(primary.transport, 'get')
      .mockImplementation((path) =>
        Promise.resolve(observe(primaryPayload(path))),
      );
    jest
      .spyOn(open.transport, 'get')
      .mockImplementation((path, params) =>
        Promise.resolve(observe(openPayload(path, params), 'openf1')),
      );
    invalidated = jest.spyOn(primary.transport, 'invalidate');
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(JolpicaClient)
      .useValue(primary)
      .overrideProvider(OpenF1Client)
      .useValue(open)
      .compile();
    app = module.createNestApplication();
    await app.init();
  });
  afterEach(async () => {
    jest.restoreAllMocks();
    await app.close();
  });
  it('lists only supported F1 series and paginated seasons', async () => {
    const s = await request(app.getHttpServer())
      .get('/api/v1/series')
      .expect(200);
    expect(s.body.data.map((x: { id: string }) => x.id)).toEqual(['f1']);
    const y = await request(app.getHttpServer())
      .get('/api/v1/series/f1/seasons?limit=1&offset=1')
      .expect(200);
    expect(y.body.data[0].year).toBe(2026);
    expect(y.body.meta.pagination.total).toBe(2);
  });
  it('returns ordinary weekend and canonical/legacy alias details from the same event', async () => {
    const r = await request(app.getHttpServer())
      .get('/api/v1/events?year=2026')
      .expect(200);
    expect(r.body.meta.availability).toBe('available');
    expect(r.body.data[0].sessions).toHaveLength(5);
    const d = await request(app.getHttpServer())
      .get('/api/v1/events/openf1-1279')
      .expect(200);
    expect(d.body.data.id).toBe('f1-2026-australian-grand-prix');
    const old = await request(app.getHttpServer())
      .get('/events/openf1-1255')
      .expect(200);
    expect(old.body.id).toBe('f1-2025-chinese-grand-prix');
    const session = await request(app.getHttpServer())
      .get('/api/v1/sessions/openf1-session-9989')
      .expect(200);
    expect(session.body.data.session.kind).toBe('sprint_qualifying');
  });
  it('serves published race order and accurate legacy null DSQ rank', async () => {
    const r = await request(app.getHttpServer())
      .get('/api/v1/sessions/openf1-session-9998/results')
      .expect(200);
    expect(r.body.data.rows[0].participantId).toBe('f1-driver-piastri');
    expect(r.body.data.publicationStatus).toBe('published_unverified');
    const legacy = await request(app.getHttpServer())
      .get('/sessions/openf1-session-9998/detail')
      .expect(200);
    expect(
      legacy.body.classification.find(
        (r: { driverName: string }) => r.driverName === 'Lewis Hamilton',
      ).position,
    ).toBeNull();
    expect(legacy.body.availability).toBe('available');
  });
  it.each([
    ['fp1', 9988, 20],
    ['sprint_qualifying', 9989, 20],
  ])('routes %s to OpenF1', async (_, key, count) => {
    const r = await request(app.getHttpServer())
      .get(`/api/v1/sessions/openf1-session-${key}/results`)
      .expect(200);
    expect(r.body.data.rows).toHaveLength(count);
    expect(r.body.meta.sources[0].provider).toBe('openf1');
    expect(r.body.meta.availability).toBe('available');
  });
  it('keeps Imola cancelled with not_applicable results', async () => {
    const calendar = await request(app.getHttpServer())
      .get('/api/v1/events?year=2023')
      .expect(200);
    expect(calendar.body.data[0].sessions).toHaveLength(5);
    const r = await request(app.getHttpServer())
      .get('/api/v1/sessions/openf1-session-9086/results')
      .expect(200);
    expect(r.body.data).toBeNull();
    expect(r.body.meta.availability).toBe('not_applicable');
  });
  it('does not fetch future results or OpenF1 paid live-window data', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2025-03-20T00:00:00Z'));
    const future = await request(app.getHttpServer())
      .get('/api/v1/sessions/openf1-session-9988/results')
      .expect(200);
    expect(future.body.meta.availability).toBe('not_published');
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2025-03-21T04:45:00Z'));
    const live = await request(app.getHttpServer())
      .get('/api/v1/sessions/openf1-session-9988/results')
      .expect(200);
    expect(live.body.meta.availability).toBe('access_restricted');
    expect(open.transport.get).not.toHaveBeenCalledWith(
      '/session_result',
      expect.anything(),
      expect.anything(),
    );
  });
  it('distinguishes historical empty results from a truly empty race-control feed', async () => {
    emptyResult = true;
    controlEmpty = true;
    const r = await request(app.getHttpServer())
      .get('/api/v1/sessions/openf1-session-9998/results')
      .expect(200);
    expect(r.body.meta.availability).toBe('unknown');
    expect(r.body.data).toBeNull();
    const control = await request(app.getHttpServer())
      .get('/api/v1/sessions/openf1-session-9998/race-control')
      .expect(200);
    expect(control.body.data).toEqual([]);
    expect(control.body.meta.availability).toBe('available');
  });
  it('keeps Race Control messages separate from classification publication', async () => {
    const r = await request(app.getHttpServer())
      .get('/api/v1/sessions/openf1-session-9998/race-control?limit=1')
      .expect(200);
    expect(r.body.data[0].message).toBe('SESSION FINISHED');
    expect(r.body.data[0].occurredAt).toBe('2025-03-23T08:30:00.000Z');
    expect(r.body.data[0].publicationStatus).toBeUndefined();
  });
  it('returns standings as of source round, with decimal-string points', async () => {
    const r = await request(app.getHttpServer())
      .get('/api/v1/standings?seasonId=f1-2025&type=drivers&round=2&limit=2')
      .expect(200);
    expect(r.body.data.asOfRound).toBe(2);
    expect(r.body.data.rows).toHaveLength(2);
    expect(typeof r.body.data.rows[0].points).toBe('string');
  });
  it('detects result revision, invalidates standings and refreshes both tables', async () => {
    const url = '/api/v1/sessions/f1-2025-chinese-grand-prix:race/results';
    const first = await request(app.getHttpServer()).get(url).expect(200);
    amended = true;
    const second = await request(app.getHttpServer()).get(url).expect(200);
    expect(second.body.data.supersedesId).toBe(first.body.data.id);
    expect(second.body.data.id).not.toBe(first.body.data.id);
    expect(second.body.meta.consistency).toBe('standings_refresh_pending');
    expect(invalidated).toHaveBeenCalledWith('/2025/', 'Standings');
    const repeated = await request(app.getHttpServer()).get(url).expect(200);
    expect(repeated.body.data.supersedesId).toBe(first.body.data.id);
    const standings = await request(app.getHttpServer())
      .get('/api/v1/standings?seasonId=f1-2025')
      .expect(200);
    expect(standings.body.meta.consistency).toBe('independent_snapshots');
    expect(primary.transport.get).toHaveBeenCalledWith(
      '/2025/constructorStandings.json',
      expect.anything(),
      expect.anything(),
    );
  });
  it('surfaces supplementary errors as partial calendar while primary race remains usable', async () => {
    openError = new UpstreamError('UPSTREAM_TIMEOUT');
    const calendar = await request(app.getHttpServer())
      .get('/api/v1/events?year=2025')
      .expect(200);
    expect(calendar.body.meta.availability).toBe('partial');
    const r = await request(app.getHttpServer())
      .get('/api/v1/sessions/f1-2025-chinese-grand-prix:race/results')
      .expect(200);
    expect(r.body.data.rows.length).toBeGreaterThan(0);
    await request(app.getHttpServer())
      .get('/api/v1/sessions/f1-2025-chinese-grand-prix:fp1/results')
      .expect(502);
  });
  it.each([
    ['UPSTREAM_NOT_FOUND', 404, 502],
    ['UPSTREAM_RATE_LIMIT', 429, 503],
    ['UPSTREAM_TIMEOUT', undefined, 502],
    ['UPSTREAM_ERROR', 500, 502],
    ['ACCESS_RESTRICTED', 403, 503],
  ] as const)(
    'returns structured %s rather than an empty result',
    async (code, upstreamStatus, expectedStatus) => {
      primaryError = new UpstreamError(
        code,
        upstreamStatus,
        code === 'UPSTREAM_RATE_LIMIT' ? 60 : undefined,
      );
      const r = await request(app.getHttpServer())
        .get('/api/v1/events?year=2025')
        .expect(expectedStatus);
      expect(r.body.error.code).toBe(code);
      expect(r.body.data).toBeUndefined();
      if (upstreamStatus === 429) expect(r.headers['retry-after']).toBe('60');
    },
  );
  it.each([
    'year=2025&from=2025-02-30',
    'limit=101',
    'limit=1.5',
    'offset=-1',
    'year=2025&year=2026',
    'from=2025-05-01&to=2025-04-01',
    'from=2023-01-01&to=2026-01-01',
    'unexpected=x',
    'seriesId[]=f1',
  ])('rejects invalid queries: %s', async (q) => {
    await request(app.getHttpServer()).get(`/api/v1/events?${q}`).expect(400);
    expect(primary.transport.get).not.toHaveBeenCalled();
  });
  it('returns explicit unsupported and real local 404', async () => {
    const s = await request(app.getHttpServer())
      .get('/api/v1/events?seriesId=indycar')
      .expect(422);
    expect(s.body.meta.availability).toBe('unsupported');
    await request(app.getHttpServer())
      .get('/api/v1/events/f1-2025-not-a-grand-prix')
      .expect(404);
    await request(app.getHttpServer())
      .get('/api/v1/sessions/openf1-session-999999/results')
      .expect(404);
  });
  it('retains UTC date filtering for old list endpoints', async () => {
    const r = await request(app.getHttpServer())
      .get('/events/today?date=2025-03-21')
      .expect(200);
    expect(r.body).toHaveLength(1);
    expect(r.body[0].sessions).toHaveLength(2);
    await request(app.getHttpServer())
      .get('/events/today?date=2025-02-30')
      .expect(400);
  });
});
