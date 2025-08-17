// src/components/conferences/eventCard/EventCardSubmissionDate.tsx
import React from 'react';
import { useSubmissionDate } from '@/src/hooks/conferences/useSubmissionDate';
import { ConferenceInfo } from '../../../../models/response/conference.list.response';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Clock } from 'lucide-react';

interface EventCardSubmissionDateProps {
  submissionDates: ConferenceInfo['submissionDates'];
}

export const EventCardSubmissionDate: React.FC<EventCardSubmissionDateProps> = ({ submissionDates }) => {
  const { hasUpcomingSubmission, submissionDateName, formattedSubmissionDate, submissionDateTooltipContent } = useSubmissionDate(submissionDates);

  if (!hasUpcomingSubmission) {
    return null;
  }

  return (
    <div className="mb-3 flex items-center text-xs transition duration-300">
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <div className="flex cursor-help items-center">
              <Clock className="mr-1.5 flex-shrink-0 text-blue-600" size={16} strokeWidth={1.5} />
              <div className="flex flex-col text-left">
                <span className="font-medium text-blue-700">{submissionDateName}</span>
                <span className="text-gray-600">{formattedSubmissionDate}</span>
              </div>
            </div>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="max-w-xs rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-lg" sideOffset={5}>
              <div className="whitespace-pre-line">{submissionDateTooltipContent}</div>
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
};