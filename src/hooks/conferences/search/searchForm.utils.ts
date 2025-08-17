// src/hooks/conferences/search/searchForm.utils.ts

// --- Type Definitions ---
export type SearchFieldType = 'keyword' | 'title' | 'acronym';
export type ConferenceType = 'Online' | 'Offline' | 'Hybrid';
export const AVAILABLE_TYPES: ReadonlyArray<ConferenceType> = ['Online', 'Offline', 'Hybrid'];

export interface SearchParams {
  keyword?: string;
  title?: string;
  acronym?: string;
  fromDate?: Date | null;
  toDate?: Date | null;
  location?: string | null;
  type?: ConferenceType | null;
  subFromDate?: Date | null;
  subToDate?: Date | null;
  rank?: string | null;
  source?: string | null;
  publisher?: string | null;
  averageScore?: string | null;
  topics?: string[];
  fieldOfResearch?: string[];
  matchScoreRange?: number[];
}

// --- Helper Functions for Initialization ---

export const getInitialStringParam = (
  searchParams: URLSearchParams,
  paramName: string
): string | null => {
  return searchParams.get(paramName);
};

export const getInitialArrayParam = (
  searchParams: URLSearchParams,
  paramName: string
): string[] => {
  return searchParams.getAll(paramName) || [];
};

export const getInitialLocationFromUrl = (
  searchParams: URLSearchParams,
  availableLocations: string[]
): string | null => {
  const countryParam = searchParams.get('country');
  if (!countryParam) return null;
  return availableLocations.find(
    (loc) => loc.toLowerCase() === countryParam.toLowerCase()
  ) || null;
};

export const getInitialTypeFromUrl = (
  searchParams: URLSearchParams,
  availableTypes: ReadonlyArray<ConferenceType>
): ConferenceType | null => {
  const typeParam = searchParams.get('type');
  if (!typeParam) return null;
  const foundType = availableTypes.find(
    (t) => t.toLowerCase() === typeParam.toLowerCase()
  );
  return foundType ? (foundType as ConferenceType) : null;
};

export const getInitialSearchConfig = (
  searchParams: URLSearchParams
): { type: SearchFieldType; value: string } => {
  const title = searchParams.get('title');
  if (title !== null) return { type: 'title', value: title };
  const acronym = searchParams.get('acronym');
  if (acronym !== null) return { type: 'acronym', value: acronym };
  const keyword = searchParams.get('keyword');
  if (keyword !== null) return { type: 'keyword', value: keyword };
  return { type: 'keyword', value: '' };
};

export const getInitialDateFromUrl = (
  searchParams: URLSearchParams,
  paramName: string
): Date | null => {
  const dateString = searchParams.get(paramName);
  if (dateString && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    try {
      const timestamp = Date.parse(dateString);
      if (!isNaN(timestamp)) return new Date(timestamp);
    } catch (e) {
      // console.error(`Error parsing date parameter "${paramName}":`, e);
    }
  }
  return null;
};

export const shouldShowAdvancedOptionsInitially = (searchParams: URLSearchParams): boolean => {
  const advancedParams = ['submissionDate', 'publisher', 'rank', 'source', 'averageScore', 'topics', 'fieldOfResearch', 'subFromDate', 'subToDate'];
  return advancedParams.some(param => searchParams.has(param));
};

export const adjustToUTCMidnight = (date: Date | null): Date | null => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return new Date(Date.UTC(year, month, day));
};