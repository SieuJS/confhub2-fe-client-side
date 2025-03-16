// File ConferenceListResponse:
export type ConferenceListResponse = {
    payload: ConferenceInfo[];
    meta: Meta;
  }
  
  export type ConferenceInfo = {
    id: string;
    title: string;
    acronym: string;
    location: Record<string, string>;
    rank: string;
    year: string;
    category: string;
    researchFields: string[];
    topics: string[];
    dates: ImportantDates[];
    link: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    creatorId: string;
    accessType: string;
  };
  
  export type ImportantDates = {
    name: string;
    type: string;
    fromDate: Date;
    toDate: Date;
  };
  
  export type Meta = {
    curPage: string;
    perPage: string;
    totalPage: string;
    prevPage: string;
    nextPage: string
  };