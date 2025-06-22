// performance-tests/scenarios/guest.js
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export function guestJourney(data) {
  const FRONTEND_URL = data.FRONTEND_URL;

  group('Guest Journey - Browsing', () => {
    group('Visit Homepage', () => {
      const res = http.get(`${FRONTEND_URL}/en`);
      check(res, { 'Homepage status is 200': (r) => r.status === 200 });
    });
    sleep(2);

    group('Browse Conferences Page', () => {
      const res = http.get(`${FRONTEND_URL}/en/conferences`);
      check(res, { 'Conferences page status is 200': (r) => r.status === 200 });
    });
    sleep(3);

    if (data.conferenceIds && data.conferenceIds.length > 0) {
      group('View Conference Detail', () => {
        const randomConfId = randomItem(data.conferenceIds);
        const res = http.get(`${FRONTEND_URL}/en/conferences/detail?id=${randomConfId}`);
        check(res, { 'Conference detail status is 200': (r) => r.status === 200 });
      });
    }
    sleep(3);

    group('Browse Journals Page', () => {
        const res = http.get(`${FRONTEND_URL}/en/journals`);
        check(res, { 'Journals page status is 200': (r) => r.status === 200 });
    });

    
    sleep(2);

    if (data.journalIds && data.journalIds.length > 0) {
        group('View Journal Detail', () => {
            const randomJournalId = randomItem(data.journalIds);
            const res = http.get(`${FRONTEND_URL}/en/journals/detail?id=${randomJournalId}`);
            check(res, { 'Journal detail status is 200': (r) => r.status === 200 });
        });
    }
  });
}