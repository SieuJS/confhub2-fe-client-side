// src/hooks/useSubmissionDate.ts

import { useCallback, useMemo } from 'react';
import { formatDateRange } from '@/src/app/[locale]/conferences/utils/dateUtils'
import { ConferenceInfo } from '../../models/response/conference.list.response';

type SubmissionDate = ConferenceInfo['submissionDates'][0];

export const useSubmissionDate = (submissionDates: SubmissionDate[] | undefined) => {
  const getEarliestSubmissionDate = useCallback((): SubmissionDate | null => {
    if (!submissionDates || submissionDates.length === 0) {
      return null;
    }
    const now = new Date();
    const validDates = submissionDates
      .filter(subDate => {
        const date = new Date(subDate.fromDate);
        return !isNaN(date.getTime()) && date >= now; // Only future dates
      })
      .sort((a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime());

    return validDates.length > 0 ? validDates[0] : null;
  }, [submissionDates]);

  const earliestSubmission = useMemo(() => getEarliestSubmissionDate(), [getEarliestSubmissionDate]);

  const formattedSubmissionDate = useMemo((): string => {
    if (!earliestSubmission) return 'No upcoming deadlines';
    return formatDateRange(earliestSubmission.fromDate, earliestSubmission.toDate);
  }, [earliestSubmission]);

  const submissionDateTooltipContent = useMemo((): string => {
    if (!submissionDates || submissionDates.length === 0) return 'No submission dates available';
    const now = new Date();
    const upcomingDates = submissionDates
      .filter(subDate => new Date(subDate.fromDate) >= now)
      .sort((a, b) => new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime());

    if (upcomingDates.length === 0) return 'No upcoming submission deadlines';

    return upcomingDates
      .map(subDate => `${subDate.name}: ${formatDateRange(subDate.fromDate, subDate.toDate)}`)
      .join('\n');
  }, [submissionDates]);

  return {
    hasUpcomingSubmission: !!earliestSubmission,
    submissionDateName: earliestSubmission?.name || '',
    formattedSubmissionDate,
    submissionDateTooltipContent,
  };
};