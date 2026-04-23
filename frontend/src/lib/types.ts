// export type MatchStatus = 'finished' | 'live' | 'upcoming';

// export type TopCompetition = {
//   id: string;
//   name: string;
//   icon: string;
//   officialUrl: string;
// };

// export type NewsItem = {
//   id: string;
//   title: string;
//   source: string;
//   timeAgo: string;
//   image: string;
// };

// export type MatchItem = {
//   id: string;
//   homeName: string;
//   awayName: string;

//   homeScore?: number;
//   awayScore?: number;

//   aggregate?: string;

//   minuteOrTime: string;
//   status: MatchStatus;

//   centerPrimary?: string;
//   centerSecondary?: string;
// };

// export type CompetitionGroup = {
//   id: string;
//   name: string;
//   icon: string;
//   matches: MatchItem[];
// };

export type MatchStatus = 'finished' | 'live' | 'upcoming';

export type TopCompetition = {
  id: string;
  name: string;
  icon: string;
  officialUrl: string;
};

export type NewsItem = {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  image: string;
};

export type MatchItem = {
  id: string;
  homeName: string;
  awayName: string;
  homeScore?: number;
  awayScore?: number;
  aggregate?: string;
  minuteOrTime: string;
  status: MatchStatus;
  centerPrimary?: string;
  centerSecondary?: string;
};

export type CompetitionGroup = {
  id: string;
  name: string;
  icon: string;
  matches: MatchItem[];
};

export type SessionDetailClassificationRow = {
  position: number;
  driverNumber: number;
  driverName: string;
  teamName: string;
  headshotUrl?: string | null;
  bestLapTime?: string | null;
  gapToLeader?: string | null;
  laps: number;
};

export type SessionDetail = {
  event: {
    id: string;
    eventName: string;
    seriesName: string;
    seasonName: string;
    country: string;
    location: string;
    venueName: string;
    dateStart: string;
    dateEnd: string;
  };
  session: {
    id: string;
    eventId: string;
    name: string;
    category: string;
    startTime: string;
    endTime: string;
    status: 'upcoming' | 'live' | 'finished' | 'cancelled';
  };
  classification: SessionDetailClassificationRow[];
};