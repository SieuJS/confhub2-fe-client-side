// api/dataFetcher.ts  (Name the file appropriately - e.g., api/dataFetcher.ts)

// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
import { ConferenceResponse } from '../../models/response/conference.response'; 
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const API_CONFERENCE_ENDPOINT = '/api/crawl-conferences';
const API_JOURNAL_ENDPOINT = 'http://172.188.242.233:3000/crawl-journals';


// --- Reusable function for fetching conferences ---
async function fetchConferences(useClientData: boolean = false, curr: ConferenceResponse): Promise<ConferenceResponse> {
  try {
    const conferences = [ // Moved the data inside the function
        {
          "Title": curr.name,
          "Acronym": curr.acronym,
          "mainLink": curr.link,
          "cfpLink": curr.cfpLink,
          "impLink": curr.impLink,
          "Source": curr.source,
          "Rank": curr.rank,
          "Note": "",
          "DBLP": "",
          "Comments": "",
          "PrimaryFoR": "",
          "Rating": "",
          "Details": ""
        },
        // Add other conferences here as needed for client-side data
        // {
        //     "Title": "Example Conference 2",
        //     "Acronym": "EC2",
        //     "mainLink": "https://example.com/ec2",
        //     "cfpLink": "",
        //     "impLink": "",
        //     "Source": "Example",
        //     "Rank": "B",
        //     "Note": "",
        //     "DBLP": "",
        //     "Comments": "",
        //     "PrimaryFoR": "",
        //     "Rating": "",
        //     "Details": ""
        // },
        // {
        //     "Title": "Example Conference 3",
        //     "Acronym": "EC3",
        //     "mainLink": "https://example.com/ec3",
        //     "cfpLink": "",
        //     "impLink": "",
        //     "Source": "Example",
        //     "Rank": "C",
        //     "Note": "",
        //     "DBLP": "",
        //     "Comments": "",
        //     "PrimaryFoR": "",
        //     "Rating": "",
        //     "Details": ""
        // }
      ];

    let params: URLSearchParams;
    let data = null;

    if (useClientData) {
        params = new URLSearchParams({ dataSource: 'client' });
        data = conferences;
    } else {
        params = new URLSearchParams({ dataSource: 'api' });
    }

    const response = await fetch(`${API_CONFERENCE_ENDPOINT}?${params.toString()}`, {
        method: 'POST', // Specify the method
        headers: {
          'Content-Type': 'application/json', // Set the content type
        },
        body: JSON.stringify(data), //  No body needed for this example, as data is in params.  Add if your API requires it.
      });

    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

     let responseData = await response.json();

    if (responseData.data[0] != null) {
      const conference = responseData.data[0];
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


// --- Reusable function for fetching journals ---
async function fetchJournals(crawlMode: string = 'csv'): Promise<any> { // You'll want a better type than any
  try {
    const params = new URLSearchParams({ CRAWL_MODE: crawlMode });
    const url = `${API_JOURNAL_ENDPOINT}?${params.toString()}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData: any = await response.json(); //  Use the ApiResponse interface

    // Consider creating a separate function to write to the file,
    // so that the fetchJournals function only focuses on fetching.
    // fs.writeFileSync(
    //   path.join(__dirname, 'test_api_log.json'),
    //   JSON.stringify(responseData.data, null, 2),
    //   'utf8'
    // );

    return responseData.data; // Return the data
  } catch (error: any) {
    console.error('Error fetching journals:', error.message);
    if (error instanceof TypeError) {
        console.error('Network error:', error.message);
    }
    throw error; // Re-throw for the caller to handle.
  }
}



export { fetchConferences, fetchJournals }; // Export the functions