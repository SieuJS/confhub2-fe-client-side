"use client";
// api/getConferenceDetails/getConferenceDetails.ts
import { ConferenceResponse } from '../../../models/response/conference.response';

const API_GET_CONFERENCE_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_URL; //  3005 for details
const API_SAVE_CONFERENCE_DETAILS_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/conferences/details/save`;


async function getConferenceFromDB(id: string): Promise<ConferenceResponse> {
  try {
    const response = await fetch(`${API_GET_CONFERENCE_ENDPOINT}/api/v1/conference/${id}`, {  // Removed /api/v1/confeence
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


    // Send to backend (3000) for savin// Log save success/already exists message.

    return responseData;

  } catch (error: any) {
    console.error('Error fetching and saving conference details:', error.message);
    if (error instanceof TypeError) {
      console.error('Network error:', error.message);
    }
    throw error; // Re-throw for the caller
  }
}

const API_GET_JSON_CONFERENCE_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/conference`;

async function getConferenceFromJSON(id: string): Promise<ConferenceResponse> {
  try {
    const response = await fetch(`${API_GET_JSON_CONFERENCE_ENDPOINT}/${id}`, {  // Removed /api/v1/conference
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

    return responseData;

  } catch (error: any) {
    console.error('Error fetching and saving conference details:', error.message);
    if (error instanceof TypeError) {
      console.error('Network error:', error.message);
    }
    throw error; // Re-throw for the caller
  }
}

export { getConferenceFromDB, getConferenceFromJSON };