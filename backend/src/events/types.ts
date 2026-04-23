// export type SessionStatus = 'upcoming' | 'live' | 'finished' | 'cancelled';

// export type SessionCategory =
//   | 'practice'
//   | 'qualifying'
//   | 'race'
//   | 'sprint'
//   | 'test'
//   | 'warmup'
//   | 'stage'
//   | 'heat'
//   | 'feature'
//   | 'shootout'
//   | 'other';

// export interface Series {
//   id: string;
//   name: string;
//   category: string;
// }

// export interface Season {
//   id: string;
//   year: number;
//   name: string;
// }

// export interface Session {
//   id: string;
//   eventId: string;
//   name: string;
//   category: SessionCategory;
//   startTime: string;
//   endTime: string;
//   status: SessionStatus;
// }

// export interface Event {
//   id: string;
//   series: Series;
//   season: Season;

//   eventName: string;
//   roundNumber?: number;
//   roundLabel?: string;

//   country: string;
//   location: string;
//   venueName: string;

//   sessions: Session[];
// }

export type SessionStatus = 'upcoming' | 'live' | 'finished' | 'cancelled';

export type SessionCategory =
  | 'practice'
  | 'qualifying'
  | 'race'
  | 'sprint'
  | 'test'
  | 'warmup'
  | 'stage'
  | 'heat'
  | 'feature'
  | 'shootout'
  | 'other';

export interface Series {
  id: string;
  name: string;
  category: string;
}

export interface Season {
  id: string;
  year: number;
  name: string;
}

export interface Session {
  id: string;
  eventId: string;
  name: string;
  category: SessionCategory;
  startTime: string;
  endTime: string;
  status: SessionStatus;
}

export interface Event {
  id: string;
  series: Series;
  season: Season;

  eventName: string;
  roundNumber?: number;
  roundLabel?: string;

  country: string;
  location: string;
  venueName: string;
  dateStart: string;
  dateEnd: string;

  sessions: Session[];
}

export interface SessionClassificationRow {
  position: number;
  driverNumber: number;
  driverName: string;
  teamName: string;
  headshotUrl?: string | null;
  bestLapTime?: string | null;
  gapToLeader?: string | null;
  laps: number;
}