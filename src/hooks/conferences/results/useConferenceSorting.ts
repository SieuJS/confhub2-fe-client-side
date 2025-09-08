// src/hooks/conferences/results/useConferenceSorting.ts

import { useState } from 'react';

export interface SortConfig {
  field: 'default' | 'match' | 'submissionDate';
  direction: 'asc' | 'desc'; // direction is ignored for 'match'
}

export const useConferenceSorting = () => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'submissionDate', direction: 'desc' });

  const handleSortChange = (newField?: string, newDirection?: 'asc' | 'desc') => {
    setSortConfig(prevConfig => {
      const nextField = (newField as SortConfig['field']) ?? prevConfig.field;
      if (nextField === 'match') {
        return { field: 'match', direction: 'desc' };
      }
      return {
        field: nextField,
        direction: newDirection ?? prevConfig.direction,
      };
    });
  };

  return { sortConfig, handleSortChange };
};