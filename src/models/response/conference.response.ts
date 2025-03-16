// File ConferenceResponse:
export type ConferenceResponse = {
  conference: ConferenceIdentity;
  organization: ConferenceInfo;
  locations: Location;
  dates: ImportantDates[];
  ranks: Rank[];
}

export type ConferenceInfo = {
  year: string;
  accessType: string;
  isAvailable: boolean;
  category: string;
  summerize: string;
  callForPaper: string;
  link: string;
  cfpLink: string;
  impLink: string;
  topics: string[];
};

export type ConferenceIdentity = {
  id: string;
  title: string;
  acronym: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  creatorId: string;
}

export type ImportantDates = {
  fromDate: Date;
  toDate: Date;
  type: string;
  name: string;
  isAvailable: boolean
};

export type Location = {
  address: string;
  cityStateProvince: string;
  country: string;
  continent: string;
  isAvailable: boolean
};

export type Rank = {
  year: string;
  fieldOfResearch : string;
  rank : string
  source : string
}