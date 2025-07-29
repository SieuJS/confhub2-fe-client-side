// src/app/api/visualization/visualization.ts

import { appConfig } from "@/src/middleware";
// Replace with your actual backend URL
const API_BASE_URL = appConfig.NEXT_PUBLIC_DATABASE_URL || 'http://localhost:3000';


export type ConferenceDetailsListResponse = {
  payload: ConferenceDetail[];
  meta: Meta;
};


export type Meta = {
  curPage: number;
  perPage: number;
  totalPage: number;
  prevPage: number | null;
  nextPage: number | null;
  totalItems: number;
};

// --- Type Definitions for better type safety and readability ---

interface Location {
    address: string;
    cityStateProvince: string;
    country: string;
    continent: string;
}

interface DateEntry {
    fromDate: string | null;
    toDate: string | null;
    type: string;
    name: string;
}

interface Rank {
    year: number;
    rank: string;
    source: string;
    researchField: string;
}

// Represents the actual data for an organization, whether nested or not
interface OrgData {
    year: number | null;
    accessType: string;
    summary: string;
    callForPaper: string;
    link: string;
    pulisher: string; // Matches the typo in the provided JSON
    cfpLink: string;
    locations: Location[];
    topics: string[];
    dates: DateEntry[];
    impLink?: string; // Optional important dates link
}

// Represents an item in the 'organizations' array, which can have a nested 'org' key
type Organization = { org: OrgData } | OrgData;

interface ConferenceDetail {
    id: string;
    title: string;
    acronym: string;
    ranks: Rank[];
    organizations: Organization[];
    // Other top-level fields
    [key: string]: any;
}


export async function fetchVisualizationData(): Promise<ConferenceDetailsListResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/conference?mode=detail&perPage=10000`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData: ConferenceDetailsListResponse = await response.json();
        // console.log(responseData.payload.slice(0,2))
        return responseData;

    } catch (error: any) {
        // console.error('Error fetching conference details:', error.message);
        if (error instanceof TypeError) {
            // console.error('Network error:', error.message);
        }
        throw error; // Re-throw for the caller
    }
};