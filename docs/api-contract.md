# OpenGP — API Contract

> **Purpose:** A quick reference for OpenGP's HTTP API and racing data model.  
> **Status:** **Current** = defined in the repository; **Proposed** = a design for future implementation, not an approved or live API.  
> **Reviewed:** 2026-10-29 · [GitHub repository](https://github.com/zhangxijing97/opengp)

## Table of Contents

1. [How the Contract Works](#1-how-the-contract-works)
2. [Current Backend API](#2-current-backend-api)
3. [Proposed Canonical Data Model](#3-proposed-canonical-data-model)
4. [Proposed API Direction](#4-proposed-api-direction)
5. [Data and Error Rules](#5-data-and-error-rules)
6. [Before This Contract Is Finalized](#6-before-this-contract-is-finalized)

## 1. How the Contract Works

OpenGP sits between its frontend and external motorsport APIs:

```text
Frontend → OpenGP Backend API → Racing Data Provider → External API
                 ↑
        OpenGP response format
```

**Two different contracts matter:**

- **HTTP API contract:** The URLs, query parameters, JSON responses, and errors the frontend sees.
- **Canonical data model:** The internal structure OpenGP aims to use consistently across racing series, regardless of data provider.

The current HTTP API exists. The more complete canonical model below is **proposed** and still requires design and validation. Do not treat proposed fields or endpoints as implemented.

## 2. Current Backend API

**Source:** [`events.controller.ts`](../backend/src/events/events.controller.ts) and [`types.ts`](../backend/src/events/types.ts). These descriptions are based on source inspection, **not runtime/API testing**.

### 2.1 Endpoints

| Method | Path | Query parameters | Returns |
| --- | --- | --- | --- |
| GET | `/events/today` | `date?`, `series?` | `Event[]` for the selected date |
| GET | `/events/upcoming` | `date?`, `series?` | `Event[]` with upcoming sessions |
| GET | `/events/live` | `date?`, `series?` | `Event[]` with live sessions |
| GET | `/events/past` | `date?`, `series?` | `Event[]` with finished sessions |
| GET | `/events/:id` | `series?` | `Event` |
| GET | `/sessions/:id/detail` | `series?` | `SessionDetail` or `null`, depending on the provider |

- `date` is a date string passed to the selected provider; **no central DTO validation is currently configured**.
- `series` is a series ID such as `f1`. If omitted from list requests, the backend queries all registered providers. Detail requests default to `f1`.
- `:id` is a path parameter. Current IDs are produced by the individual provider adapters; they are **not yet stable, provider-independent OpenGP IDs**.
- No `/api/v1` prefix is configured. The root `GET /` is a scaffold endpoint, not a racing-data API.

**Example request:**

```http
GET /events/today?date=2026-10-29&series=f1
```

### 2.2 Response Types

**`Event`** — the main response object for schedules and event details.

| Object | Fields in the current TypeScript contract |
| --- | --- |
| `Series` | `id`, `name`, `category` |
| `Season` | `id`, `year`, `name` |
| `Event` | `id`, `series`, `season`, `eventName`, `country`, `location`, `venueName`, `dateStart`, `dateEnd`, `sessions` |
| `Event` (optional) | `roundNumber`, `roundLabel` |
| `Session` | `id`, `eventId`, `name`, `category`, `startTime`, `endTime`, `status` |

`Event.series` and `Event.season` are embedded objects. `Event.sessions` is an array. For filtered list routes, it may include **only sessions matching the requested status**, not every session at the event.

Current `Session.status` values: `upcoming`, `live`, `finished`, `cancelled`.

Current `Session.category` values: `practice`, `qualifying`, `race`, `sprint`, `test`, `warmup`, `stage`, `heat`, `feature`, `shootout`, `other`.

**Illustrative `Event` JSON** (placeholder values, not live race data):

```json
{
  "id": "example-event-id",
  "series": { "id": "f1", "name": "Formula 1", "category": "open-wheel" },
  "season": { "id": "example-season-id", "year": 2026, "name": "2026" },
  "eventName": "Example Grand Prix",
  "country": "Example Country",
  "location": "Example City",
  "venueName": "Example Circuit",
  "dateStart": "2026-10-29T09:00:00Z",
  "dateEnd": "2026-10-31T18:00:00Z",
  "sessions": [
    {
      "id": "example-session-id",
      "eventId": "example-event-id",
      "name": "Race",
      "category": "race",
      "startTime": "2026-10-31T14:00:00Z",
      "endTime": "2026-10-31T16:00:00Z",
      "status": "upcoming"
    }
  ]
}
```

**`SessionDetail`** — current response for `/sessions/:id/detail`:

```text
SessionDetail
├── event           # Short event summary (not the full Event object)
├── session         # Session object
└── classification  # SessionClassificationRow[]
```

Each current `SessionClassificationRow` requires `position`, `driverNumber`, `driverName`, `teamName`, and `laps`; it may also contain `headshotUrl`, `bestLapTime`, and `gapToLeader`.

**Important:** The current classification structure is F1/driver-oriented. The OpenF1 adapter currently sorts by best-lap time in session detail; **do not interpret that output as official race finishing order**.

### 2.3 Known Limitations

- Provider selection is by **series**, not by data capability (calendar, results, standings, etc.).
- Some upstream failures become empty arrays; the frontend can also return `[]` or `null` on fetch failures. These are **not reliable signals that no data exists**.
- NASCAR event detail is not implemented in the current adapter; session detail may return `null`.
- There is no standings endpoint, dedicated result-set resource, consistent error envelope, or persistent canonical data store yet.
- Existing responses are JSON objects/arrays **without** a standard `{ data, meta }` wrapper.

## 3. Proposed Canonical Data Model

**Why it matters:** F1, NASCAR, endurance racing, and other series organize competitors and results differently. OpenGP needs one consistent model without forcing every series into an F1-style driver table.

### 3.1 Entity Relationships

```text
Series (e.g., Formula 1)
  └── Season (e.g., 2026)
       ├── Event (e.g., a Grand Prix weekend)
       │    └── Session (practice / qualifying / race / ...)
       │         ├── Entry (who competes in this session)
       │         └── ResultSet (published results for this session)
       │              └── ClassificationRow → references an Entry
       └── Standings (season-level rankings)
            └── StandingRow → references a participant or team

Entry → Participant(s) and/or Team
```

### 3.2 What Each Entity Means

| Entity | Meaning | Core proposed fields (illustrative) |
| --- | --- | --- |
| **Series** | A racing championship. | `id`, `name`, `category` |
| **Season** | One season of a series. | `id`, `seriesId`, `year`, `name` |
| **Event** | An event or race weekend. | `id`, `seasonId`, `name`, `startsAt`, `endsAt`, `venue` |
| **Session** | A timed activity within an event. | `id`, `eventId`, `name`, `category`, `status`, `startsAt` |
| **Entry** | A car, bike, driver, or team participating in a session. | `id`, `sessionId`, `number?`, `participantIds[]`, `teamId?` |
| **Participant / Team** | The people and organizations linked to entries. | `id`, `name` |
| **ResultSet** | A published set of results for one session. | `id`, `sessionId`, `kind`, `publicationStatus` |
| **ClassificationRow** | One entry's result within a result set. | `resultSetId`, `entryId`, `position?`, `resultStatus?`, `laps?`, `points?` |
| **Standings** | Rankings across a season, separate from a single race result. | `id`, `seasonId`, `type`, `rows[]` |
| **StandingRow** | A competitor's rank and points in standings. | `competitorId`, `position?`, `points?` |

`?` means optional in this **design sketch**, not an approved TypeScript interface. Exact names, required fields, entry scope, and result types must be finalized in D01.1.

**Three distinctions to remember:**

1. **Event ≠ Session:** A Grand Prix weekend is an Event; its practice, qualifying, and race are Sessions.
2. **Entry ≠ Driver:** An endurance-racing car can have multiple drivers. A result row should reference an Entry, not assume one driver per car.
3. **Session status ≠ Result publication:** A race can be `finished` while its results are still `provisional` or `not_published`.

## 4. Proposed API Direction

**Not implemented or approved.** These are candidate routes for a provider-independent API; exact URLs and response fields will be decided after canonical model validation.

| Candidate endpoint | Purpose |
| --- | --- |
| `GET /series` | List supported championships. |
| `GET /series/:id/seasons` | List seasons for a championship. |
| `GET /events?seriesId=...&from=...&to=...` | Search events by series and date range. |
| `GET /events/:id` | Get one event and its sessions. |
| `GET /sessions/:id/results` | Get a session's result set and classifications. |
| `GET /standings?seasonId=...&type=...` | Get season standings (e.g., driver or team). |

**Proposed response convention:** Keep racing data in `data` and attach availability/provenance information in `meta`. Example shapes are **not finalized**.

```json
{
  "data": {
    "sessionId": "example-session-id",
    "resultSet": null
  },
  "meta": {
    "availability": "not_published",
    "source": null,
    "retrievedAt": null
  }
}
```

This means the session exists, but results have not been published. It does **not** mean the session had zero finishers.

## 5. Data and Error Rules

### 5.1 Data Semantics

| Rule | Intended behavior |
| --- | --- |
| **IDs** | Future canonical IDs belong to OpenGP; map external provider IDs separately. |
| **Dates and times** | Prefer ISO 8601 timestamps with a timezone; date-only filters use `YYYY-MM-DD`. Define timezone handling before finalizing. |
| **Unknown values** | Use `null` or an explicit unavailable state, rather than guessing. |
| **Empty arrays** | Mean a genuinely empty result **only when the request succeeded**. |
| **Results** | Never create official finishing positions from fastest laps or live running order. |
| **Provenance** | Track where data came from and when it was retrieved, without exposing raw provider payloads as the public contract. |

**Suggested availability states (Proposed):**

| State | Meaning |
| --- | --- |
| `available` | The requested data was retrieved and is usable. |
| `not_published` | The session or event exists; the requested results are not published yet. |
| `unsupported` | No provider currently supports the requested capability. |
| `partial` | Some data is available, but coverage is incomplete. |
| `upstream_error` | The external source failed; the answer is unknown. |

### 5.2 HTTP Errors

**Current:** NestJS and individual providers determine actual HTTP errors; no shared error response format is enforced. An unknown series can raise `404`, while some upstream failures are silently returned as empty data.

**Proposed:** Return stable, actionable errors rather than disguising failures as successful empty responses.

| HTTP status | Meaning |
| --- | --- |
| `400 Bad Request` | An input or query parameter is invalid. |
| `404 Not Found` | A requested resource ID does not exist. |
| `422 Unprocessable Entity` | A valid request asks for an unsupported capability (candidate mapping). |
| `502 Bad Gateway` | An upstream provider failed or returned an unusable response. |
| `503 Service Unavailable` | OpenGP cannot currently serve the request. |

**Illustrative future error response:**

```json
{
  "error": {
    "code": "UPSTREAM_ERROR",
    "message": "Racing data is temporarily unavailable."
  }
}
```

## 6. Before This Contract Is Finalized

The **Current** section documents the code as inspected. The **Proposed** sections are design input, **not implementation commitments**.

To finalize the canonical contract, Engineering should:

1. Complete W02's F1 provider validation and confirm which facts each source can reliably supply.
2. Use D01.1 to confirm entity relationships, IDs, result/publication statuses, and fields across real F1 sessions.
3. Define how non-F1 competitors (multi-driver entries, stages, heats, etc.) fit the same model.
4. Agree on the public endpoint paths, error format, availability states, and compatibility/migration plan before changing the frontend.
5. Add contract tests and verify actual JSON responses before marking a route **Implemented & Verified**.

**Related docs:** [`architecture.md`](./architecture.md) · [`data-providers.md`](./data-providers.md)
