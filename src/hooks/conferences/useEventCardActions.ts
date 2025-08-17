// src/hooks/useEventCardActions.ts

import { useState, useCallback } from 'react';
import { useRouter } from '@/src/navigation';
import { useAuth } from '@/src/contexts/AuthContext';

interface UseEventCardActionsProps {
  eventId: string;
  isFollowing: boolean;
  isAddToCalendar: boolean;
  isBlacklisted: boolean;
  onToggleFollow: (conferenceId: string, currentStatus: boolean) => Promise<void>;
  onToggleCalendar: (conferenceId: string, currentStatus: boolean) => Promise<void>;
}

export const useEventCardActions = ({
  eventId,
  isFollowing,
  isAddToCalendar,
  isBlacklisted,
  onToggleFollow,
  onToggleCalendar,
}: UseEventCardActionsProps) => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [followLoading, setFollowLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);

  const checkLoginAndRedirect = useCallback((callback: () => void) => {
    if (!isLoggedIn) {
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem('returnUrl', currentPath);
      router.push(`/auth/login`);
    } else {
      callback();
    }
  }, [isLoggedIn, router]);

  const handleAction = useCallback(async (
    action: () => Promise<void>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (isBlacklisted) return;
    checkLoginAndRedirect(async () => {
      setLoading(true);
      try {
        await action();
      } catch (error) {
        // console.error('Action failed:', error);
      } finally {
        setLoading(false);
      }
    });
  }, [checkLoginAndRedirect, isBlacklisted]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleAction(() => onToggleFollow(eventId, isFollowing), setFollowLoading);
  }, [handleAction, onToggleFollow, eventId, isFollowing]);

  const handleAddCalendarClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleAction(() => onToggleCalendar(eventId, isAddToCalendar), setCalendarLoading);
  }, [handleAction, onToggleCalendar, eventId, isAddToCalendar]);

  const handleGoToWebsite = useCallback((e: React.MouseEvent<HTMLButtonElement>, url: string | undefined) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isBlacklisted && url) {
      window.open(url, '_blank', 'noopener noreferrer');
    }
  }, [isBlacklisted]);

  return {
    followLoading,
    calendarLoading,
    handleFavoriteClick,
    handleAddCalendarClick,
    handleGoToWebsite,
  };
};