// import type { CompetitionGroup, MatchItem, MatchStatus } from './types';

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

// type BackendSeries = {
//   id: string;
//   name: string;
//   category: string;
// };

// type BackendSeason = {
//   id: string;
//   year: number;
//   name: string;
// };

// type BackendSession = {
//   id: string;
//   eventId: string;
//   name: string;
//   category: string;
//   startTime: string;
//   endTime: string;
//   status: 'upcoming' | 'live' | 'finished' | 'cancelled';
// };

// type BackendEvent = {
//   id: string;
//   series: BackendSeries;
//   season: BackendSeason;
//   eventName: string;
//   roundNumber?: number;
//   roundLabel?: string;
//   country: string;
//   location: string;
//   venueName: string;
//   sessions: BackendSession[];
// };

// function mapBackendStatusToFrontendStatus(
//   status: BackendSession['status'],
// ): MatchStatus {
//   if (status === 'live') return 'live';
//   if (status === 'finished') return 'finished';
//   return 'upcoming';
// }

// function getSeriesIcon(seriesId: string): string {
//   const normalized = seriesId.toLowerCase();

//   if (normalized.includes('f1')) return '🏎️';
//   if (normalized.includes('formula-e')) return '🔋';
//   if (normalized.includes('wec')) return '⏱️';
//   if (normalized.includes('indycar')) return '🇺🇸';

//   return '🏁';
// }

// function formatTimeForBadge(
//   startTime: string,
//   status: BackendSession['status'],
// ): string {
//   if (status === 'finished') return 'FT';
//   if (status === 'live') return 'LIVE';

//   return new Date(startTime).toLocaleTimeString('en-GB', {
//     hour: '2-digit',
//     minute: '2-digit',
//     hour12: false,
//   });
// }

// function mapSessionToMatch(
//   event: BackendEvent,
//   session: BackendSession,
// ): MatchItem {
//   return {
//     id: session.id,
//     homeName: session.name,
//     awayName: event.venueName,
//     status: mapBackendStatusToFrontendStatus(session.status),
//     minuteOrTime: formatTimeForBadge(session.startTime, session.status),
//     centerPrimary:
//       event.roundLabel ??
//       (event.roundNumber ? `Round ${event.roundNumber}` : undefined),
//     centerSecondary: event.series.name,
//   };
// }

// function mapEventToGroup(event: BackendEvent): CompetitionGroup {
//   return {
//     id: event.id,
//     name: event.eventName,
//     icon: getSeriesIcon(event.series.id),
//     matches: event.sessions.map((session) => mapSessionToMatch(event, session)),
//   };
// }

// export async function getTodayCompetitionGroups(
//   selectedDate?: string,
// ): Promise<CompetitionGroup[]> {
//   const url = new URL(`${API_BASE_URL}/events/today`);

//   if (selectedDate) {
//     url.searchParams.set('date', selectedDate);
//   }

//   const response = await fetch(url.toString(), {
//     cache: 'no-store',
//   });

//   if (!response.ok) {
//     throw new Error('Failed to fetch events from backend');
//   }

//   const data: BackendEvent[] = await response.json();
//   return data.map(mapEventToGroup);
// }

import type {
  CompetitionGroup,
  MatchItem,
  MatchStatus,
  SessionDetail,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

type BackendSeries = {
  id: string;
  name: string;
  category: string;
};

type BackendSeason = {
  id: string;
  year: number;
  name: string;
};

type BackendSession = {
  id: string;
  eventId: string;
  name: string;
  category: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'live' | 'finished' | 'cancelled';
};

type BackendEvent = {
  id: string;
  series: BackendSeries;
  season: BackendSeason;
  eventName: string;
  roundNumber?: number;
  roundLabel?: string;
  country: string;
  location: string;
  venueName: string;
  sessions: BackendSession[];
};

function mapBackendStatusToFrontendStatus(
  status: BackendSession['status'],
): MatchStatus {
  if (status === 'live') return 'live';
  if (status === 'finished') return 'finished';
  return 'upcoming';
}

function getSeriesIcon(seriesId: string): string {
  const normalized = seriesId.toLowerCase();

  if (normalized.includes('f1')) return '🏎️';
  if (normalized.includes('formula-e')) return '🔋';
  if (normalized.includes('wec')) return '⏱️';
  if (normalized.includes('indycar')) return '🇺🇸';

  return '🏁';
}

function formatTimeForBadge(
  startTime: string,
  status: BackendSession['status'],
): string {
  if (status === 'finished') return 'FT';
  if (status === 'live') return 'LIVE';

  return new Date(startTime).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function mapSessionToMatch(
  event: BackendEvent,
  session: BackendSession,
): MatchItem {
  return {
    id: session.id,
    homeName: session.name,
    awayName: event.venueName,
    status: mapBackendStatusToFrontendStatus(session.status),
    minuteOrTime: formatTimeForBadge(session.startTime, session.status),
    centerPrimary:
      event.roundLabel ??
      (event.roundNumber ? `Round ${event.roundNumber}` : undefined),
    centerSecondary: event.series.name,
  };
}

function mapEventToGroup(event: BackendEvent): CompetitionGroup {
  return {
    id: event.id,
    name: event.eventName,
    icon: getSeriesIcon(event.series.id),
    matches: event.sessions.map((session) => mapSessionToMatch(event, session)),
  };
}

export async function getTodayCompetitionGroups(
  selectedDate?: string,
): Promise<CompetitionGroup[]> {
  const url = new URL(`${API_BASE_URL}/events/today`);

  if (selectedDate) {
    url.searchParams.set('date', selectedDate);
  }

  const response = await fetch(url.toString(), {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch events from backend');
  }

  const data: BackendEvent[] = await response.json();
  return data.map(mapEventToGroup);
}

export async function getSessionDetail(sessionId: string): Promise<SessionDetail> {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/detail`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch session detail from backend');
  }

  return response.json();
}