import type { MatchItem } from './types';

export function isFinished(match: MatchItem) {
  return match.status === 'finished';
}

export function isLive(match: MatchItem) {
  return match.status === 'live';
}

export function isUpcoming(match: MatchItem) {
  return match.status === 'upcoming';
}

export function getStatusBadgeText(match: MatchItem) {
  if (match.status === 'finished') return 'FT';
  if (match.status === 'live') return match.minuteOrTime;
  return match.minuteOrTime;
}