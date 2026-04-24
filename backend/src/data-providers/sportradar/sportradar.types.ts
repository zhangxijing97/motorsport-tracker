export type SportradarStage = {
  id: string;
  description?: string;
  type?: string;
  status?: string;
  scheduled?: string;
  scheduled_end?: string;
  laps?: number;
  laps_completed?: number;
  venue?: {
    id?: string;
    name?: string;
    city?: string;
    city_name?: string;
    country?: string;
    country_name?: string;
    country_code?: string;
    timezone?: string;
  };
  stages?: SportradarStage[];
  competitors?: SportradarCompetitor[];
};

export type SportradarCompetitor = {
  id: string;
  name: string;
  nationality?: string;
  country_code?: string;
  team?: {
    id?: string;
    name?: string;
  };
  result?: {
    points?: number;
    position?: number;
    car_number?: number;
  };
};

export type SportradarSeasonsResponse = {
  stages?: SportradarStage[];
};

export type SportradarSummaryResponse = {
  generated_at?: string;
  schema?: string;
  stage?: SportradarStage;
};
