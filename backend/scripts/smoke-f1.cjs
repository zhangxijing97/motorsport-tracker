/* Opt-in integration probe. Never run as an offline test or CI prerequisite. */
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const assert = require('node:assert/strict');
const fs = require('node:fs');
async function main() {
  const app = await NestFactory.create(AppModule, { logger: false });
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  const checks = [
    ['/api/v1/series/f1/seasons?limit=100', (r) => { assert.ok(r.data.some(s => s.year === 2025)); }],
    ['/api/v1/sessions/openf1-session-9993/results', (r) => { assert.equal(r.data.rows[0].participantId, 'f1-driver-hamilton'); assert.equal(r.data.rows[0].points, '8'); }],
    ['/api/v1/events?year=2026&from=2026-03-06&to=2026-03-08', (r) => { assert.equal(r.data.length, 1); assert.equal(r.data[0].sessions.length, 5); }],
    ['/api/v1/sessions/f1-2026-australian-grand-prix:race/results', (r) => { assert.equal(r.data.rows[0].participantId, 'f1-driver-russell'); }],
    ['/api/v1/sessions/f1-2026-australian-grand-prix:qualifying/results', (r) => { assert.equal(r.data.rows[0].qualifyingPhasesMs.length, 3); }],
    ['/api/v1/sessions/openf1-session-9988/results', (r) => { assert.equal(r.data.rows.length, 20); assert.equal(r.data.rows.find(x => x.participantId === 'f1-driver-norris').practiceBestLapMs, 91504); }],
    ['/api/v1/sessions/openf1-session-9989/results', (r) => { assert.equal(r.data.rows.length, 20); assert.equal(r.data.rows.find(x => x.participantId === 'f1-driver-hadjar').classificationPosition, 15); }],
    ['/api/v1/standings?seasonId=f1-2025&round=2&type=drivers', (r) => { assert.equal(r.data.asOfRound, 2); assert.ok(r.data.rows.length >= 20); }],
    ['/api/v1/sessions/f1-1950-british-grand-prix:race/results', (r) => { assert.equal(r.data.rows.length, 23); assert.equal(r.data.entries.length, 21); }],
    ['/api/v1/sessions/f1-2021-belgian-grand-prix:race/results', (r) => { assert.equal(r.data.rows[0].points, '12.5'); }],
    ['/api/v1/sessions/openf1-session-9086/results', (r) => { assert.equal(r.meta.availability, 'not_applicable'); assert.equal(r.data, null); }],
    ['/api/v1/sessions/openf1-session-9998/race-control', (r) => { assert.equal(r.meta.availability, 'available'); assert.ok(r.data.length > 0); }],
  ];
  const evidence = { checkedAt: new Date().toISOString(), mode: 'real upstream via local Nest HTTP server; no deployment', checks: [] };
  try {
    for (const [path, verify] of checks) {
      try {
        const response = await fetch(base + path, { signal: AbortSignal.timeout(90000) });
        const json = await response.json(); assert.equal(response.status, 200, JSON.stringify(json)); verify(json);
        const entry = { path, status: response.status, passed: true, availability: json.meta.availability, warnings: json.meta.warnings, rows: json.data?.rows?.length ?? (Array.isArray(json.data) ? json.data.length : null), sources: json.meta.sources?.map(({ provider, resource, observedAt, contentHash }) => ({ provider, resource, observedAt, contentHash })) };
        evidence.checks.push(entry); console.log(JSON.stringify({ path, passed: true, availability: entry.availability, rows: entry.rows }));
      } catch (error) { evidence.checks.push({ path, passed: false, error: error.message }); console.log(JSON.stringify({ path, passed: false, error: error.message })); process.exitCode = 1; }
    }
  } finally { await app.close(); if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(evidence, null, 2) + '\n'); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
