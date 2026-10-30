# OpenGP — Data Providers

> **Purpose:** A quick guide to OpenGP's external motorsport data integrations and how providers will be selected.  
> **Status:** **Current** = code exists in the repository; **Pending Validation** = no final data provider has been selected.  
> **Reviewed:** 2026-10-29 · [GitHub repository](https://github.com/zhangxijing97/opengp)

## Table of Contents

1. [Overview](#1-overview)
2. [Current Provider Code](#2-current-provider-code)
3. [How Data Providers Work](#3-how-data-providers-work)
4. [Provider Selection](#4-provider-selection-pending-validation)
5. [How to Update This Document](#5-how-to-update-this-document)

## 1. Overview

OpenGP gets motorsport data from external APIs. **Data providers** are the adapters that fetch this data and convert it into OpenGP's format.

**Important:** A provider in our code is not necessarily the original data source. For example, the current `NascarProvider` obtains its data through Sportradar.

The frontend should use **OpenGP's API**, not external provider APIs directly. This allows us to change data sources without redesigning the frontend.

## 2. Current Provider Code

The repository already contains these adapters, but **none is confirmed as a final provider choice**.

| Adapter | Series IDs in the current code | External source currently used |
| --- | --- | --- |
| `OpenF1Provider` | `f1` | OpenF1 |
| `SportradarProvider` | `formula-e`, `indycar`, `indy-nxt`, `motogp`, `rally` | Sportradar |
| `NascarProvider` | `nascar-cup`, `nascar-xfinity`, `nascar-truck` | Sportradar NASCAR API |

**These are code integrations, not validated coverage.** Their API access, completeness, correctness, and reliability still need testing. Other providers may replace or supplement them.

**Where to find the code:** `backend/src/data-providers/`

## 3. How Data Providers Work

```text
EventsService
    ↓
RacingDataProviderRegistry    Finds a provider for the requested series
    ↓
RacingDataProvider            Coordinates the work
    ↓
Client                         Requests data from an external API
    ↓
Mapper                         Converts the response into OpenGP types
    ↓
OpenGP API → Frontend
```

- **Registry:** Chooses which adapter to call.
- **Provider:** Uses its Client and Mapper to fulfill a data request.
- **Client:** Communicates with the external API.
- **Mapper:** Converts external fields into OpenGP's common format.

**Current limitations:**

- The Registry selects the **first adapter matching a series**, not the best provider for each type of data.
- Some upstream API failures are returned as empty lists, making errors hard to distinguish from “no events.”
- Some result mappings need correction; **fastest-lap order is not official race classification**.

## 4. Provider Selection (Pending Validation)

**No provider or provider combination has been finalized.** Different capabilities may eventually use different sources, even within the same series.

| Capability | What OpenGP needs | Selected source |
| --- | --- | --- |
| **Calendar** | Event dates, locations, and schedules | Pending |
| **Sessions** | Practice, qualifying, race, and other session details | Pending |
| **Results** | Accurate official classifications and finishing statuses | Pending |
| **Standings** | Championship points and rankings | Pending |
| **Live data** | Current session status and timing, where available | Pending |

Before selecting a source, verify **data correctness, series and season coverage, access and usage limits, update frequency, and reliability**. Prefer useful, sustainable free access where practical; do not assume an API is free or unrestricted without checking.

## 5. How to Update This Document

When a source has been validated, add its details here:

1. **Series and capability:** What data it supplies.
2. **Source and access:** Provider name, API endpoint, authentication, and limits.
3. **Mapping:** How its fields map to OpenGP entities and API responses.
4. **Evidence and limitations:** What was tested, when, and what is still missing.
5. **Decision:** **Candidate**, **Validated**, or **Selected**. A validated source is not automatically the selected source.

Keep unconfirmed options labeled as candidates. Update this document as provider choices become clear; avoid duplicating API entity definitions here.

---

**Related docs:** [Architecture](./architecture.md) · [API Contract](./api-contract.md)
