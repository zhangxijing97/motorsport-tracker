export type SportradarSeriesId =
  | 'formula-e'
  | 'indycar'
  | 'indy-nxt'
  | 'nascar'
  | 'motogp'
  | 'rally';

export const SPORTRADAR_SERIES_CONFIG: Record<
  SportradarSeriesId,
  {
    displayName: string;
    category: string;
    baseUrl: string;
  }
> = {
  'formula-e': {
    displayName: 'Formula E',
    category: 'Electric Single-Seater',
    baseUrl: 'https://api.sportradar.com/formulae/trial/v2',
  },
  indycar: {
    displayName: 'IndyCar',
    category: 'Single-Seater',
    baseUrl: 'https://api.sportradar.com/indycar/trial/v2',
  },
  'indy-nxt': {
    displayName: 'Indy NXT',
    category: 'Single-Seater',
    baseUrl: 'https://api.sportradar.com/indylights/trial/v2',
  },
  nascar: {
    displayName: 'NASCAR',
    category: 'Stock Car',
    baseUrl: 'https://api.sportradar.com/nascar/trial/v2',
  },
  motogp: {
    displayName: 'MotoGP',
    category: 'Motorcycle Racing',
    baseUrl: 'https://api.sportradar.com/motogp/trial/v2',
  },
  rally: {
    displayName: 'Rally',
    category: 'Rally',
    baseUrl: 'https://api.sportradar.com/rally/trial/v2',
  },
};
