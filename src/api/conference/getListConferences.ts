"use_client";
import { ConferenceListResponse } from '../../models/response/conference.list.response';


const API_GET_CONFERENCE_ENDPOINT = 'http://localhost:3000/api/v1'; // Keep this for potential future use


async function getListConference(): Promise<ConferenceListResponse> {
    try {
        const response = await fetch(`${API_GET_CONFERENCE_ENDPOINT}/conferences`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();

        if (responseData.payload != null && Array.isArray(responseData.payload)) {
            responseData.payload.forEach((event: any) => {
                // Check if event.dates exist and its properties before doing anything.
                if (event.dates && event.dates.fromDate && event.dates.toDate) {
                    event.dates.fromDate = new Date(event.dates.fromDate);
                    event.dates.toDate = new Date(event.dates.toDate);
                }
            });
            return responseData as ConferenceListResponse; // More targeted type assertion
        } else {
            throw new Error('Invalid API response format or empty data.');
        }
    } catch (error: any) {
        console.error('Error fetching conferences:', error.message);
        if (error instanceof TypeError) {
            console.error('Network error:', error.message);
        }
        throw error;
    }

}

export { getListConference };