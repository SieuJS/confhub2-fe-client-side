// src/app/api/visualization/visualization.ts

import { appConfig } from "@/src/middleware";
import { ConferenceDetailsListResponse } from "@/src/models/response/conference.response";
// Replace with your actual backend URL
const API_BASE_URL = appConfig.NEXT_PUBLIC_DATABASE_URL || 'http://localhost:3000';

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