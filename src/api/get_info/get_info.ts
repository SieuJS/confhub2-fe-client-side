import { ConferenceResponse } from '../../models/response/conference.response'; 
import { ConferenceListResponse } from '../../models/response/conference.list.response'; 

const API_GET_CONFERENCE_ENDPOINT = 'http://localhost:3000/api/v1/conference';

async function getConference(id: string) : Promise<ConferenceResponse> {
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
            responseData.dates.map((date: any) => {
                date.fromDate = new Date(date.fromDate.slice(0, -1));
                date.toDate = new Date(date.toDate.slice(0, -1));
            }
        )
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

async function getListConference() : Promise<ConferenceListResponse> {
  try {
      const response = await fetch(`${API_GET_CONFERENCE_ENDPOINT}`, {
          method: 'GET', // Specify the method
          headers: {
          'Content-Type': 'application/json', // Set the content type
          },
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
      let responseData = await response.json();
      console.log(responseData.payload)
        if (responseData.payload != null) {
          responseData.payload.map((event: any) => {
              event.dates = event.dates.map( (date : any) => {
                
                  date.fromDate = new Date(date.fromDate.slice(0, -1)),
              date.toDate = new Date(date.toDate.slice(0, -1))
              return date
              })
              
          }
      )
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

export {getConference, getListConference};