// src/hooks/conferences/results/useConferenceFiltering.ts

import { useMemo } from 'react';
import { ConferenceListResponse } from '@/src/models/response/conference.list.response';

/**
 * A hook to perform client-side filtering on a list of conferences.
 * @param events The raw list of events from the data fetching hook.
 * @param recommendationScores The scores for the raw events.
 * @param matchScoreRange The [min, max] range (0-100) to filter by.
 * @returns The filtered list of events and the new total item count.
 */
export const useConferenceFiltering = (
  events: ConferenceListResponse | undefined,
  recommendationScores: Record<string, number>,
  matchScoreRange: number[]
) => {
  const filteredResult = useMemo(() => {
    if (!events?.payload) {
      return { filteredEvents: events, filteredTotalItems: events?.meta.totalItems || 0 };
    }

    // Optimization: If the range is the default full range, skip filtering.
    const [minRange, maxRange] = matchScoreRange;
    if (minRange === 0 && maxRange === 100) {
      return { filteredEvents: events, filteredTotalItems: events.meta.totalItems };
    }

    const filteredPayload = events.payload.filter(event => {
      const key = `${event.acronym} - ${event.title}`;
      const scoreOutOf5 = recommendationScores[key] || 0;
      
      // Convert the 0-5 score to a 0-100 percentage to match the slider
      const scorePercentage = scoreOutOf5 * 20;

      return scorePercentage >= minRange && scorePercentage <= maxRange;
    });

    const filteredEvents: ConferenceListResponse = {
      ...events,
      payload: filteredPayload,
      // We update the meta data to reflect the filtered results
      meta: {
        ...events.meta,
        totalItems: filteredPayload.length,
      },
    };
    
    return { filteredEvents, filteredTotalItems: filteredPayload.length };

  }, [events, recommendationScores, matchScoreRange]);

  return filteredResult;
};