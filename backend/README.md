# OpenGP Backend

NestJS + TypeScript. F1 v1 uses Jolpica for calendars, Race/Qualifying/Sprint and
standings; OpenF1 supplements sessions, Practice/SQ and historical Race Control.

```bash
npm ci
npm run build
npm run start:dev
```

Port defaults to `3001` (`PORT` overrides it). No API key is needed for F1.
Standard proxy environment variables are optional; do not commit proxy credentials
or `.env`. Existing non-F1 legacy adapters still need their own configuration.

Example: `GET /api/v1/events?seriesId=f1&year=2025`.
See [API contract](../docs/api-contract.md), [architecture](../docs/architecture.md)
and [W03 evidence](../docs/w03-backend-handoff.md).

```bash
npm run typecheck
npm run lint:check
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

These checks are offline once dependencies are installed. Unit tests cover
normalization, pagination, quotas, retries and cache invalidation. E2E tests use
real Nest routing/services/mappers with fixture-backed transports.

Optional real upstream probe (consumes free provider quotas):

```bash
npm run build
npm run smoke:f1
# To save the summary locally:
node scripts/smoke-f1.cjs /tmp/opengp-live-smoke.json
```

Published data is not automatically FIA-final. In-process cache/revision state is
not persistent; no background sync, database, live telemetry or deployment is
included. Source data attribution: Jolpica-F1 and OpenF1, CC BY-NC-SA 4.0.
OpenGP is not affiliated with Formula 1 or the FIA. Media rights are not implied.
