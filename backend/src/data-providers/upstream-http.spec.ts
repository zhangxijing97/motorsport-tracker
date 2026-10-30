import axios, {
  AxiosError,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios';
import { UpstreamHttp } from './upstream-http';
function failure(status?: number, retry?: string) {
  return new AxiosError(
    'test',
    status ? undefined : 'ECONNABORTED',
    undefined,
    undefined,
    status
      ? {
          status,
          statusText: 'test',
          data: {},
          headers: retry ? { 'retry-after': retry } : {},
          config: {} as InternalAxiosRequestConfig,
        }
      : undefined,
  );
}
function transport(adapter: jest.Mock) {
  return new UpstreamHttp(
    'jolpica',
    'https://example.invalid',
    { intervalMs: 3600000, count: 10, spacingMs: 1 },
    axios.create({ adapter: adapter as AxiosAdapter }),
  );
}
describe('bounded cached upstream transport (no network)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());
  it('coalesces identical requests, caches them and expires for revisions', async () => {
    const adapter = jest.fn().mockResolvedValue({
      data: { result: 1 },
      status: 200,
      headers: {},
      config: {},
    });
    const http = transport(adapter);
    const first = http.get('/results', {}, 1000);
    const concurrent = http.get('/results', {}, 1000);
    await jest.runAllTimersAsync();
    expect(await first).toEqual(await concurrent);
    await http.get('/results', {}, 1000);
    expect(adapter).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(1001);
    adapter.mockResolvedValue({
      data: { result: 2 },
      status: 200,
      headers: {},
      config: {},
    });
    const revised = http.get('/results', {}, 1000);
    await jest.runAllTimersAsync();
    expect((await revised).source.contentHash).not.toBe(
      (await first).source.contentHash,
    );
  });
  it('invalidates cached standings and prevents in-flight stale recaching', async () => {
    let release!: (r: unknown) => void;
    const adapter = jest
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            release = resolve;
          }),
      )
      .mockResolvedValue({ data: [2], status: 200, headers: {}, config: {} });
    const http = transport(adapter);
    const stale = http.get('/2025/driverStandings.json');
    await jest.advanceTimersByTimeAsync(2);
    http.invalidate('/2025/', 'Standings');
    release({ data: [1], status: 200, headers: {}, config: {} });
    await stale;
    const fresh = http.get('/2025/driverStandings.json');
    await jest.runAllTimersAsync();
    expect((await fresh).value).toEqual([2]);
    expect(adapter).toHaveBeenCalledTimes(2);
  });
  it.each([404, 400, 401, 403])(
    'does not retry HTTP %i or cache its failure',
    async (status) => {
      const adapter = jest.fn().mockRejectedValue(failure(status));
      const http = transport(adapter);
      const assertion = expect(http.get('/x')).rejects.toMatchObject({
        status,
      });
      await jest.runAllTimersAsync();
      await assertion;
      expect(adapter).toHaveBeenCalledTimes(1);
    },
  );
  it.each([500, undefined])(
    'bounds retries for HTTP %s / timeout',
    async (status) => {
      const adapter = jest.fn().mockRejectedValue(failure(status));
      const http = transport(adapter);
      const assertion = expect(http.get('/x')).rejects.toMatchObject({
        code: status ? 'UPSTREAM_ERROR' : 'UPSTREAM_TIMEOUT',
      });
      await jest.runAllTimersAsync();
      await assertion;
      expect(adapter).toHaveBeenCalledTimes(3);
    },
  );
  it('respects Retry-After and fails fast for a long cooldown', async () => {
    const adapter = jest.fn().mockRejectedValue(failure(429, '60'));
    const http = transport(adapter);
    const assertion = expect(http.get('/x')).rejects.toMatchObject({
      code: 'UPSTREAM_RATE_LIMIT',
      retryAfterSeconds: 60,
    });
    await jest.runAllTimersAsync();
    await assertion;
    await expect(http.get('/y')).rejects.toMatchObject({
      code: 'UPSTREAM_RATE_LIMIT',
    });
    expect(adapter).toHaveBeenCalledTimes(1);
  });
  it('retries short 429 waits and enforces rolling request budget', async () => {
    const adapter = jest
      .fn()
      .mockRejectedValueOnce(failure(429, '1'))
      .mockResolvedValue({ data: [], status: 200, headers: {}, config: {} });
    const http = new UpstreamHttp(
      'openf1',
      'https://example.invalid',
      { intervalMs: 60000, count: 2, spacingMs: 350 },
      axios.create({ adapter: adapter as AxiosAdapter }),
    );
    const pending = http.get('/x');
    await jest.runAllTimersAsync();
    expect((await pending).value).toEqual([]);
    await expect(http.get('/y')).rejects.toMatchObject({
      code: 'UPSTREAM_RATE_LIMIT',
    });
    expect(adapter).toHaveBeenCalledTimes(2);
  });
});
