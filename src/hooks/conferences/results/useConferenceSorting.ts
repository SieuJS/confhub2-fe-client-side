// src/hooks/conferences/results/useConferenceSorting.ts

import { useState, useMemo } from 'react'; // <--- Import useMemo
import { ConferenceListResponse } from '@/src/models/response/conference.list.response';

export interface SortConfig {
  field: 'default' | 'match';
  direction: 'asc' | 'desc';
}

export const useConferenceSorting = (
  events: ConferenceListResponse | undefined,
  recommendationScores: Record<string, number>
) => {
  // This state is for user interaction and is correct.
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'default', direction: 'desc' });

  // --- REFACTORED PART ---
  // Instead of useEffect + useState, we calculate sortedEvents directly with useMemo.
  // This memoizes the result, returning the same object reference if the inputs haven't changed.
  const sortedEvents = useMemo(() => {
    if (!events?.payload) {
      return events;
    }

    // Create a mutable copy to sort
    let newSortedPayload = [...events.payload];

    if (sortConfig.field === 'match') {
      newSortedPayload.sort((a, b) => {
        const keyA = `${a.acronym} - ${a.title}`;
        const keyB = `${b.acronym} - ${b.title}`;
        const scoreA = recommendationScores[keyA] || 0;
        const scoreB = recommendationScores[keyB] || 0;
        return sortConfig.direction === 'desc' ? scoreB - scoreA : scoreA - scoreB;
      });
    }
    // If sortConfig.field is 'default', we don't sort and use the payload as is.

    // Return a new object with the sorted payload
    return { ...events, payload: newSortedPayload };

  }, [sortConfig, events, recommendationScores]); // Dependencies are correct

  const handleSortChange = (newField?: string, newDirection?: 'asc' | 'desc') => {
    setSortConfig(prevConfig => ({
      field: (newField as SortConfig['field']) ?? prevConfig.field,
      direction: newDirection ?? prevConfig.direction,
    }));
  };

  return { sortedEvents, sortConfig, handleSortChange };
};