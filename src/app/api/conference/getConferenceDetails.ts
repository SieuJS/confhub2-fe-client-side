"use client";
// api/getConferenceDetails/getConferenceDetails.ts
import { ConferenceResponse } from '../../../models/response/conference.response';

const API_GET_CONFERENCE_ENDPOINT = 'http://178.128.28.130:3000/api/v1/conference'; //  3005 for details
const API_SAVE_CONFERENCE_DETAILS_ENDPOINT = 'http://localhost:3000/api/v1/conferences/details/save'; // Port 3000 (your backend), new endpoint


async function getConference(id: string): Promise<ConferenceResponse> {
  try {
    const response = await fetch(`${API_GET_CONFERENCE_ENDPOINT}/${id}`, {  // Removed /api/v1/conference
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData: ConferenceResponse = await response.json();

    // Date handling (important: check for null/undefined for each date)
    if (responseData.dates) {
      responseData.dates = responseData.dates.map(date => {
          if (date && date.fromDate) {
              date.fromDate = new Date(date.fromDate).toISOString(); //convert to ISO string before passing in request body
          }
          if(date && date.toDate) {
              date.toDate = new Date(date.toDate).toISOString(); //convert to ISO string before passing in request body
          }
          return date;
      })
    }


    // Send to backend (3000) for saving
    const saveResponse = await fetch(API_SAVE_CONFERENCE_DETAILS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responseData), // Send the entire ConferenceResponse
    });

    if (!saveResponse.ok) {
      const errorText = await saveResponse.text(); // Get error message as text
      throw new Error(`Save operation failed! Status: ${saveResponse.status}, Message: ${errorText}`);
    }

    const saveResult = await saveResponse.json();
    console.log(saveResult.message);  // Log save success/already exists message.

    return responseData;

  } catch (error: any) {
    console.error('Error fetching and saving conference details:', error.message);
    if (error instanceof TypeError) {
      console.error('Network error:', error.message);
    }
    throw error; // Re-throw for the caller
  }
}

export { getConference };