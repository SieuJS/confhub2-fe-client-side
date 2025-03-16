// File ConferenceListResponse:
export type ConferenceListResponse = {
  payload: ConferenceInfo[];
  meta: Meta;
};

export type ConferenceInfo = {
  id: string;
  title: string;
  acronym: string;
  location: Record<string, string>;
  rank: string;
  source: string; // Added source
  year: number;     // Corrected to number
  category: string;
  researchFields: string[];
  topics: string[];
  dates: ImportantDates; // Corrected: Single object, not an array
  link: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  creatorId: string;
  accessType: string;
};

export type ImportantDates = {
  name: string;
  type: string;
  fromDate: string | Date; // Corrected: Allow string or Date.
  toDate: string | Date;     // Corrected: Allow string or Date.
};

export type Meta = {
  curPage: number;    // Corrected to number
  perPage: number;    // Corrected to number
  totalPage: number;  // Corrected to number
  prevPage: string | null; // Corrected to string | null
  nextPage: number | null;  // Corrected to number
  totalItems: number; // Added total items
};