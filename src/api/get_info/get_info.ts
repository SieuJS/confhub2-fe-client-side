// api/get_info/get_info.ts
import { ConferenceResponse } from '../../models/response/conference.response';
import { ConferenceListResponse } from '../../models/response/conference.list.response';

const API_GET_CONFERENCE_ENDPOINT = 'http://localhost:3000/api/v1/conference';

async function getConference(id: string): Promise<ConferenceResponse> {
  // ... (your getConference function remains largely the same, adjust date parsing if needed)
    try {
        const response = await fetch(`${API_GET_CONFERENCE_ENDPOINT}/${id}`, {
            method: 'GET', // Specify the method
            headers: {
            'Content-Type': 'application/json', // Set the content type
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
      
        let responseData = await response.json();
        if (responseData != null) {
            // Check if responseData.dates exist and its properties as well before doing anything.
            if (responseData.dates && responseData.dates.fromDate && responseData.dates.toDate) {
                responseData.dates.fromDate = new Date(responseData.dates.fromDate);
                responseData.dates.toDate = new Date(responseData.dates.toDate);
            }
            const conference = responseData;
            return conference; // Return an object with named properties
          } else {
            throw new Error('Invalid API response format or empty data.');
          }
        } catch (error: any) {
          console.error('Error fetching conferences:', error.message);
          if (error instanceof TypeError) {
            console.error('Network error:', error.message);
          }
          throw error; // Re-throw the error so the caller can handle it
    }
}

async function getListConference(): Promise<ConferenceListResponse> {
  try {
    const response = await fetch(`${API_GET_CONFERENCE_ENDPOINT}`, {
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
            if(event.dates && event.dates.fromDate && event.dates.toDate) {
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

export { getConference, getListConference };