// src/hooks/conferences/useAdvancedSearchData.ts

import { useState, useEffect } from 'react';
import { appConfig } from '@/src/middleware';

/**
 * Custom hook to fetch data needed for the advanced search section,
 * such as topics and sources.
 * @param isVisible - A boolean to trigger the data fetching when the section becomes visible.
 */
export const useAdvancedSearchData = (isVisible: boolean) => {
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);

  // Fetch Topics
  useEffect(() => {
    if (isVisible && availableTopics.length === 0 && !topicsLoading) {
      const fetchTopics = async () => {
        setTopicsLoading(true);
        try {
          const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/conference-organization/topics`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data: string[] = await response.json();
          setAvailableTopics(data);
        } catch (error) {
          // console.error('Could not fetch topics:', error);
        } finally {
          setTopicsLoading(false);
        }
      };
      fetchTopics();
    }
  }, [isVisible, availableTopics.length, topicsLoading]);

  // Fetch Sources
  useEffect(() => {
    if (isVisible && availableSources.length === 0 && !sourcesLoading) {
      const fetchSources = async () => {
        setSourcesLoading(true);
        try {
          const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/admin/conferences/filter-options/sources`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data: string[] = await response.json();
          const filteredSources = data.filter(source => source && source.trim().toLowerCase() !== 'unknown');
          setAvailableSources(filteredSources);
        } catch (error) {
          // console.error('Could not fetch sources:', error);
        } finally {
          setSourcesLoading(false);
        }
      };
      fetchSources();
    }
  }, [isVisible, availableSources.length, sourcesLoading]);

  return {
    availableTopics,
    topicsLoading,
    availableSources,
    sourcesLoading,
  };
};