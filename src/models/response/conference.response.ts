export type ConferenceResponse = {
  id: string;
  name: string;
  acronym: string;
  category: string;
  topics: string[];
  location: string;
  type: string;
  conferenceDates: ConferenceDates[];
  imageUrl: string;
  description: string;
  rank: string;
  sourceYear: string;
  link: string;
  likeCount: number;
  followCount: number;
};

export type ConferenceDates = {
  startDate: string;
  endDate: string;
  dateName : string ; 
}; 