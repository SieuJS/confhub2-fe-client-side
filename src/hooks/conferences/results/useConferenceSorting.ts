// src/hooks/conferences/results/useConferenceSorting.ts

import { useState } from 'react';

export interface SortConfig {
  field: 'default' | 'relevant' | 'submissionDate' | 'conferenceDate' | 'rank' | 'type';
  direction: 'asc' | 'desc'; // direction is ignored for 'relevant'
}

export const useConferenceSorting = () => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'submissionDate', direction: 'desc' });

  const handleSortChange = (newField?: string, newDirection?: 'asc' | 'desc') => {
    setSortConfig(prevConfig => {
      const nextField = (newField as SortConfig['field']) ?? prevConfig.field;
      if (nextField === 'relevant') {
        return { field: 'relevant', direction: 'desc' };
      }
      return {
        field: nextField,
        direction: newDirection ?? prevConfig.direction,
      };
    });
  };

  return { sortConfig, handleSortChange };
};