export type ConferenceListResponse = {
  payload: ConferenceInfo[];
  meta: Meta;
};

export type ConferenceInfo = {
  id: string;
  title: string;
  acronym: string;
  location: Location;  // Re-use the Location type
  year: number;
  rankSourceFoRData: RankSourceFoRData; // Re-use
  topics: string[];
  dates: ImportantDates; // Re-use
  link: string;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  accessType: string;
};
export type Location = {
  cityStateProvince: string;
  country: string;
  address: string;
  continent: string;
};

export type RankSourceFoRData = {
  rank: string;
  source: string;
  researchFields: string;  // Changed to string, assuming it's a single field or comma-separated.  If it *must* be an array, change back to string[].
};

export type ImportantDates = {
  name: string;
  type: string;
  fromDate: string;  // Keep as string (ISO 8601)
  toDate: string;    // Keep as string (ISO 8601)
};

export type Meta = {
  curPage: number;
  perPage: number;
  totalPage: number;
  prevPage: number | null; // Changed to number | null
  nextPage: number | null;
  totalItems: number;
};