# OpenGP — Data Providers

> **Purpose:** A quick guide to OpenGP's external motorsport data integrations and how providers will be selected.  
> **Status:** **Current** = code exists in the repository; **Pending Validation** = no final data provider has been selected.  
> **Reviewed:** 2026-10-29 · [GitHub repository](https://github.com/zhangxijing97/opengp)

## 1. Racing Series & Providers

| Racing series | Providers |
| --- | --- |
| **Formula 1 (F1)** | **Jolpica-F1** (primary) + **OpenF1** (supplementary); F1DB (optional historical archive) |
| Formula 2 (F2) | — |
| Formula E | — |
| IndyCar | — |
| Indy NXT | — |
| NASCAR Cup Series | — |
| NASCAR O'Reilly Auto Parts Series | — |
| MotoGP | — |
| Moto2 | — |
| WorldSBK | — |
| FIA World Endurance Championship (WEC) | — |
| IMSA | — |
| World Rally Championship (WRC) | — |
| Super GT | — |
| GT World Challenge Europe | — |
| GT World Challenge America | — |
| GT World Challenge Asia | — |
| GT World Challenge Australia | — |

**— = Provider not yet selected.** The F1 entries are **selected integration targets**, not a claim that all adapters are implemented or tested. Existing code for other series does not establish a final provider choice.

## 2. F1 Providers at a Glance

| Provider | Main responsibility |
| --- | --- |
| **Jolpica-F1** · Primary | GP calendars, Race / Qualifying / Sprint results, drivers, teams, standings, basic race lap times |
| **OpenF1** · Supplementary | Practice / Sprint Qualifying results, Session details and cancellations, Race Control, detailed timing |
| **F1DB** · Optional archive | Older and unusual historical records, cross-checking; **downloadable database, not a live API** |

**F1 technical details:** [Endpoints, response fields, mapping rules, limitations and verified samples → `f1-data-providers.md`](./f1-data-providers.md).

## 3. Integration Principles

- **One public contract:** The Frontend consumes the [OpenGP API](./api-contract.md), not supplier-specific JSON.
- **Source by capability:** Calendar, Session, Results and Standings may use different providers, even within one series.
- **Keep data trustworthy:** Preserve external IDs and provenance; do not derive official finishing positions from lap times or confuse missing data with upstream errors.
- **Track progress accurately:** **Selected**, **implemented** and **verified** are different states.

**Implementation:** [`backend/src/data-providers/`](../backend/src/data-providers/) · **System architecture:** [`architecture.md`](./architecture.md)