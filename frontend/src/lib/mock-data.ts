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

export const newsItems = [
  {
    id: 'mercedes-long-run-pace',
    title: 'Mercedes shows stronger long-run pace heading into the weekend',
    source: 'Motorsport Tracker',
    timeAgo: '2 hr. ago',
    imageUrl:
      'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1200&q=80',
    content:
      'Mercedes showed improved long-run pace during the latest practice sessions, suggesting the team may be more competitive over a full race distance. Tire degradation appears to be under better control, and race simulations were among the strongest on track.',
  },
  {
    id: 'ferrari-upgrades',
    title: 'Ferrari upgrades could reshape the order at the front',
    source: 'Motorsport Tracker',
    timeAgo: '5 hr. ago',
    imageUrl:
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80',
    content:
      'Ferrari introduced a new aerodynamic package aimed at improving corner entry stability. Early data suggests gains in medium-speed corners, which could help the team challenge for podiums this weekend.',
  },
  {
    id: 'redbull-dominance',
    title: 'Red Bull maintains edge despite tighter midfield battle',
    source: 'Autosport Daily',
    timeAgo: '7 hr. ago',
    imageUrl:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    content:
      'Red Bull continues to dominate the field, but the midfield battle is heating up with several teams closing the performance gap. Strategy execution could become the deciding factor.',
  },
  {
    id: 'mclaren-progress',
    title: 'McLaren continues steady progress with strong practice showing',
    source: 'Race Hub',
    timeAgo: '9 hr. ago',
    imageUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    content:
      'McLaren demonstrated consistent pace throughout practice, signaling steady development progress. The team is aiming for a top-five finish this weekend.',
  },
  {
    id: 'aston-martin-strategy',
    title: 'Aston Martin focusing on race strategy improvements',
    source: 'Motorsport Insight',
    timeAgo: '12 hr. ago',
    imageUrl:
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80',
    content:
      'Aston Martin is prioritizing race-day execution after mixed qualifying performances. Improved pit stop efficiency could play a key role.',
  },
  {
    id: 'indycar-title-fight',
    title: 'IndyCar title fight intensifies after dramatic finish',
    source: 'Trackside News',
    timeAgo: '15 hr. ago',
    imageUrl:
      'https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1200&q=80',
    content:
      'A last-lap overtake has reshaped the IndyCar championship standings, setting up an intense battle heading into the next round.',
  },
  {
    id: 'formula-e-standings',
    title: 'Formula E championship battle tightens in Madrid',
    source: 'Electric Racing',
    timeAgo: '18 hr. ago',
    imageUrl:
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
    content:
      'The Formula E championship remains wide open after the Madrid race, with multiple drivers within striking distance of the lead.',
  },
  {
    id: 'nascar-playoffs',
    title: 'NASCAR playoff picture begins to take shape',
    source: 'Oval Report',
    timeAgo: '20 hr. ago',
    imageUrl:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
    content:
      'With several races completed, the NASCAR playoff picture is starting to form. Consistency will be key for drivers aiming to secure a spot.',
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