// src/app/api/conference/getConferenceDetails.ts
import { appConfig } from '@/src/middleware';
import { ConferenceResponse} from '../../../models/response/conference.response';
const API_GET_CONFERENCE_ENDPOINT = appConfig.NEXT_PUBLIC_DATABASE_URL || "http://confhub.engineer"; //  3005 for details


async function getConferenceFromDB(id: string): Promise<ConferenceResponse> {
  let responseData: any;
  try {
    const response = await fetch(`${API_GET_CONFERENCE_ENDPOINT}/api/v1/conference/${id}`, {  // Removed /api/v1/confeence
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error fetching conference! Status: ${response.status}, Body: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData: ConferenceResponse = await response.json();
    return responseData; // Trả về dữ liệu đã gửi đi

  } catch (error: any) {
    console.error('--- Error in getConferenceFromDB ---');
    console.error('Error message:', error.message);
    if (error.cause) { console.error('Error cause:', error.cause); }
    console.error('Stack trace:', error.stack);
    if (responseData) { console.error('Response data received before error:', responseData); }
    console.error('------------------------------------');
    throw error;
  }
}


export { getConferenceFromDB };