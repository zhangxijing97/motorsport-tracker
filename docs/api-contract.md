# OpenGP — Backend API v1

**Implemented on the W03 feature branch; not deployed.** F1 is the only supported
v1 series. Offline tests and sampled real upstream evidence are recorded in
[W03 handoff](./w03-backend-handoff.md). This contract supersedes the previous
Current / Proposed sketch for the implemented scope.

The latest main proposal (`402db91`) was reviewed during delivery. Its entity
relationships are retained in [data-model.md](./data-model.md). W03 concretizes
its proposed contract with offset pagination (bounded complete F1 collections),
`drivers|constructors` standings plus `round`, and `published_unverified` status.
Global participant profiles, cursor pagination, `asOfEventId`, and generated
Swagger/OpenAPI documentation remain deferred; no OpenAPI artifact is claimed.

## 1. HTTP endpoints

All routes are `GET`. New clients use `/api/v1`. No authentication or provider key
is required for these historical/schedule endpoints.

| Path after `/api/v1` | Query | Data |
| --- | --- | --- |
| `/series` | `limit`, `offset` | Supported Series array (F1 only) |
| `/series/:id/seasons` | `limit`, `offset` | Supplier-listed Seasons |
| `/events` | `seriesId=f1`, `year`, `from`, `to`, `limit`, `offset` | Events with all known sessions |
| `/events/:id` | — | Event |
| `/sessions/:id` | — | `{ event, session }` |
| `/sessions/:id/results` | — | ResultSet or `null` |
| `/sessions/:id/race-control` | `limit`, `offset` | Historical control observations |
| `/standings` | **`seasonId=f1-YYYY`**, `type=drivers\|constructors`, `round`, `limit`, `offset` | Standings or `null` |

Rules:

- Unknown, repeated, array-valued and malformed query parameters return `400`.
- `limit`: default 50, range 1–100; `offset`: default 0, range 0–10,000.
  Lists include `meta.pagination = { limit, offset, total }`. Standings paginate
  `data.rows`; identity dictionaries remain attached. ResultSets stay complete.
- `year`: 1950 through current UTC year + 1; default current UTC year, or the year
  of `from`. `from`/`to`: real `YYYY-MM-DD` UTC dates, inclusive. Defaults are the
  selected year's January 1 / December 31. Events match by date-range overlap.
  A request spans at most two adjacent years; explicit `year` must agree with both.
- `round`: optional positive integer, max 100. Standings report the **supplier's
  actual** `asOfRound`; omitting round asks for its latest snapshot.
- `/events/today` means the selected UTC date; it does not mean the user's local
  date. Clients convert UTC instants for display.

Example: `/api/v1/events?seriesId=f1&from=2025-03-21&to=2025-03-23`.

## 2. Envelopes and errors

```json
{
  "data": null,
  "meta": {
    "availability": "not_published",
    "sources": [],
    "warnings": []
  }
}
```

`data` contains OpenGP DTOs, never a provider JSON envelope. Each source records
`provider`, `resource`, `observedAt`, `contentHash`, `mappingVersion`, and attribution.
`observedAt` is the upstream retrieval time, including when served from cache; it
is **not** the supplier's publication time. Warnings explain mapping gaps, schedule
conflicts and partial enrichment. No field claims FIA certification.

| Availability | Meaning |
| --- | --- |
| `available` | Usable response; a successfully fetched empty Race Control feed is valid |
| `partial` | Primary data exists but enrichment or identity mapping is incomplete |
| `not_published` | Known session is in the future; result endpoint is not fetched |
| `unsupported` | No implemented coverage, e.g. OpenF1 Practice before 2023 |
| `not_applicable` | Cancelled session has no result |
| `access_restricted` | Free historical window not open, or supplier denies access |
| `unknown` | Historical result/standings response is empty, or identity link unresolved |
| `upstream_error` | Provider failed; never represented as a successful empty classification |

A historical empty result alone cannot prove either publication or zero finishers.
No source-supplied explicit “published empty classification” marker is implemented.

```json
{
  "error": { "code": "UPSTREAM_TIMEOUT", "message": "Racing data is temporarily unavailable." },
  "meta": { "availability": "upstream_error" }
}
```

| HTTP | Meaning |
| --- | --- |
| `400` | Invalid input (`INVALID_REQUEST`) |
| `404` | Unknown OpenGP resource / unresolved external ID (`NOT_FOUND`) |
| `422` | Unsupported v1 series (`UNSUPPORTED`) |
| `502` | Upstream error, malformed payload, timeout, or unexpected upstream 404 |
| `503` | Provider/local provider budget exhausted or access denied; `Retry-After` when known |
| `500` | Unexpected internal failure; no raw payload, URL credentials or stack exposed |

Unsupported/absent *data for an existing session* uses HTTP 200 plus availability;
an unsupported *series request* uses 422. Upstream 404 is not a local resource 404.
Calendar enrichment failure can still return 200 `partial`; primary failure cannot.

## 3. Canonical entities and identities

Exact fields: [`src/racing/model.ts`](../backend/src/racing/model.ts).

| Entity | Identity / important fields |
| --- | --- |
| Series | `f1`; `name`, `category` |
| Season | `f1-2025`; `seriesId`, `year`, `name` |
| Event | `f1-2025-chinese-grand-prix`; `seasonId`, `round?`, `startsOn`, `endsOn`, `venue`, `sessions`, `externalIds` |
| Session | Event ID + `:fp1`, `:fp2`, `:fp3`, `:qualifying`, `:sprint_qualifying`, `:sprint`, `:race` |
| Driver / Constructor | OpenGP `f1-driver-*` / `f1-team-*` namespace with Jolpica crosswalk; names are display metadata |
| Entry | Session-scoped car/participant association; string `carNumber`, `participantIds[]`, nullable `teamId` |
| ResultSet | Session + normalized content hash; `rows`, `entries`, `drivers`, `teams`, provenance/revision fields |
| ClassificationRow | `entryId`, optional `participantId` for shared-car scoring, nullable rank/status/timing fields |
| Standings | Season, `type`, `asOfRound`, supplier points/wins; not a sum of race results |

`externalIds[] = { provider, entity, id, scope }`. Jolpica session external IDs are
locally constructed season/round/kind keys, **not** supplier-owned Session IDs.
OpenF1 driver numbers are scoped to an individual session. Unmatched participants
receive explicitly `f1-unresolved-driver-{sessionKey}-{number}` identities and a
`partial` response; names/numbers alone are not durable IDs.

Event IDs use year + normalized GP name, independent of round/date changes.
This deterministic v1 scheme has no database identity registry: a GP rename needs
an explicit alias before rollout. Testing meetings are excluded. Known cancelled
Imola 2023 remains an Event with `round=null`. Other unrecognized cancellations
are not inferred from missing calendar entries.

## 4. Time and result semantics

Three independent axes:

1. Session `lifecycle`: scheduled / started / suspended / finished / cancelled /
   unknown, with `lifecycleBasis=clock|provider|unknown`. Only cancellation is
   currently provider-confirmed; timed start/finish are clock inferences.
2. `meta.availability`: whether the requested data is obtainable.
3. Result `publicationStatus=published_unverified`: upstream published data,
   never automatically provisional, FIA-final or immutable.

Session times: `scheduledDate` always exists; `scheduledStartAt` and
`scheduledEndAt` are nullable ISO 8601 UTC instants. `timePrecision=instant|date`.
`actualEndAt` remains null. Jolpica anchors the start, OpenF1 supplies planned end
and cancellation. Start conflicts produce warnings without silent replacement.
A past start without a known end does not establish a finished session.

Result rules:

- `classificationPosition` differs from `displayOrder`. DSQ/DNS/NC ranks can be
  null. A classified DNF can retain its rank (including the China SQ P15 example).
- `classificationStatus` and `finishStatus` are separate. Original status and
  position text are retained; 1950 Kelly's `R / Not classified` is not forced DNF.
- `points` is a decimal **string** or null (`"12.5"` is preserved). Null is not zero.
- Laps, grid, timings and positions are nullable. Grid 0 becomes
  `pit_lane_or_unknown`, never a guaranteed pit-lane assertion.
- Time units are milliseconds. Practice uses `practiceBestLapMs`; qualifying uses
  ordered three-element `qualifyingPhasesMs` with null phases; race elapsed time
  is separate from a discriminated `gapToLeader` (time / laps / unknown).
- One classification table has one supplier. No fastest-lap reranking, mixed
  provider rows, invented laps or automatic FIA-final label.
- 1950 Britain explicitly links known shared-car participants while retaining
  every supplier result row and its individual points. Other shared-car records
  remain separate source observations until an explicit mapping is validated.

## 5. Compatibility and migration

The unprefixed `/events/today`, `/events/upcoming`, `/events/live`, `/events/past`,
`/events/:id`, `/sessions/:id/detail` remain. Existing `openf1-{meetingKey}` and
`openf1-session-{sessionKey}` links resolve across seasons; responses return
canonical IDs. Legacy lists still return arrays and detail still returns objects.
Old status-filter routes filter **sessions on the requested date**, not all future
or past years. `live` means inferred scheduled activity, not a real-time feed.

**Intentional breaking/correctness changes:**

- Default omitted `series` now means **F1**, avoiding unverified non-F1 fan-out.
  Explicit legacy non-F1 requests still reach retained adapters (not v1 verified).
- Legacy position, laps and end time can be null; session status adds `unknown`.
  Date-only historical starts remain date-only. `statusBasis`, `availability`,
  `publicationStatus`, `classificationStatus`, and `displayOrder` are additive.
- Canonical IDs replace provider IDs in returned data; old IDs remain accepted
  aliases. Unknown resources return 404, failures return error envelopes, not null
  or empty data disguised as successful fetches.
- Legacy classification now contains supplier ranks, not fastest-lap ranks.

Frontend migration (separate work): consume `/api/v1`, store canonical IDs, render
null/unavailable states, use `displayOrder` without inventing rank, show attribution
and inferred status. **No Frontend UI files were changed by W03.**

Deferred: persistent IDs/revision archive, automatic background ingestion, F1DB,
other series v1, historical lap endpoints, grid observations and paid live telemetry.
