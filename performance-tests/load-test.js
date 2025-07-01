// performance-tests/load-test.js
import http from 'k6/http';
import { guestJourney } from './scenarios/guest.js';
import { registeredUserJourney } from './scenarios/registered.js';

export const options = {
  thresholds: {
    'http_req_failed': ['rate<0.05'],
    'http_req_duration': ['p(95)<2000'],
    'http_req_duration{scenario:guest_journey}': ['p(95)<1500'],
    'http_req_duration{scenario:registered_journey}': ['p(95)<2500'],
  },
  scenarios: {
    guest: {
      executor: 'ramping-vus',
      exec: 'runGuestJourney',
      stages: [
        // ĐIỀU CHỈNH: Tăng tải lên 150 VUs
        { duration: '1m', target: 150 },
        { duration: '3m', target: 150 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '30s',
      tags: { scenario: 'guest_journey' },
    },
    // registered: {
    //   executor: 'ramping-vus',
    //   exec: 'runRegisteredUserJourney',
    //   startTime: '30s',
    //   stages: [
    //     // ĐIỀU CHỈNH: Tăng tải lên 75 VUs
    //     { duration: '1m', target: 75 },
    //     { duration: '3m', target: 75 },
    //     { duration: '30s', target: 0 },
    //   ],
    //   gracefulRampDown: '30s',
    //   tags: { scenario: 'registered_journey' },
    // },
  },
};

// --- 2. Chuẩn bị dữ liệu ---
const FRONTEND_URL = 'https://confhub.ddns.net';
const API_URL = 'https://confhub.ddns.net/database';

export function setup() {
  console.log('Setting up the test by fetching initial data...');
  let conferenceIds = [];
  let journalIds = [];

  try {
    // Lấy 100 conference và 100 journal để có nhiều dữ liệu test hơn
    const confRes = http.get(`${API_URL}/api/v1/conference?perPage=200&page=2`);
    if (confRes.status === 200) {
      const conferences = confRes.json('payload');
      if (conferences && Array.isArray(conferences)) {
        conferenceIds = conferences.map(c => c.id);
        console.log(`Successfully fetched ${conferenceIds.length} conference IDs.`);
      }
    } else {
      console.error(`Failed to fetch conference IDs, status: ${confRes.status}, body: ${confRes.body}`);
    }

    // Lưu ý: Sửa lại endpoint là /journals (số nhiều) như file của bạn
    const journalRes = http.get(`${API_URL}/api/v1/journals?limit=28`);
    if (journalRes.status === 200) {
      const journals = journalRes.json('data');
      if (journals && Array.isArray(journals)) {
        journalIds = journals.map(j => j.id);
        console.log(`Successfully fetched ${journalIds.length} journal IDs.`);
      }
    } else {
      console.error(`Failed to fetch journal IDs, status: ${journalRes.status}, body: ${journalRes.body}`);
    }
  } catch (e) {
    console.error('An error occurred during setup:', e);
  }

  if (conferenceIds.length === 0 || journalIds.length === 0) {
      throw new Error("Could not fetch initial data (conference/journal IDs). Aborting test.");
  }

  return {
    conferenceIds: conferenceIds,
    journalIds: journalIds,
    FRONTEND_URL: FRONTEND_URL,
    API_URL: API_URL,
  };
}

// --- 3. Các hàm thực thi ---
export function runGuestJourney(data) {
  guestJourney(data);
}

// export function runRegisteredUserJourney(data) {
//   registeredUserJourney(data);
// }