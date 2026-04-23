import type { CompetitionGroup, NewsItem, TopCompetition } from './types';

export const topSeries: TopCompetition[] = [
  {
    id: 'f1',
    name: 'Formula 1',
    icon: '🏎️',
    officialUrl: 'https://www.formula1.com',
  },
  {
    id: 'f2',
    name: 'Formula 2',
    icon: '🏁',
    officialUrl: 'https://www.fiaformula2.com',
  },
  {
    id: 'f3',
    name: 'Formula 3',
    icon: '⚡',
    officialUrl: 'https://www.fiaformula3.com',
  },
  {
    id: 'wec',
    name: 'WEC',
    icon: '⏱️',
    officialUrl: 'https://www.fiawec.com',
  },
  {
    id: 'indycar',
    name: 'IndyCar',
    icon: '🇺🇸',
    officialUrl: 'https://www.indycar.com',
  },
  {
    id: 'formulae',
    name: 'Formula E',
    icon: '🔋',
    officialUrl: 'https://www.fiaformulae.com',
  },
  {
    id: 'imsa',
    name: 'IMSA',
    icon: '🚗',
    officialUrl: 'https://www.imsa.com',
  },
  {
    id: 'gtwc',
    name: 'GT World',
    icon: '🌍',
    officialUrl: 'https://www.gt-world-challenge.com',
  },
];

export const rightNews: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Mercedes shows stronger long-run pace heading into the weekend',
    source: 'Motorsport Tracker',
    timeAgo: '2 hr. ago',
    image:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'news-2',
    title: 'Ferrari upgrades could reshape the order at the front',
    source: 'Motorsport Tracker',
    timeAgo: '5 hr. ago',
    image:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  },
];

export const competitionGroups: CompetitionGroup[] = [
  {
    id: 'f1-today',
    name: 'Formula 1',
    icon: '🏎️',
    matches: [
      {
        id: 'f1-race',
        homeName: 'George Russell',
        awayName: 'Mercedes',
        homeScore: 58,
        awayScore: undefined,
        aggregate: '1:23:06.801',
        minuteOrTime: 'FT',
        status: 'finished',
        centerPrimary: 'Round 8',
        centerSecondary: 'Formula 1',
      },
      {
        id: 'f1-live',
        homeName: 'Max Verstappen',
        awayName: 'Red Bull',
        homeScore: 22,
        awayScore: undefined,
        aggregate: 'Lap 31 / 58',
        minuteOrTime: '31',
        status: 'live',
        centerPrimary: 'Round 8',
        centerSecondary: 'Formula 1',
      },
      {
        id: 'f1-upcoming',
        homeName: 'Sprint Qualifying',
        awayName: 'Spa-Francorchamps',
        minuteOrTime: '15:00',
        status: 'upcoming',
        centerPrimary: 'Round 8',
        centerSecondary: 'Formula 1',
      },
    ],
  },
];