// src/hooks/conferences/useUserConferenceStatus.ts

import { useState, useEffect, useCallback } from 'react';
import { fetchFollowedConferences, toggleFollowConference } from '@/src/app/apis/user/followApi';
import { fetchCalendarConferences, toggleCalendarConference } from '@/src/app/apis/user/calendarApi';

/**
 * Custom hook to manage the user's followed and calendar conference statuses.
 * It fetches initial data and provides handlers to toggle statuses.
 * @param isLoggedIn - Boolean indicating if the user is currently logged in.
 */
export const useUserConferenceStatus = (isLoggedIn: boolean) => {
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [calendarIds, setCalendarIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setFollowedIds(new Set());
      setCalendarIds(new Set());
      return;
    }

    const fetchUserStatuses = async () => {
      setIsLoading(true);
      try {
        const [followedData, calendarData] = await Promise.all([
          fetchFollowedConferences(),
          fetchCalendarConferences()
        ]);
        setFollowedIds(new Set(followedData.map(conf => conf.id)));
        setCalendarIds(new Set(calendarData.map(conf => conf.id)));
      } catch (err) {
        // console.error('Failed to fetch user conference statuses:', err);
        // Reset on error to avoid inconsistent state
        setFollowedIds(new Set());
        setCalendarIds(new Set());
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStatuses();
  }, [isLoggedIn]);

  const handleToggleFollow = useCallback(
    async (conferenceId: string, currentStatus: boolean) => {
      // Optimistically update UI
      setFollowedIds(prevIds => {
        const newIds = new Set(prevIds);
        if (currentStatus) {
          newIds.delete(conferenceId);
        } else {
          newIds.add(conferenceId);
        }
        return newIds;
      });
      // Perform API call
      try {
        await toggleFollowConference(conferenceId, currentStatus);
      } catch (error) {
        // Revert on error
        setFollowedIds(prevIds => {
          const newIds = new Set(prevIds);
          if (currentStatus) {
            newIds.add(conferenceId);
          } else {
            newIds.delete(conferenceId);
          }
          return newIds;
        });
      }
    },
    []
  );

  const handleToggleCalendar = useCallback(
    async (conferenceId: string, currentStatus: boolean) => {
      // Optimistically update UI
      setCalendarIds(prevIds => {
        const newIds = new Set(prevIds);
        if (currentStatus) {
          newIds.delete(conferenceId);
        } else {
          newIds.add(conferenceId);
        }
        return newIds;
      });
      // Perform API call
      try {
        await toggleCalendarConference(conferenceId, currentStatus);
      } catch (error) {
        // Revert on error
        setCalendarIds(prevIds => {
          const newIds = new Set(prevIds);
          if (currentStatus) {
            newIds.add(conferenceId);
          } else {
            newIds.delete(conferenceId);
          }
          return newIds;
        });
      }
    },
    []
  );

  return {
    followedIds,
    calendarIds,
    handleToggleFollow,
    handleToggleCalendar,
    isLoadingStatus: isLoading,
  };
};