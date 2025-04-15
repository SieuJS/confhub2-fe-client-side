// src/app/api/conference/visualizationApi.ts

import { appConfig } from "@/src/middleware";
import { ConferenceDetailsListResponse } from "@/src/models/response/conference.response";
// Replace with your actual backend URL
const API_BASE_URL = appConfig.NEXT_PUBLIC_DATABASE_URL || "http://confhub.engineer/api/v1";

export async function fetchVisualizationData(): Promise<ConferenceDetailsListResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/conference?mode=detail&perPage=50`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData: ConferenceDetailsListResponse = await response.json();
        return responseData;

    } catch (error: any) {
        console.error('Error fetching conference details:', error.message);
        if (error instanceof TypeError) {
            console.error('Network error:', error.message);
        }
        throw error; // Re-throw for the caller
    }
};