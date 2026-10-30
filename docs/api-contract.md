# OpenGP — HTTP API Contract v1

> **Status:** Proposed; **NOT implemented or approved**. Source inspection: 2026-10-30. For the internal entity model see [`data-model.md`](./data-model.md); for upstream data see [`f1-data-providers.md`](./f1-data-providers.md).

## 1. Existing endpoints (current source code)

These six routes are present in `backend/src/events/events.controller.ts` (not verified by live API requests). Their JSON is provider-derived and **does not** use the proposed `{ data, meta }` envelope.

| Method | Path | Params |
| --- | --- | --- |
| GET | `/events/today` | `date?`, `series?` |
| GET | `/events/upcoming` | `date?`, `series?` |
| GET | `/events/live` | `date?`, `series?` |
| GET | `/events/past` | `date?`, `series?` |
| GET | `/events/:id` | `series?` |
| GET | `/sessions/:id/detail` | `series?` |

Current source lacks stable OpenGP IDs, shared error envelope and capability-based dual F1 routing. Current session classification from OpenF1 is fastest-lap ranked and must **not** be treated as official race finishing order.

## 2. Proposed v1 public contract

Base prefix: `/api/v1` (proposal). Date-only inputs use `YYYY-MM-DD`; timestamps are ISO 8601 with explicit timezone/UTC. `seriesId` uses OpenGP series namespaced IDs (e.g. `f1`).

| Method | Endpoint | Purpose / parameters |
| --- | --- | --- |
| GET | `/series` | Supported series, not aspirational unimplemented ones |
| GET | `/series/:seriesId/seasons` | Seasons with available coverage; `limit?`, `cursor?` |
| GET | `/events` | Search by `seriesId?`, `from?`, `to?`, `limit?`, `cursor?` |
| GET | `/events/:eventId` | Event details + sessions |
| GET | `/sessions/:sessionId` | One session's schedule/lifecycle |
| GET | `/sessions/:sessionId/results` | Published results or explicit availability |
| GET | `/standings` | `seasonId` required; `type=driver|team`, `asOfEventId?` optional |
| GET | `/participants/:participantId` | Global person identity and series participation; **defer until identity matching is supported** |

**Scope:** v1 implementing F1 calendar, practice/SQ/race results, qualifying, sprint and standings; no free real-time promise. `/participants/:id` is reserved only, not a required implementation.

### Standard response envelope (proposal)

```json
{
  "data": {
    "sessionId": "f1:2025:china:race",
    "resultSet": {
      "kind": "race",
      "publicationStatus": "unknown",
      "classification": [
        {
          "entryId": "example-entry",
          "position": 1,
          "positionText": "1",
          "classificationStatus": "classified",
          "laps": 56,
          "points": "25"
        }
      ]
    }
  },
  "meta": {
    "availability": "available",
    "source": "jolpica",
    "retrievedAt": "2026-10-30T00:00:00Z"
  }
}
```

Example IDs and values are illustrative, **not actual provider records or final ID formats**. `points` is a decimal string to avoid floating-point rounding errors. `classificationStatus` requires a documented mapping; don't conflate DNF, DNS, DSQ, NC or `unknown`.

If results have not been published, return a successful HTTP response with `resultSet: null`, `meta.availability: "not_published"`, **not** an empty classification claiming zero participants. Other availability values: `partial`, `unsupported`, `upstream_error`, `access_restricted`, `not_applicable`. Upstream errors should generally surface non-2xx status and structured error body rather than masquerade as an empty list.

### Error envelope (proposal)

```json
{
  "error": {
    "code": "UPSTREAM_ERROR",
    "message": "Racing data is temporarily unavailable."
  },
  "meta": {
    "availability": "upstream_error"
  }
}
```

`400` invalid input; `404` nonexistent canonical ID; `422` recognized but unsupported capability (subject to review); `502` invalid/failed upstream data; `503` unavailable service. `429` should be used for OpenGP's own rate limit, not blindly forwarded from providers. Define retry headers if applicable.

### Caching and provenance

Cache by `(series, capability, canonical ID, query filters)` with freshness based on event state. Preserve upstream source IDs and `retrievedAt`; don't imply upstream publication is FIA final certification. Distinguish scheduled from actual end times. Standings are sourced snapshots, not derived by summing race results.

## 3. Compatibility and implementation

Maintain the six existing endpoints while migrating Frontend, or provide an explicitly approved deprecation plan. Ensure old `openf1-session-*` aliases can resolve via an identity crosswalk. Do not silently break existing paths or change legacy response shapes without versioning.

Implement DTO validation and `@nestjs/swagger` documentation. Generate OpenAPI JSON from the **actual** implemented code; do not treat this proposed Markdown as a generated, verified OpenAPI artifact. Add contract tests for required fields, null semantics, pagination, error envelopes and legacy paths.

## 4. Approval gates

- Resolve stable ID format/crosswalk with F1 upstream keys.
- Finalize exact DTOs and classification enums from real W02 fixtures.
- Decide `/api/v1` prefix and old endpoint migration plan.
- Decide pagination strategy and maximum date ranges to protect provider quotas.
- Run build, mapping, integration and live smoke tests before marking routes implemented/verified.
