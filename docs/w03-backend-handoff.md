# W03 — F1 Backend API v1 engineering handoff

**Delivery:** feature branch `feat/f1-backend-api-v1`, for review; not merged or deployed.
Initial audit: `eab7ef710b0e258f5711381b223414d3122db851`.
Reconciled with latest main `402db91be4dba4e7048756fb266d09557e9a3927`
(API proposal and new semantic data-model document). No Frontend files changed.

## Delivered

- Canonical F1 entities, independent lifecycle/publication/availability states,
  nullable timings/ranks, decimal-string points, scoped external identities,
  multi-participant Entries and explicit known historical shared cars.
- `/api/v1` calendar, Event/Session, results, seasons, standings and historical
  Race Control; strict query validation, UTC semantics, bounded offset pagination,
  consistent error envelopes. Legacy paths and OpenF1 ID resolution remain.
- Jolpica client/mapper/adapter and capability-based registry; OpenF1 published
  Practice/SQ results replace fastest-lap sorting. Identity conflicts stay visible.
- Bounded per-process caches, duplicate request coalescing, provider quotas,
  timeout/retry/Retry-After, HTTPS proxy tunneling, normalized result hashes and
  standings invalidation on observed Race/Sprint amendments.
- Updated contract, architecture, provider overview/mapping, semantic-model
  implementation boundary, Backend setup guide, captured fixtures and live probe.

No database, paid live API, F1DB import, other-series integration or deployment.
Basic historical lap/grid endpoints and generated Swagger/OpenAPI remain deferred;
these were optional/proposed scope, not verified features. Public global participant
profiles and cross-series identity merging are also deferred.

## Executed checks

Executed in the Work container with Node 24.22.1. Installed the lockfile dependencies;
added only HTTPS proxy transport dependencies. No secret configuration is committed.

| Check from `backend/` | Final result | Evidence boundary |
| --- | --- | --- |
| `npm run build` | Passed | Nest production compilation |
| `npm run typecheck` | Passed | Includes test TypeScript, unlike isolated Jest transforms |
| `npm run lint:check` | Passed | Full `src/` and `test/`, not just new files |
| `npm test -- --runInBand` | **43 / 43 passed**, 9 suites | Offline unit, mapper, client, transport and service tests |
| `npm run test:e2e -- --runInBand` | **29 / 29 passed**, 2 suites | Real Nest HTTP routing/services/mappers; fixture-backed transport |
| Initial real upstream local-HTTP smoke | **10 / 10 passed** | 2026-10-29 PDT; [initial evidence](../backend/test/live-smoke-initial-evidence.json) |
| Expanded real upstream local-HTTP smoke | **5 / 12 passed** | 2026-10-30 PDT; [latest evidence](../backend/test/live-smoke-evidence.json); access restrictions described below |

Initial baseline had two failing dependency-injection scaffold tests; these were
replaced with behavior assertions. Existing non-F1 files received formatting and
promise-stub lint cleanup only; their business behavior is not newly verified.

**Real upstream limitation observed:** during the latest run, OpenF1 returned HTTP
401 explaining that an active live F1 session globally restricts unauthenticated
access, **including past sessions**, until the live session ends. Thus a target
session being historical does not guarantee anonymous availability. The backend
returns 503 with `access_restricted`, and calendars can remain `partial` from
Jolpica. No paid credentials or access bypass was attempted. Some historical
Jolpica requests also failed in that run; this remains a live-probe failure, not a
passing test. Successful earlier snapshots do not promise continuous availability.

The first smoke establishes that the integration worked against those sampled
responses; the latest failures are retained rather than replaced with mock passes.
Source JSON is not independent FIA-final certification. Earlier successful smoke
preceded the final Entry-ID stability adjustment, which is covered by an offline
regression; final real-probe evidence is the latest file. No Render/Netlify or
Frontend runtime verification was performed.

## Required-case coverage

| Case | Assertions / evidence |
| --- | --- |
| 2026 Australia | Five sessions, cross-provider link, published Race/Qualifying, null actual end; fixtures + real smoke |
| 2025 China Sprint | Correct session kind, Hamilton P1 / 19 laps / 8 points; captured fixture; latest legacy-ID live probe access-restricted |
| Practice / SQ | Published 20-row tables; Norris 91.504 sec; Hadjar P15 + DNF + null phases; fixtures + earlier real smoke |
| DNF / DNS / DSQ / NC | China, 2024 Brazil, 1950 Britain; rank vs display order vs finish status separated |
| 2021 Belgium | `"12.5"` points; one classified lap; captured fixture + earlier real smoke |
| 1950 Britain | 23 rows, 21 Entries, cars 10/9 shared participants, duplicate rank 10, Kelly NC; fixture + earlier real smoke |
| 2023 Imola | Five cancelled sessions retained, round null, `not_applicable` results; fixture + earlier real smoke |
| Future / historical gaps | `not_published`, pre-2023 Practice `unsupported`, paid-window guard; synthetic clock/session tests |
| Empty / malformed / 404 / 429 / timeout / 5xx | Explicit availability/errors, bounded retries, Retry-After, rolling quotas, complete leaf pagination; offline tests |
| External IDs | Legacy Event/Session aliases, explicit circuit links, exact season name + acronym, scoped unknown drivers, Antonelli alias |
| Revisions | Changed hash / prior ID, stable Entry IDs across reorder, cache expiry, in-flight invalidation, both standings refreshed; synthetic amendments |

Fixture URLs, capture timestamps, original and minimized hashes, and attribution
are in [`test/fixtures/`](../backend/test/fixtures/). Tests do not imply complete
coverage for every season or every provider field.

## Migration and review focus

1. Adopt `/api/v1` envelopes in a separate Frontend task. Legacy routes still work
   but nullable rank/laps/end time and `unknown` status are intentional correctness
   changes. Render availability, attribution and clock-inferred status explicitly.
2. Omitted legacy `series` now means F1, not all configured providers. Explicit
   non-F1 legacy routes are retained but remain outside the verified v1 surface.
3. Returned IDs are canonical; old OpenF1 IDs remain accepted aliases while their
   upstream mapping is resolvable. Cold alias lookups can fail during supplier
   restrictions; there is no durable mapping store.
4. Event IDs survive round/date changes, but a GP rename needs an explicit alias.
   Unmapped circuits, ambiguous participants, or schedule conflicts remain partial.
5. Cache/revision state is in memory and is lost on restart/eviction. No durable
   synchronization, automatic background refresh or historical revision archive.
   Per-instance quotas are not coordinated across replicas. Re-fetching standings
   cannot prove atomic consistency with an amended upstream classification.

**Founder decisions:** no additional infrastructure decision is required to review
this implementation. Before release, approve the documented compatibility changes
and whether temporary free-source historical outages are acceptable. If historical
availability during race windows becomes a requirement, persistence/refresh policy
needs a separate scoped decision. This PR does not claim that requirement is met.
