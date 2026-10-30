# OpenGP — Product Strategy

> **Purpose:** A concise reference for OpenGP's product vision, priorities, and decisions.  
> **Status:** **Confirmed** = approved by the Founder; **Under Validation** = being researched; **Proposed** = not yet approved.  
> **Reviewed:** 2026-10-29 · **Owner:** D00 · Product & Strategy · [GitHub repository](https://github.com/zhangxijing97/opengp)

## 1. Product Vision

**OpenGP is an Automotive Discovery Platform.** It begins with multi-series motorsport tracking and may later help enthusiasts discover automotive events, driving experiences, and communities.

**Long-term vision:** Help enthusiasts follow the racing they love, discover motorsport they might not otherwise encounter, and eventually connect those interests with real-world automotive experiences. Discovery should extend beyond the championships a user already follows.

**Why it exists:** Motorsport information is spread across different championships and services. OpenGP aims to make useful information easier to discover in one place, then help people explore adjacent interests and relevant experiences.

This is a product direction, **not** a claim of validated market demand or product-market fit. The long-term vision does **not** approve a specific recommendation system or event feature.

## 2. Confirmed Direction

| Stage | Priority | Meaning |
| --- | --- | --- |
| **Now** | **Build a reliable motorsport foundation** | Make basic racing events and sessions useful and accurate before expanding the product. |
| **Next** | **Connect racing interests with in-person automotive discovery** | After the motorsport foundation is useful, explore relevant automotive events and experiences. Begin with Bay Area event-content validation, without limiting OpenGP's target users to that region. |
| **Later** | **Broader automotive experiences** | Consider driving experiences, culture, personalization, and community only as evidence supports them. |

**Geographic scope:** OpenGP is **not a Bay Area-only product**. Motorsport tracking should serve users regardless of where they live. The San Francisco Bay Area is the **initial region for validating local event content and operations**, not a restriction on the intended audience or a permanent limit on expansion. Event coverage in other regions has not yet been committed.

The stage order is confirmed; detailed features, rollout geography, release dates, and fixed development schedules have **not** been approved.

## 3. Motorsport Tracking Scope

**Near-term product priority:** Help people find racing events, understand their sessions, and access trustworthy information across series.

### Core User Needs

The foundational experience should be designed around questions such as:

- **What's coming up?** What races or sessions are next, including this weekend?
- **When does it start for me?** What is the start time in the user's local time zone?
- **What's happening at this event?** Which practice, qualifying, sprint, race, or other sessions are scheduled?
- **What happened?** Where can users see reliably published results or understand why results are not yet available?
- **Where can I verify it?** How can users reach authoritative event or championship information?
- **What if nothing is live?** Can the experience still surface upcoming events and recent results?

These are **product-design questions**, not confirmation that every answer or interface is included in the first release.

The target information depth includes:

- **Schedules and sessions:** When and where events take place, including practice, qualifying, and races where applicable.
- **Official results:** Published finishing positions and session results, not estimates derived from lap times.
- **Drivers and teams:** Basic competitor information when supported by reliable data.
- **Season standings:** Championship rankings and points when official data is available.

These are **target capabilities**, not a claim that all are implemented or required for the first release. Advanced telemetry, lap-by-lap live tracking, and race strategy analysis are **not current priorities**.

**Quality comes before coverage:** Distinguish valid empty results from missing data, unpublished information, and provider failures. Do not display estimated data as official results.

### UX Principles (Proposed)

- **Continuous utility:** The homepage should remain useful when there is no live racing, through relevant upcoming events, recent results, or other timely information.
- **Discovery beyond following:** A user's existing followed series should not prevent them from discovering other relevant championships or races.
- **Scalable presentation:** The interface should accommodate multiple simultaneous live sessions and different numbers of followed series without requiring a completely different page layout.

These are **proposed design principles**, not approved homepage modules, ranking rules, or personalization requirements.

### Championship Research

The current data-provider research covers **18 racing series**, including F1, F2, Formula E, IndyCar, Indy NXT, MotoGP, Moto2, WorldSBK, WEC, IMSA, WRC, Super GT, NASCAR Cup, NASCAR O'Reilly, and GT World Challenge in Europe, America, Asia, and Australia.

**Under Validation:** The first supported series, data providers, and release-level coverage have not been finalized. Research coverage does not mean implementation or a launch commitment.

## 4. Target Users (Under Validation)

| Potential audience | Need to validate |
| --- | --- |
| **Dedicated / multi-series motorsport fans** | A faster way to follow schedules, sessions, results, and standings across championships. |
| **Casual racing followers** | A simple overview of what is happening without overwhelming detail. |
| **Automotive enthusiasts** | Relevant local automotive activities and experiences after the racing foundation is established. |

These are **working user hypotheses**. Do not describe them as validated segments or assume a particular feature is necessary without further evidence. None of these audiences is restricted to the Bay Area.

## 5. Competitive User Feedback & Value Signals (Exploratory)

**Evidence status:** The observations below come from a small, non-representative sample of publicly visible app-store reviews and motorsport forum discussions, reviewed on **2026-10-29**. They are **user feedback signals**, not validated market size, demand rankings, representative research, or evidence that OpenGP has already solved these problems. Product coverage figures are competitors' own claims and have not been independently audited.

| User feedback signal | Public evidence | Product implication for OpenGP (Proposed) |
| --- | --- | --- |
| **One reliable multi-series view saves effort.** Fans describe checking multiple championship calendars and sites as tedious; they value seeing the whole weekend in one place. | [IMSA fans discussing schedule apps (2024)](https://www.reddit.com/r/IMSARacing/comments/1bf3sj2/best_app_to_view_mostall_motorsports_schedules/) · [The Racing Line user reviews](https://apps.apple.com/us/app/theracingline-racing-live-tv/id1544668453?platform=iphone&see-all=reviews) | Optimize the basic workflow of finding the next relevant sessions across series. Measure task completion and accuracy before adding depth. |
| **Exact, usable timing matters more than a date alone.** Fans ask for individual race/session start times, local-time conversion, and convenient calendar access; some also appreciate clear viewing links. | [Supercars calendar discussion (2025)](https://www.reddit.com/r/v8supercars/comments/1je0pfy) · [FullGrid user reviews](https://apps.apple.com/us/app/fullgrid-motorsports/id6778998230) · [The Racing Line feature-request review](https://apps.apple.com/us/app/theracingline-racing-live-tv/id1544668453?platform=iphone&see-all=reviews) | Treat local time, session-level clarity, and source transparency as core experience concerns; calendar integration and where-to-watch remain scope decisions. |
| **Trust is damaged by missed alerts and unreliable presentation.** Individual reviews mention notifications that require periodic app reopening and occasionally slow or inconsistent time display. | [The Racing Line reviews, including a 2025 notification complaint](https://apps.apple.com/us/app/theracingline-racing-live-tv/id1544668453?platform=iphone&see-all=reviews) | Prioritize correct session states, refresh/error clarity, and dependable information. If reminders are eventually offered, notification reliability must be verified rather than assumed. |
| **Preferences should be useful without creating fragile setup.** A forum user reported losing followed-series settings after clearing browser data; other users value selecting series and session types. | [Discussion of raceday.watch browser-stored preferences (2026)](https://www.reddit.com/r/IMSARacing/comments/1v87cqz/i_kept_missing_sessions_because_of_timezone_math/) · [The Racing Line user reviews](https://apps.apple.com/us/app/theracingline-racing-live-tv/id1544668453?platform=iphone&see-all=reviews) | If Following or favorites are introduced, test how users expect preferences to persist. This does not itself approve an account system or a cross-device sync requirement. |
| **Discovery has appeal, but is not an uncontested differentiator.** Some users praise finding new championships through existing trackers; existing competitors already promote broad coverage and discovery-related features. | [The Racing Line user reviews](https://apps.apple.com/us/app/theracingline-racing-live-tv/id1544668453) · [FullGrid's feature description](https://www.fullgridmotorsports.com/about) | Explore *how* OpenGP could recommend a relevant new race with a useful reason to watch, rather than treating “multi-series” or “discovery” alone as unique. |
| **Access and pricing create friction, but free access alone is not a moat.** Some reviews object to paying for basic race times; at least one competing multi-series tracker is already offered free. | [The Racing Line Google Play reviews](https://play.google.com/store/apps/details?id=com.daveellis.theracingline) · [FullGrid product information](https://www.fullgridmotorsports.com/about) | Keep core-user-value and pricing assumptions separate. Do not claim that a free schedule would, by itself, differentiate OpenGP. |

**Competitive constraint:** The Racing Line and FullGrid already advertise extensive multi-series calendars, local-time schedules, reminders, and watch information. Therefore, **aggregating more racing series is not yet a defensible product differentiator**. OpenGP must first deliver a credible basic experience, then validate whether clearer UX, more useful cross-series discovery, or eventual connections to real-world automotive activities lead to distinct user value.

**Unverified opportunities:** These reviews do **not** establish demand for local automotive events, Event Creation, ticketing, an AI recommendation system, or a WATCH → GO → DO conversion journey. Those need separate research and testing. No reviewed comments should be treated as a request from OpenGP's own users.

## 6. Future Opportunities (Proposed)

Possible future areas include personalized following, saved events, notifications, news, community discussion, automotive event listings, and driving experiences.

Specific Bay Area pilot event types, sourcing methods, maps, event creation, booking, and payment workflows remain **unapproved**. They should not be treated as current MVP requirements. Starting event-content validation in the Bay Area does not imply that future event discovery or OpenGP's users are confined there.

## 7. Open Decisions

| Question | Needed before commitment |
| --- | --- |
| Which championships and data capabilities ship first? | Provider validation and data-quality evidence. |
| What defines a complete first release? | An approved scope and measurable acceptance criteria. |
| Which users and workflows matter most? | User research and product testing. |
| Which Bay Area automotive activities come first? | Event availability, relevance, and feasibility validation. |
| How and when should local event discovery expand geographically? | Evidence from the initial content pilot, operational capacity, and user demand in other regions. |
| When should personalization or community be added? | Evidence of user value relative to cost and complexity. |

## 8. Ownership and Related Documents

**D00 · Product & Strategy** maintains this strategy. The **Founder** has final decision-making authority. **D01 · Engineering** uses approved requirements to plan and implement software.

This document defines **what and why**, not detailed feature behavior. Create feature-specific **PRDs** when requirements, user flows, and acceptance criteria are ready to be defined.

- [README](../README.md) — Developer setup and project entry point.
- [Architecture](architecture.md) — System design and implementation overview.
- [API Contract](api-contract.md) — Current API and proposed data model.
- [Data Providers](data-providers.md) — Provider integration and validation status.
