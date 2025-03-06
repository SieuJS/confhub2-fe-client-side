// File ConferenceResponse:
export type ConferenceResponse = {
  id?: string; // Optional, if you still need it
  name: string;
  acronym: string;
  rank?: string; // Make optional as it can be empty
  rating?: string;
  dblp?: string;
  note?: string;
  comments?: string;
  fieldOfResearch?: string;
  source?: string;
  link?: string;  //  Optional, as it can be empty.
  cfpLink?: string;
  impLink?: string;
  information?: string; // Keep as optional if it might not always be present
  conferenceDates?: string; //  Single string, not an array
  year?: string;
  location?: string;
  cityStateProvince?: string;
  country?: string;
  continent?: string;
  type?: string;
  submissionDate?: Record<string, string>;  //  Object with string keys and string values
  notificationDate?: Record<string, string>; // Object with string keys and string values
  cameraReadyDate?: Record<string, string>;  // Object
  registrationDate?: Record<string, string>; // Object
  otherDate?: Record<string, string>;      // Object
  topics?: string; // Single string, comma-separated
  publisher?: string;
  summary?: string;
  callForPapers?: string;
  description?: string; // Add the description.
  likeCount?: number; //Optional
  followCount?: number; //Optional

};

// ConferenceDates is NO LONGER NEEDED.  Remove it.
// export type ConferenceDates = { ... };