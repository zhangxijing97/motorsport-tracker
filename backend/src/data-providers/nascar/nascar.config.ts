export type NascarSeriesId =
  | 'nascar-cup'
  | 'nascar-xfinity'
  | 'nascar-truck';

export const NASCAR_SERIES_CONFIG: Record<
  NascarSeriesId,
  {
    displayName: string;
    category: string;
    apiSeriesCode: string;
  }
> = {
  'nascar-cup': {
    displayName: 'NASCAR Cup Series',
    category: 'Stock Car',
    apiSeriesCode: 'mc',
  },
  'nascar-xfinity': {
    displayName: 'NASCAR O’Reilly Auto Parts Series',
    category: 'Stock Car',
    apiSeriesCode: 'or',
  },
  'nascar-truck': {
    displayName: 'NASCAR Craftsman Truck Series',
    category: 'Stock Truck',
    apiSeriesCode: 'cw',
  },
};
