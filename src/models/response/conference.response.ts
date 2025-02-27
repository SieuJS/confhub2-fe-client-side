export type ConferenceResponse = {
  id: string;
  name: string;
  acronym: string;
  category: string;
  topics: string[];
  location: string;
  type: string;
  startDate: string;
  endDate: string;
  submissionDate: string;
  cameraReadyDate?: string;
  notificationDate?: string;
  imageUrl: string;
  description: string;
  rank: string;
  sourceYear: string;
  link: string;
};