// frontend/getListConferences.ts
"use_client";
import { ConferenceListResponse } from '../../models/response/conference.list.response';

const API_GET_CONFERENCE_ENDPOINT = 'http://localhost:3005/api/v1'; // Port 3005 (original)

async function getListConference(): Promise<ConferenceListResponse> {
  try {
    // 1. Fetch from the original endpoint (3005)
    const response = await fetch(`${API_GET_CONFERENCE_ENDPOINT}/conference`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('responseData', responseData);

    if (responseData.payload != null && Array.isArray(responseData.payload)) {
        responseData.payload.forEach((event: any) => {
            if (event.dates && event.dates.fromDate && event.dates.toDate) {
                event.dates.fromDate = new Date(event.dates.fromDate);
                event.dates.toDate = new Date(event.dates.toDate);
            }
        });

      

      return responseData as ConferenceListResponse; // Return the original data
    } else {
      throw new Error('Invalid API response format or empty data.');
    }
  } catch (error: any) {
    console.error('Error fetching or saving conferences:', error.message);
    if (error instanceof TypeError) {
      console.error('Network error:', error.message);
    }
    throw error; // Re-throw the error to be handled by the caller
  }
}

export { getListConference };

