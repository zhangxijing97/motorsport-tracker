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

For a source-linked, named-product comparison (features, scale, reviews, UX, pricing, and valuation disclosure), see [Appendix A](#appendix-a-competitive-landscape-research-snapshot).

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

---

## Appendix A. Competitive Landscape — Research Snapshot

> **Research status:** External competitor research; **not** a Founder-approved feature plan or verified user study.  
> **Captured:** 2026-10-29 (US-facing public pages unless specified). Numbers, catalogs, prices, and ratings can change.  
> **Method:** Official websites, App Store/Google Play public listings, selected review excerpts, and one public company registry. **No hands-on installation, usability test, subscriber data, or financial due diligence was performed.**  
> **Reading convention:** `Listed` = claimed in product listing; `Review signal` = one or more public opinions, not representative; `Unknown` = not substantiated, **not** zero or absent.

### A1. Product identity — avoid same-name confusion

| Competitive product in this report | Identity matched to owner/developer | Primary sources | Important disambiguation |
| --- | --- | --- | --- |
| **The Racing Line** | The Racing Line Software Limited / The Racing Line | [Official calendar](https://theracingline.app/race-calendar) · [App Store](https://apps.apple.com/us/app/theracingline-racing-live-tv/id1544668453) · [Google Play](https://play.google.com/store/apps/details?id=com.daveellis.theracingline) | This is the motorsport calendar/streaming app, not other racing-related businesses with similar names. |
| **FullGrid** | FullGrid Media, LLC | [Official about](https://www.fullgridmotorsports.com/about) · [App Store](https://apps.apple.com/us/app/fullgrid-motorsports/id6778998230) · [Google Play](https://play.google.com/store/apps/details?id=com.fullgridmedia.fullgrid) | `fullgridmotorsports.com` and `fullgridmedia.com` describe this FullGrid product. |
| **Pocket Pit Lane** | Matthew Morgan; currently presented on stores as **Motorsport Calendar: F1 & More** | [Official website](https://pocketpitlane.com/) · [App Store](https://apps.apple.com/us/app/motorsport-calendar-f1-more/id6743807792) · [Google Play](https://play.google.com/store/apps/details?id=com.mlmorgan.motorsportcalendar) | **Exclude** the unrelated *Pocket Pit-Lane* F1-only app by Dekeract (`com.dekeract.f12026calendar`). Name similarity is not product identity. |
| **NextGP** | **JsCti**, Android app (`com.jscti.nextgp_f1motogp`) | [Official site](https://jscti.github.io/nextgp/) · [Google Play](https://play.google.com/store/apps/details?id=com.jscti.nextgp_f1motogp) | **Exclude** the separate iOS *NextGP – Grand Prix Widgets* by **Chris Free Consulting LLC**, which is primarily an F1 companion. Their downloads, reviews, and features must not be combined. |
| **RaceDay** | **Maarten Rietdijk**, motorsport-calendar app | [Official site](https://racedaycalendar.app/) · [App Store](https://apps.apple.com/us/app/raceday-racing-calendar/id6761820662) · [Google Play](https://play.google.com/store/apps/details?id=nl.maartenrietdijk.raceday) | Do not mix with RunSignup **RaceDay**, `race.day` event-organizer software, or other similarly named race apps. |

### A2. Side-by-side positioning and coverage

Coverage counts are **vendor-stated** and do not independently establish full season/session completeness, correctness, timeliness, or the same definition of a *series*.

| Product | Primary positioning | Advertised series coverage | Platform / primary user journey | Source |
| --- | --- | --- | --- | --- |
| **The Racing Line** | Broad motorsport hub combining calendar, reminders, and available live streams | **250+** series; app claims streaming integration for **150+** series where available | iOS / Android; find races → personalize schedule → alerts / streams | [App Store description](https://apps.apple.com/us/app/theracingline-racing-live-tv/id1544668453) |
| **FullGrid** | One chronological racing timeline, including mainstream and grassroots racing | **165+** on its About page / iOS store; older Google Play description says **145+** | Web / iOS / Android; scan what's next → filter → view session, results, watch source | [About](https://www.fullgridmotorsports.com/about) · [Google Play](https://play.google.com/store/apps/details?id=com.fullgridmedia.fullgrid) |
| **Pocket Pit Lane** | Customizable motorsport calendar focused on useful session-level planning | **18** on official site (store lists the related championship names; catalog may update) | iOS / Android; choose series/session types → local times → alerts / personal calendar | [Official site](https://pocketpitlane.com/) · [App Store](https://apps.apple.com/us/app/motorsport-calendar-f1-more/id6743807792) |
| **NextGP (JsCti)** | Minimalist, ad-free agenda to avoid missing races | **16** motorsport categories/series per official listing | Android; multi-series weekend/month/season views → reminders / widgets | [Official site](https://jscti.github.io/nextgp/) · [Google Play](https://play.google.com/store/apps/details?id=com.jscti.nextgp_f1motogp) |
| **RaceDay (Maarten Rietdijk)** | Personal race calendar with session results and standings | **35** series claimed on official site | iOS / Android; follow series → race sessions → results / standings / notifications | [Official site](https://racedaycalendar.app/) · [App Store](https://apps.apple.com/us/app/raceday-racing-calendar/id6761820662) |

**Coverage caution:** FullGrid's 165+/145+ mismatch shows that marketing/listing numbers may be updated at different times. These five claims are **not** a verified ranking of data quality or actual unique championships available to every user.

### A3. Functional benchmark — publicly advertised, not independently tested

`Yes` = listed as available; `Pro` = explicitly listed as a premium benefit for at least some users; `Limited` = documented geographical/availability restriction; `?` = no sufficiently clear evidence in the reviewed sources. `?` does **not** mean the feature is missing.

| Function | The Racing Line | FullGrid | Pocket Pit Lane | NextGP (JsCti) | RaceDay |
| --- | --- | --- | --- | --- | --- |
| Multi-series session schedules | Yes | Yes | Yes | Yes | Yes |
| Automatic user-local time | Yes | Yes | Yes | Yes | Yes |
| Series/session personalization | Yes | Yes | Yes | Yes | Yes |
| Start reminders / notifications | Yes | Yes | Yes | Yes | Yes |
| Published session results | ? (verify coverage) | Yes (vendor claim) | ? (verify) | **Pro** | **Pro** |
| Season standings | ? (verify) | Yes (vendor claim) | ? (verify) | **Pro** | Yes (vendor claim; verify access level) |
| Where-to-watch / broadcaster info | Streaming links/in-app embeds where available | Country-specific listings | ? | **Limited:** TV channels mainly FR/BE/CH | ? |
| Device-calendar sync / export | Export listed | ? | Plus / paid plan listed | **Pro** (ICS/webcal) | ? |
| Weather / circuit details | Weather listed in updates; confirm availability | Circuit maps/details | Weather | Weather / day-night | Weather on official site; confirm plan |
| Home-screen widgets | Yes | ? | ? | Yes | Yes |
| Local automotive event discovery / track-day booking | **Not established** | **Not established** | **Not established** | **Not established** | **Not established** |

**Evidence:** [TRL store/version history](https://apps.apple.com/us/app/theracingline-racing-live-tv/id1544668453) · [FullGrid description](https://www.fullgridmotorsports.com/about) · [Pocket store/version history](https://apps.apple.com/us/app/motorsport-calendar-f1-more/id6743807792) · [NextGP detailed feature list](https://play.google.com/store/apps/details?id=com.jscti.nextgp_f1motogp) · [RaceDay listing](https://apps.apple.com/us/app/raceday-racing-calendar/id6761820662). Feature placement, quality, and access tiers require live in-app testing. Local event functionality is **unverified**, not definitively absent.

### A4. Public traction, ratings, and review volume

| Product | Google Play downloads (public tier, Android only) | Google Play rating | US App Store rating | Other scale signals | Confidence / interpretation |
| --- | --- | --- | --- | --- | --- |
| **The Racing Line** | **10K+** | **3.5/5**, ~48 reviews in one US listing capture | **4.7/5**, ~389 ratings | No independently verified MAU, paying subscribers, or lifetime total across platforms | **Moderate** for app-store snapshot; rating differs by platform/region |
| **FullGrid** | **100+** | Insufficient public review sample in consulted listing | **5.0/5**, **12** ratings | No independently verified MAU or cross-platform total | **Low** for rating generalization; tiny sample |
| **Pocket Pit Lane** | **1K+** | **3.5/5**, ~73 reviews | **4.5/5**, **14** ratings | Official site claims **3,000+ downloads** (developer-reported, method unspecified) | **Moderate** for store tiers; developer claim unverified |
| **NextGP (JsCti)** | **50K+** | **4.8/5**, ~1.5K–1.6K reviews (locale/capture dependent) | **Not applicable to this JsCti Android app** | AppBrain separately **estimates ~75K installs**; third-party estimate, not Google Play's exact count | **Relatively stronger public review signal** among these five; still not MAU |
| **RaceDay (Maarten Rietdijk)** | **1K+** | Insufficient public review sample / no stable aggregate confirmed | **5.0/5**, **2** ratings | Official site claims **10,000+ fans**; undefined and not independently audited | **Low** for store rating and marketing claim |

**Sources:** [TRL Play](https://play.google.com/store/apps/details?id=com.daveellis.theracingline) / [iOS](https://apps.apple.com/us/app/theracingline-racing-live-tv/id1544668453) · [FullGrid Play](https://play.google.com/store/apps/details?id=com.fullgridmedia.fullgrid) / [iOS](https://apps.apple.com/us/app/fullgrid-motorsports/id6778998230) · [Pocket Play](https://play.google.com/store/apps/details?id=com.mlmorgan.motorsportcalendar) / [iOS](https://apps.apple.com/us/app/motorsport-calendar-f1-more/id6743807792) / [developer claim](https://pocketpitlane.com/) · [NextGP Play](https://play.google.com/store/apps/details?id=com.jscti.nextgp_f1motogp) / [third-party AppBrain estimate](https://www.appbrain.com/app/nextgp-%7C-calendar-f1-motogp-%E2%80%A6/com.jscti.nextgp_f1motogp) · [RaceDay Play](https://play.google.com/store/apps/details?id=nl.maartenrietdijk.raceday) / [iOS](https://apps.apple.com/us/app/raceday-racing-calendar/id6761820662) / [developer claim](https://racedaycalendar.app/).

**Do not compare these as user totals:** Google Play `10K+` means cumulative installs within a published tier **on Android**, not 10,000 active people. App Store rating count is **not** download count. Developer-reported “fans” may mean something else entirely. Cross-platform total users, MAU/DAU, retention, paid conversion, and revenue are **unknown** for all five in this research.

### A5. User reviews and UX findings

These observations summarize **selected public reviews and product presentation**, not hands-on UX testing. We do **not** assign an objective UX score without running comparable tasks in each product.

| Product | Positive review / UX signal | Negative review / unresolved risk | OpenGP research implication (not a commitment) |
| --- | --- | --- | --- |
| **The Racing Line** | Users praise the weekly overview, visual organization, and discovering racing they did not previously follow. | Some complain about locked basic times, ad/paid expectations, loading delays; one Android user says an account change disrupted preferences and added setup work. | Test the **browse-without-friction** experience; keep preference migration, empty states, and trustworthy timing visible. |
| **FullGrid** | Small set of iOS reviewers values where-to-watch links, reminders, weekend planning, and intuitive access. | Only 12 US iOS ratings; product claims of large coverage/results are not a substitute for data accuracy checks. | Compare “next event → viewing source” completion, not just number of supported series. |
| **Pocket Pit Lane** | Reviewer praises choosing **session types per series**, international time-zone usefulness, and responsive developer support. | Some reviews object to subscriptions/paywalls; a Google Play user said access disappeared behind a paywall (developer responded it was not intended for existing users). | Per-series session filtering may be valuable, but monetization and changing entitlements can damage trust. |
| **NextGP (JsCti)** | Users mention intuitive UI and recurring weekly use; developer highlights offline-first behavior, configurable widgets, and minimalism. | Multiple Google Play reviewers ask for more GT/ELMS/BTCC-type series; breadth is narrower than highest-coverage competitors. | A smaller catalog can still be useful **if core navigation is excellent**, but missing target series is a clear gap for some enthusiasts. |
| **RaceDay (Maarten Rietdijk)** | A US iOS review praises clean UI and convenience; release notes describe continued improvements to onboarding, calendar, widgets, results, and state handling. | Just **two** US iOS ratings: cannot establish typical satisfaction or stability. Paid results/following limits may affect the user journey. | Evaluate user journey and paid boundaries with first-hand trials; avoid extrapolating from a perfect small-sample score. |

**Primary review evidence:** [TRL iOS reviews](https://apps.apple.com/us/app/theracingline-racing-live-tv/id1544668453?platform=iphone&see-all=reviews) / [TRL Android reviews](https://play.google.com/store/apps/details?id=com.daveellis.theracingline) · [FullGrid iOS reviews](https://apps.apple.com/us/app/fullgrid-motorsports/id6778998230?platform=iphone&see-all=reviews) · [Pocket iOS reviews](https://apps.apple.com/us/app/motorsport-calendar-f1-more/id6743807792) / [Pocket Android reviews](https://play.google.com/store/apps/details?id=com.mlmorgan.motorsportcalendar) · [NextGP Google Play reviews](https://play.google.com/store/apps/details?id=com.jscti.nextgp_f1motogp) · [RaceDay iOS review](https://apps.apple.com/us/app/raceday-racing-calendar/id6761820662).

**Recurring product-value signals across competitors (exploratory):** dependable **session-level local time**, a quick **weekend view**, **selective following**, convenient **reminders**, clear **results** and **where-to-watch** access. Reviews also suggest the risks of hidden core information, preference loss, confusing entitlements, and stale/missing data. There is not enough evidence here to rank these pain points by prevalence, or to validate demand for OpenGP's future real-world event discovery.

### A6. Pricing and business model (public snapshot, not revenue)

| Product | Observed model | Example US price / detail | Important caveat |
| --- | --- | --- | --- |
| **The Racing Line** | Free download; ads and **Pro** in-app subscriptions | US App Store lists a **$2.99/month** and **$29.99/year** Pro option, plus promotional prices (e.g. $0.99/month, $8.99/year). | Listing multiple offers does not prove which price every user receives or what current conversion is. [Source](https://apps.apple.com/us/app/theracingline-racing-live-tv/id1544668453) |
| **FullGrid** | **Free** app on iOS/Android (as publicly listed) | No paid subscription identified in reviewed official listings. | Free distribution does not establish revenue = $0 or a permanent business model. [Source](https://www.fullgridmotorsports.com/about) |
| **Pocket Pit Lane** | Free download with paid plans / in-app purchases | US App Store lists **Plus $2.99/month**, **$29.99/year** and other legacy/offer tiers; also one-time/lifetime options in the purchase list. | Entitlements, trial terms, and exact current checkout vary; store wording also says “Subscription required.” [Source](https://apps.apple.com/us/app/motorsport-calendar-f1-more/id6743807792) |
| **NextGP (JsCti)** | **Free tier + one-time Pro upgrade; no ads** per developer | Developer describes lifetime Pro, not a recurring subscription. | Exact US Pro checkout price not independently verified. [Source](https://jscti.github.io/nextgp/) |
| **RaceDay (Maarten Rietdijk)** | Free download + **monthly/yearly Pro** and a listed **30-day free trial** | US App Store lists **$2.99/month** and **$29.99/year**. | Trial eligibility and paid access vary by platform/account; store has only 2 US iOS ratings. [Source](https://apps.apple.com/us/app/raceday-racing-calendar/id6761820662) |

**Commercial caution:** Price ≠ average revenue per user (ARPU); installs ≠ subscriptions; review sentiment ≠ willingness to pay. No verified subscriber, profit, retention, CAC, or ARR figures were identified.

### A7. Company value / valuation, funding, and financial visibility

| Product | Identifiable organization / developer | Verified public valuation | Funding / sales visibility |
| --- | --- | --- | --- |
| **The Racing Line** | The Racing Line Software Limited, a UK private limited company ([UK Companies House](https://find-and-update.company-information.service.gov.uk/company/SC822816); incorporated 2024-09-16) | **Not publicly established in this research** | Company registration is public; it is **not** a valuation or evidence of funding. No verified investment-round valuation or current revenue included. |
| **FullGrid** | FullGrid Media, LLC (named on official site and stores) | **Not publicly established** | No verified funding round, ARR, or transaction price in reviewed sources. |
| **Pocket Pit Lane** | Published by Matthew Morgan | **Not publicly established** | No verified funding round, ARR, or transaction price in reviewed sources. |
| **NextGP (JsCti)** | JsCti / independent developer identity on Google Play | **Not publicly established** | No verified funding round, ARR, or transaction price in reviewed sources. |
| **RaceDay (Maarten Rietdijk)** | Published by Maarten Rietdijk | **Not publicly established** | No verified funding round, ARR, or transaction price in reviewed sources. |

**Interpretation:** “Not publicly established” means **unknown**, **not** an assumed $0 valuation or proof of no revenue/investment. Estimating company value from visible store downloads, star ratings, or listed subscription price would be speculative without paying users, revenue, costs, growth, and ownership information. Do not transfer unrelated `RaceDay` companies' valuations to this motorsport app.

### A8. Strategic interpretation for OpenGP — proposed, not approved

1. **Basic aggregation is a competitive necessity, not a unique selling proposition.** These products already package schedule, local time, and per-session detail; broad listed coverage by itself does not establish OpenGP differentiation.
2. **Reliability, clarity, and state handling could be meaningful**, but require comparable usability and data-correctness checks against competitors, not just marketing descriptions.
3. **A richer “why watch this race?” discovery experience** may connect to the Founder Vision; users already report incidental discovery inside existing trackers, so it must be tested as an improvement, not claimed as novel.
4. **Personalized following is already standard.** The product question is how to make it simple and robust while leaving room to discover non-followed series. An account or notification system is **not** automatically approved.
5. **Bay Area event-content validation is a pilot, not a user-geo restriction.** The longer-term opportunity to connect motorsport to real automotive experiences was **not validated** by the five reviewed apps or their comments.
6. **Compete on completed user journeys, not feature count.** Later benchmark tasks should include: “What is on this weekend?”, “When is it in my timezone?”, “Where are official results?”, “Can I find something outside my followed series?”, and “What happens when data is missing or delayed?”.

**Research gaps for later validation:** hands-on task/time-on-task comparison; real coverage of the same race weekend across all apps; schedule/result correctness and update latency; free vs paid access using fresh accounts; recent review sampling with consistent regions; platform usage/retention; user interviews; verified financial data. No new roadmap or engineering work is authorized by this appendix.

### A9. Updating this competitor record

- Update a **dated snapshot** rather than overwriting history silently.
- Cite **product identity**, store region, capture date, and the exact metric type (Google installs versus App Store ratings versus a vendor's marketing claim).
- Record added/removed features and pricing changes as **observations**, not automatically as OpenGP requirements.
- Keep observed facts separate from UX hypotheses and product decisions; Founder approval is required for the latter.
- Avoid equating a Google Play install tier with monthly active users or extrapolating valuations without financial evidence.
