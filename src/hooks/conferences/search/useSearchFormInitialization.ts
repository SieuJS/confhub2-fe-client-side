// src/hooks/conferences/search/useSearchFormInitialization.ts

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import * as Utils from './searchForm.utils';
import { SearchFieldType, ConferenceType } from './searchForm.utils';

interface UseSearchFormInitializationProps {
  availableLocations: string[];
  availableTypes: ReadonlyArray<ConferenceType>;
}

export const useSearchFormInitialization = ({ availableLocations, availableTypes }: UseSearchFormInitializationProps) => {
  const searchParams = new URLSearchParams(useSearchParams().toString());

  const initialState = useMemo(() => {
    const searchConfig = Utils.getInitialSearchConfig(searchParams);
    return {
      // Basic
      selectSearchType: searchConfig.type,
      confKeyword: searchConfig.value,
      selectedLocation: Utils.getInitialLocationFromUrl(searchParams, availableLocations),
      selectedType: Utils.getInitialTypeFromUrl(searchParams, availableTypes),
      fromDate: Utils.getInitialDateFromUrl(searchParams, 'fromDate'),
      toDate: Utils.getInitialDateFromUrl(searchParams, 'toDate'),
      // Advanced
      isAdvancedOptionsVisible: Utils.shouldShowAdvancedOptionsInitially(searchParams),
      subFromDate: Utils.getInitialDateFromUrl(searchParams, 'subFromDate'),
      subToDate: Utils.getInitialDateFromUrl(searchParams, 'subToDate'),
      selectedRank: Utils.getInitialStringParam(searchParams, 'rank'),
      selectedSource: Utils.getInitialStringParam(searchParams, 'source'),
      selectedPublisher: Utils.getInitialStringParam(searchParams, 'publisher'),
      selectedAverageScore: Utils.getInitialStringParam(searchParams, 'averageScore'),
      selectedTopics: Utils.getInitialArrayParam(searchParams, 'topics'),
      selectedFieldsOfResearch: Utils.getInitialArrayParam(searchParams, 'researchFields'),
    };
  }, [searchParams, availableLocations, availableTypes]);

  return { initialState };
};