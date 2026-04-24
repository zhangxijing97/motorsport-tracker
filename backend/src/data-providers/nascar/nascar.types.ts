// export type NascarSeriesListItem = {
//   id: string;
//   alias: string;
//   name: string;
//   seasons: NascarSeason[];
// };

// export type NascarSeason = {
//   id: string;
//   year: number;
//   start_date: string;
//   end_date: string;
//   status: string;
// };

// export type NascarScheduleResponse = {
//   id: string;
//   alias: string;
//   name: string;
//   season: {
//     id: string;
//     year: number;
//     events?: NascarEvent[];
//   };
// };

// export type NascarEvent = {
//   id: string;
//   name: string;
//   start_date?: string;
//   track?: {
//     id?: string;
//     name?: string;
//     market?: string;
//     city?: string;
//     state?: string;
//     country?: string;
//   };
//   races?: NascarRace[];
// };

// export type NascarRace = {
//   id: string;
//   name: string;
//   status?: string;
//   scheduled?: string;
//   distance?: number | string;
//   laps?: number | string;
//   stage_count?: number | string;
//   heat_race?: boolean | string;
//   chase_race?: boolean | string;
//   award_pole?: boolean | string;
//   qualifying?: {
//     start_time?: string;
//     status?: string;
//   };
//   practice?: {
//     start_time?: string;
//     status?: string;
//     sequence?: number;
//   };
// };


export type NascarSeriesListItem = {
  id: string;
  alias: string;
  name: string;
  seasons: NascarSeason[];
};

export type NascarSeason = {
  id: string;
  year: number;
  start_date: string;
  end_date: string;
  status: string;
};

export type NascarScheduleResponse = {
  series: {
    id: string;
    alias: string;
    name: string;
  };
  season: {
    id: string;
    year: number;
  };
  events?: NascarEvent[];
};

export type NascarEvent = {
  id: string;
  name: string;
  start_date?: string;
  track?: {
    id?: string;
    name?: string;
    market?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  races?: NascarRace[];
};

export type NascarRace = {
  id: string;
  name: string;
  status?: string;
  scheduled?: string;
  distance?: number | string;
  laps?: number | string;
  stage_count?: number | string;
  heat_race?: boolean | string;
  chase_race?: boolean | string;
  award_pole?: boolean | string;
  qualifying?: {
    start_time?: string;
    status?: string;
  };
  practice?: {
    start_time?: string;
    status?: string;
    sequence?: number;
  };
};
