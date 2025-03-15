// conference.response.ts

export interface ConferenceLocation {
  cityStateProvince: string;
  country: string;
  address: string;
  continent: string;
}

export interface ConferenceDate {
  name: string;
  type: string; // Consider using an enum if the possible values are limited
  fromDate: string; // ISO 8601 date string
  toDate: string;   // ISO 8601 date string
}

export interface Conference {
  id: string;
  title: string;
  acronym: string;
  location: ConferenceLocation;
  rank: string;
  source: string;
  year: number;
  researchFields: string[];
  topics: string[];
  dates: ConferenceDate[];
  link: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  creatorId: string;
  accessType: string; // Consider using an enum if the possible values are limited
}

export interface ConferenceMeta {
  curPage: number;
  perPage: number;
  totalPage: number;
  prevPage: number | null;
  nextPage: number | null;
}

export interface ConferenceResponse {
  payload: Conference[];
  meta: ConferenceMeta;
}