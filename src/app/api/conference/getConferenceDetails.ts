"use_client";
// api/get_info/get_info.ts
import { ConferenceResponse } from '../../models/response/conference.response';

const API_GET_CONFERENCE_ENDPOINT = 'http://178.128.28.130:3000/api/v1'; // Keep this for potential future use
const API_SAVE_CONFERENCE_ENDPOINT = 'http://localhost:3000/api/v1/conferences/save'; // Port 3000 (your backend)


async function getConference(id: string): Promise<ConferenceResponse> {
  try {
    const response = await fetch(`${API_GET_CONFERENCE_ENDPOINT}/conference/${id}`, {
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
      console.log(conference)

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

export { getConference };