// src/hooks/conferences/results/useRecommendationScores.ts

import { useState, useEffect } from 'react';
import { ConferenceListResponse } from '@/src/models/response/conference.list.response';
import { fetchRecommendations } from '@/src/app/apis/conference/getRecommendations';

const SAMPLE_USER_IDS = ['cc9be4e7-f4c7-48b5-a12e-fa4b78234b1b'];

export const useRecommendationScores = (events: ConferenceListResponse | undefined) => {
  const [recommendationScores, setRecommendationScores] = useState<Record<string, number>>({});
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  useEffect(() => {
    const getRecommendations = async () => {
      if (!events || events.payload.length === 0) {
        setRecommendationScores({});
        return;
      }

      setRecommendationLoading(true);
      const randomUserId = SAMPLE_USER_IDS[Math.floor(Math.random() * SAMPLE_USER_IDS.length)];
      const conferenceKeys = events.payload.map(event => `${event.id}`);

      try {
        const scores = await fetchRecommendations({
          user_id: randomUserId,
          conference_ids: conferenceKeys,
        });
        setRecommendationScores(scores);
      } catch (error) {
        // console.error("Failed to fetch recommendations:", error);
        setRecommendationScores({}); // Clear scores on error
      } finally {
        setRecommendationLoading(false);
      }
    };

    getRecommendations();
  }, [events]);

  return { recommendationScores, recommendationLoading };
};