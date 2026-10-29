# OpenGP — Architecture

> **Purpose:** A concise guide to OpenGP's system structure, request flow, and engineering principles.
>
> **Current** describes the existing code; **Proposed** describes planned architecture, not implemented functionality.
>
> **Reviewed:** 2026-10-28 · [Repository](https://github.com/zhangxijing97/motorsport-tracker)

## 1. System & Backend Overview (Current)

OpenGP is an Automotive Discovery Platform, initially focused on multi-series motorsport tracking.

- **Frontend:** Next.js, React, and TypeScript; renders schedules, events, and session details.
- **Backend:** NestJS and TypeScript; exposes OpenGP JSON endpoints and integrates external motorsport data.
- **Provider integrations:** The codebase contains OpenF1, Sportradar, and NASCAR adapters. Their presence does not imply complete or verified coverage.

### Key Files

```text
backend/src/
├── main.ts                         # Application bootstrap and CORS
├── app.module.ts                   # Root module and configuration
├── events/
│   ├── events.module.ts            # Events module registration
│   ├── events.controller.ts        # HTTP routes
│   ├── events.service.ts           # Request orchestration
│   └── types.ts                    # Current shared API types
├── data-providers/
│   ├── data-providers.module.ts     # Provider registration
│   ├── racing-data-provider.interface.ts
│   ├── racing-data-provider.registry.ts
│   ├── openf1/                     # Client, Mapper, Provider
│   ├── sportradar/                 # Client, Mapper, Provider
│   └── nascar/                     # Client, Mapper, Provider
└── common/cache.util.ts           # In-memory TTL cache helpers

frontend/src/lib/api.ts             # Backend API consumption and UI mapping
```

## 2. Core Components & Request Flow (Current)

### Request Flow

```text
HTTP Request (Frontend)
    ↓
EventsController                Receives requests and parameters
    ↓
EventsService                   Coordinates data retrieval
    ↓
RacingDataProviderRegistry      Selects a provider by series
    ↓
OpenF1Provider (example)        Implements the racing data interface
    ├── OpenF1Client             Fetches external API data
    └── OpenF1Mapper             Maps data to OpenGP types
    ↓
EventsService → EventsController
    ↓
HTTP Response (JSON) → Frontend
```

### Component Responsibilities

| Component | Responsibility |
| --- | --- |
| **Module** | Registers related controllers, providers, and imported dependencies. |
| **Controller** | Defines HTTP routes, reads parameters, and delegates work. |
| **Service** | Coordinates application logic and provider calls. |
| **Registry** | Resolves the racing data provider for a series. |
| **Racing Data Provider** | Implements OpenGP's shared data-access interface for a supported series. |
| **Client** | Communicates with an external API; handles provider-specific HTTP behavior. |
| **Mapper** | Converts external data fields and semantics into OpenGP types. |

**Current behavior and limitations:**

- The Registry selects the **first** provider supporting a series; capability-based routing is not implemented.
- Queries without a specified series aggregate calls with `Promise.allSettled`; provider failures may be indistinguishable from empty results.
- Cache utilities use in-process memory and TTLs. Persistent ingestion and a canonical data store are not implemented.
- Some existing result mappings require correction; in particular, fastest-lap rankings must not be presented as official race classifications.

## 3. Racing Data Architecture (Proposed)

**Goal:** OpenGP owns its data semantics. External providers adapt to OpenGP rather than defining its public API.

- **Canonical Data Model:** Represent motorsport data consistently across series, including different race formats and result types.
- **Capability-based routing:** Assign a provider by **series + capability** (e.g., calendar, session results, standings), with explicit ownership.
- **Stable identity:** Separate OpenGP entity IDs from external provider IDs, retaining mappings when sources change.
- **Provenance and availability:** Track source, retrieval time, publication status, and whether data is available, incomplete, unpublished, or unavailable due to errors.
- **Scheduled ingestion:** Where permitted, validate and persist upstream data independently of frontend requests; serve stable snapshots to users.

For entity relationships, fields, and API responses, see [`api-contract.md`](./api-contract.md). For provider selection, external endpoints, and field mappings, see [`data-providers.md`](./data-providers.md).

## 4. Engineering Principles

1. **Correctness before coverage:** Never infer official race classification from fastest laps or live positions.
2. **No fabricated values:** Do not invent missing times, positions, points, or statuses; preserve meaningful `null`/unknown states.
3. **Explicit failure semantics:** Distinguish unsupported features, unpublished results, legitimate empty data, and upstream failures.
4. **Provider independence:** The frontend depends on OpenGP API contracts, not external provider payloads.
5. **Incremental evolution:** Validate the design against real F1 data first, then expand to other series. Do not present proposed features as implemented.

## 5. NestJS Fundamentals (Learning Notes)

| Concept | What it does | OpenGP example |
| --- | --- | --- |
| **Module** | Groups and registers application dependencies. | `AppModule`, `EventsModule`, `DataProvidersModule` |
| **Controller** | Handles incoming HTTP requests. | `EventsController` |
| **Service** | Executes and coordinates application logic. | `EventsService` |
| **Dependency Injection (DI)** | Lets NestJS supply registered dependencies to classes. | Injecting `RacingDataProviderRegistry` into `EventsService` |
| **NestJS Provider** | A class or value managed by NestJS's DI container. | `EventsService`, `OpenF1Client` |

### Example: Dependency Registration and Injection

`AppModule` imports `EventsModule`, which imports `DataProvidersModule`. The latter exports `RacingDataProviderRegistry`, making it injectable into `EventsService`.

```typescript
// events.module.ts (simplified from the current implementation)
@Module({
  imports: [DataProvidersModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}

// events.service.ts (constructor excerpt)
constructor(private readonly providerRegistry: RacingDataProviderRegistry) {}
```

**Lifecycle:** Modules register dependencies during application initialization; they are not re-executed for each HTTP request. Controller route handlers run when requests arrive.

**Two meanings of “Provider”:** A *NestJS Provider* is a DI concept. An OpenGP *Racing Data Provider* is an application-specific data adapter. `OpenF1Provider` serves both roles.