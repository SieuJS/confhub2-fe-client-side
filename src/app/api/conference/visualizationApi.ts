// src/app/api/conference/visualizationApi.ts

import { ConferenceResponse } from "@/src/models/response/conference.response";
// Replace with your actual backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchVisualizationData(): Promise<ConferenceResponse[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/visualization/conference`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData: ConferenceResponse[] = await response.json();
        console.log(responseData)
        return responseData;

    } catch (error: any) {
        console.error('Error fetching and saving conference details:', error.message);
        if (error instanceof TypeError) {
            console.error('Network error:', error.message);
        }
        throw error; // Re-throw for the caller
    }
};