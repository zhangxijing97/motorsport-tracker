# OpenGP — Product Strategy

> **Purpose:** A concise reference for OpenGP's product vision, priorities, and decisions.  
> **Status:** **Confirmed** = approved by the Founder; **Under Validation** = being researched; **Proposed** = not yet approved.  
> **Reviewed:** 2026-10-29 · **Owner:** D00 · Product & Strategy · [GitHub repository](https://github.com/zhangxijing97/opengp)

## 1. Product Vision

**OpenGP is an Automotive Discovery Platform.** It begins with multi-series motorsport tracking and may later help enthusiasts discover automotive events, driving experiences, and communities.

**Why it exists:** Motorsport information is spread across different championships and services. OpenGP aims to make useful information easier to discover in one place, then connect those interests with real-world automotive experiences.

This is a product direction, **not** a claim of validated market demand or product-market fit.

## 2. Confirmed Direction

| Stage | Priority | Meaning |
| --- | --- | --- |
| **Now** | **Build a reliable motorsport foundation** | Make basic racing events and sessions useful and accurate before expanding the product. |
| **Next** | **Explore in-person automotive discovery** | Start with the San Francisco Bay Area after the motorsport foundation is useful. |
| **Later** | **Broader automotive experiences** | Consider driving experiences, culture, personalization, and community only as evidence supports them. |

The Bay Area is the **next-stage starting region**, not a permanent geographic restriction. No release dates or fixed development schedule have been approved.

## 3. Motorsport Tracking Scope

**Near-term product priority:** Help people find racing events, understand their sessions, and access trustworthy information across series.

The target information depth includes:

- **Schedules and sessions:** When and where events take place, including practice, qualifying, and races where applicable.
- **Official results:** Published finishing positions and session results, not estimates derived from lap times.
- **Drivers and teams:** Basic competitor information when supported by reliable data.
- **Season standings:** Championship rankings and points when official data is available.

These are **target capabilities**, not a claim that all are implemented or required for the first release. Advanced telemetry, lap-by-lap live tracking, and race strategy analysis are **not current priorities**.

**Quality comes before coverage:** Distinguish valid empty results from missing data, unpublished information, and provider failures. Do not display estimated data as official results.

### Championship Research

The current data-provider research covers **18 racing series**, including F1, F2, Formula E, IndyCar, Indy NXT, MotoGP, Moto2, WorldSBK, WEC, IMSA, WRC, Super GT, NASCAR Cup, NASCAR O'Reilly, and GT World Challenge in Europe, America, Asia, and Australia.

**Under Validation:** The first supported series, data providers, and release-level coverage have not been finalized. Research coverage does not mean implementation or a launch commitment.

## 4. Target Users (Under Validation)

| Potential audience | Need to validate |
| --- | --- |
| **Dedicated / multi-series motorsport fans** | A faster way to follow schedules, sessions, results, and standings across championships. |
| **Casual racing followers** | A simple overview of what is happening without overwhelming detail. |
| **Automotive enthusiasts** | Relevant local automotive activities and experiences after the racing foundation is established. |

These are **working user hypotheses**. Do not describe them as validated segments or assume a particular feature is necessary without further evidence.

## 5. Future Opportunities (Proposed)

Possible future areas include personalized following, saved events, notifications, news, community discussion, automotive event listings, and driving experiences.

Specific Bay Area event types, sourcing methods, maps, event creation, booking, and payment workflows remain **unapproved**. They should not be treated as current MVP requirements.

## 6. Open Decisions

| Question | Needed before commitment |
| --- | --- |
| Which championships and data capabilities ship first? | Provider validation and data-quality evidence. |
| What defines a complete first release? | An approved scope and measurable acceptance criteria. |
| Which users and workflows matter most? | User research and product testing. |
| Which Bay Area automotive activities come first? | Event availability, relevance, and feasibility validation. |
| When should personalization or community be added? | Evidence of user value relative to cost and complexity. |

## 7. Ownership and Related Documents

**D00 · Product & Strategy** maintains this strategy. The **Founder** has final decision-making authority. **D01 · Engineering** uses approved requirements to plan and implement software.

This document defines **what and why**, not detailed feature behavior. Create feature-specific **PRDs** when requirements, user flows, and acceptance criteria are ready to be defined.

- [README](../README.md) — Developer setup and project entry point.
- [Architecture](architecture.md) — System design and implementation overview.
- [API Contract](api-contract.md) — Current API and proposed data model.
- [Data Providers](data-providers.md) — Provider integration and validation status.