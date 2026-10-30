# OpenGP — Architecture

**W03 implementation:** NestJS Backend API v1 with F1 integration. Not deployed.
The Next.js / React frontend is unchanged. See [API contract](./api-contract.md)
and [test evidence / handoff](./w03-backend-handoff.md).

## Backend responsibilities

| Component | Responsibility |
| --- | --- |
| `racing/model.ts` | Provider-independent v1 DTOs, statuses, identities and provenance |
| `racing/racing.controller.ts` / `query.ts` | `/api/v1`, validation, date filters and pagination |
| `racing/racing.service.ts` | F1 orchestration, identity lookup, availability and in-memory revisions |
| `events/` | Legacy route/response compatibility using the same F1 service |
| `data-providers/racing-data-provider.registry.ts` | Explicit capability-to-adapter routing; no first-registration-wins F1 behavior |
| `data-providers/jolpica/` | Primary calendar, identities, classifications and standings |
| `data-providers/openf1/` | Session enrichment/cancellations, Practice/SQ results, Race Control |
| `data-providers/upstream-http.ts` | Bounded memory cache, single-flight, provider budgets, timeout/retry and proxy support |
| `racing/api-error.filter.ts` | Stable JSON errors, no upstream exception details leaked |

Controllers use RacingService; it selects an adapter by capability. Clients
validate supplier envelopes; mappers convert data to OpenGP DTOs. The frontend
never needs to interpret MRData or OpenF1's duration arrays.

Sportradar/NASCAR source is retained behind explicit **legacy** series requests;
no new non-F1 integration is included. NASCAR still uses Sportradar. Formatting
and two promise-only stub cleanup changes let the existing lint gate run; these
adapters are not newly verified. The root `/` scaffold remains separate.

## Data ownership and reconciliation

Jolpica owns GP schedule and Race/Qualifying/Sprint tables. OpenF1 supplements
planned end/cancellation and owns Practice/SQ tables. An explicit circuit
crosswalk plus year/race date matches meetings; session kinds then match within
the linked meeting. Conflicts and unknown identities remain visible. The initial
ID scheme is deterministic, with documented rename limitations; there is no
persistent mapping database.

Result content hashes identify changes between reads in the same process.
Race/Sprint changes invalidate both standings table caches for that season. The
next standings read refetches both latest tables; `standings_refresh_pending`
remains if refresh cannot complete. Even after refresh, `independent_snapshots`
means upstream results and standings are **not transactionally consistent**.
Same-content reads do not create revisions. At most 256 recent result snapshots
are retained; `supersedesId` points to the previous observed content, not a durable
or queryable audit log. Missed intermediate changes cannot be reconstructed.

## Runtime reliability and free hosting

- No new database, scheduler, paid service or always-on worker.
- Each provider caches at most 256 raw responses; concurrent identical requests
  share a promise. Calendar/session TTL 15 min; results/standings/control 5 min;
  identity directories 1 hour; seasons 24 hours. TTL refresh is demand-driven.
- Failed requests are not cached as empty. No stale-on-error response is served.
  Jolpica failure fails the request; optional OpenF1 calendar enrichment failure
  returns explicitly partial data. Empty historical classifications are unknown.
- Per-process Jolpica budget: 480 requests/hour, at least 260 ms spacing. OpenF1:
  28 requests/minute, at least 350 ms spacing. Each attempt consumes budget.
  Queue cap 12; exhausted budget returns 503 with Retry-After rather than waiting
  for an hour. Limits are conservative defaults from the selected provider plan.
- 8-second upstream timeout, at most 3 attempts for timeout/429/5xx. Honor numeric
  or HTTP-date Retry-After. Long cooldowns fail promptly instead of blocking a
  request indefinitely. Invalid payloads and ordinary 4xx are not blindly retried.
- Standard proxy environment variables / NO_PROXY are supported with HTTPS
  CONNECT. Proxy credentials are never included in public error output.
- OpenF1 result/control reads are blocked through scheduled end + 30 minutes.
  A live Session can also restrict anonymous historical queries globally; upstream
  denial is surfaced as `access_restricted`, not an empty table.
  No paid credentials, live stream, headshot proxy or large telemetry fetch.

**Limits:** Restarts lose caches, rate counters, mapping observations and revision
history. Multiple instances do not share quotas or cache invalidations. Free-tier
sleeping delays refresh. Sparse calendar/identity coverage is not filled with
invented facts. A persistent sync store and shared quotas require a later decision
if traffic or durability needs grow. None is required to review this PR.

## Development checks

From `backend/`: `npm ci`, `npm run build`, `npm run typecheck`,
`npm run lint:check`, `npm test -- --runInBand`,
`npm run test:e2e -- --runInBand`.

All normal tests use captured/minimized fixtures or synthetic failure cases and
run without third-party network. `npm run smoke:f1` is an explicit, separate live
probe; it starts a local ephemeral HTTP server and does not deploy anything.
Fixtures and the live probe have different evidence boundaries, documented in
the [handoff](./w03-backend-handoff.md).
