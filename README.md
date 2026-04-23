# motorsport-tracker

# Core Idea

I’m building a web application that helps motorsport fans **follow racing series, drivers, and teams**, and **track race schedules, results, and event progress in one place**.

Currently, motorsport information is fragmented across official apps and websites. Users often need to switch between multiple platforms to check schedules, standings, and results.

This project aims to **centralize that experience into a single, user-focused tracking platform**, similar to how FotMob works for football.

---

# Target Users

## 1. Dedicated Motorsport Fans
They follow specific series like Formula 1 and want quick access to race schedules, standings, and driver performance.

## 2. Casual Followers
They don’t follow every race closely, but want an easy way to check what’s happening and stay updated with minimal effort.

---

# Core Functionality

## Use Case 1: Discover and Inspect Events
- Browse upcoming and recent races  
- Filter by racing series  
- Open a race event page  
- View race weekend structure (practice, qualifying, race), location, and key details  

## Use Case 2: Follow and Track Entities
- Follow drivers, teams, or racing series  
- View a personalized dashboard  
- Track upcoming races and recent results related to followed items  
- Monitor basic race progress or standings when available  

# Research

## Existing Market Overview for a Motorsport Tracking Platform

There are already several platforms in the motorsport space that overlap with parts of this idea. However, there is still no widely recognized product that fully combines:

- multi-series coverage  
- highly personalized following of drivers, teams, and championships  
- real-time race tracking  
- future news, comments, and community interaction  

In other words, the market has **partial solutions**, but not one clear **all-in-one "FotMob for motorsport"** product.

---

## Main Types of Existing Platforms

### 1. Official Series Apps
Examples: Formula 1 official app, Formula E official app

These platforms are usually strong in:
- live timing
- race results
- standings
- driver/team-specific updates

Their biggest limitation is that they focus on **only one championship**.  
A user who follows multiple series still needs to switch between several apps.

---

### 2. Motorsport Media and Aggregation Platforms
Examples: Motorsport.com and similar media-based apps

These platforms are strong in:
- broad series coverage
- schedules
- results
- standings
- news content

Their weakness is that they are often designed more like **news/data portals** than deeply personalized tracking tools.  
They provide information, but they do not always build the full experience around the user's favorite drivers, teams, and series.

---

### 3. Schedule and Broadcast Tracking Tools
Examples: platforms focused on calendars, streams, and race schedules

These products are useful for:
- seeing when races happen
- checking where to watch
- following many championships in one place

They are close to the "centralized tracking" idea, but they are usually lighter products.  
They often do **not** focus as much on:
- deep personalization
- rich live race pages
- community discussion
- long-term follow features

---

### 4. Grassroots / Local Race Data Platforms
Examples: platforms for club racing, local tracks, or timing systems

These are strong in:
- live timing
- local event results
- track-specific information

They serve a different segment of the market and are often fragmented.  
They are useful, but they do not solve the broader problem of unified motorsport tracking across major professional series.

---

## Key Market Observation

The current motorsport ecosystem is fragmented:

- official apps cover single series well
- media platforms cover many series but are less personalized
- schedule tools help with discovery and timing
- fantasy apps provide engagement and social features
- local race tools serve separate communities

Because of this fragmentation, users often need multiple platforms to do what one football fan could do in a single app like FotMob.

---

## Why This Creates an Opportunity

A new platform could stand out by combining the strongest parts of these existing products into one experience:

- follow favorite drivers, teams, and championships
- track multiple series in one place
- see live race status and updates
- receive personalized content
- later expand into news, comments, and community features

This means the opportunity is not based on creating something completely unheard of.  
Instead, it is about building a **better integrated product** than what currently exists.

---

## Final Conclusion

Similar platforms already exist, but most of them only solve part of the problem.  
There is still room for a product that works as a true **all-in-one motorsport tracking platform** with:

1. cross-series coverage  
2. strong personalization  
3. real-time race tracking  
4. future community and discussion features  

That gap is likely the strongest foundation for this project.

# Current System Diagram
┌──────────────────────┐
│      User Browser    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Next.js Frontend   │
│  - reads date        │
│  - renders homepage  │
│  - requests backend  │
└──────────┬───────────┘
           │ HTTP
           ▼
┌──────────────────────┐
│    NestJS Backend    │
│  - route handling    │
│  - query parsing     │
│  - API integration   │
│  - normalization     │
└──────────┬───────────┘
           │ HTTP
           ▼
┌──────────────────────┐
│     OpenF1 API       │
│  - meetings          │
│  - sessions          │
└──────────────────────┘

# Planned Expanded
┌──────────────────────┐
│      User Browser    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Next.js Frontend   │
│  - UI                │
│  - auth state        │
│  - routing           │
└──────────┬───────────┘
           │
           ▼
┌────────────────────────────────────┐
│           NestJS Backend           │
│  - API routes                      │
│  - external API services           │
│  - normalization layer             │
│  - auth-protected endpoints        │
│  - aggregation / filtering         │
└───────┬───────────────┬────────────┘
        │               │
        ▼               ▼
┌───────────────┐   ┌───────────────┐
│ PostgreSQL    │   │ Redis         │
│ - users       │   │ - live cache  │
│ - follows     │   │ - fast reads  │
│ - preferences │   │ - temp state  │
│ - stored meta │   └───────────────┘
└───────┬───────┘
        │
        ▼
┌────────────────────────────────────┐
│ External Data Sources              │
│ - OpenF1                           │
│ - future APIs for other series     │
└────────────────────────────────────┘

# Question
1. Deployment Platform
2. Cache

## Run Project

### Backend
cd backend
npm install
npm run start:dev

Runs on: http://localhost:3001

---

### Frontend
cd frontend
npm install
npm run dev

Runs on: http://localhost:3000

---

## Notes
- Start backend first
- Frontend calls backend API