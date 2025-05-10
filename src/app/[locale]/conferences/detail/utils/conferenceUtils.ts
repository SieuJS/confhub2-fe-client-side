// src/utils/conferenceUtils.ts
import { ImportantDate, Feedback } from '@/src/models/response/conference.response'; // Giả sử Feedback được export từ đây hoặc models

export const getAccessTypeColor = (accessType?: string): string => {
  switch (accessType) {
    case 'Online':
      return 'bg-green-100 text-green-700 border border-green-300';
    case 'Offline':
      return 'bg-red-100 text-red-700 border border-red-300';
    case 'Hybrid':
      return 'bg-blue-100 text-blue-700 border border-blue-300';
    default:
      return 'bg-gray-100 text-gray-600 border border-gray-300';
  }
};

export const getRankColor = (rank?: string) => {
  rank = rank?.toUpperCase();
  switch (rank) {
    case 'A*':
      return 'bg-amber-100 text-amber-700 border border-amber-300';
    case 'A':
      return 'bg-green-100 text-green-700 border border-green-300';
    case 'B':
      return 'bg-sky-100 text-sky-700 border border-sky-300';
    case 'C':
      return 'bg-orange-100 text-orange-700 border border-orange-300';
    default:
      return 'bg-gray-100 text-gray-600 border border-gray-300';
  }
};

export const transformDates = (dates: ImportantDate[] | null | undefined) => {
  if (!dates) {
    return undefined;
  }
  return dates
    .map(date => {
      if (!date) return undefined;
      return {
        type: date.type || '',
        fromDate: date.fromDate || undefined,
        toDate: date.toDate || undefined,
      };
    })
    .filter(date => date !== undefined) as { type: string; fromDate?: string; toDate?: string }[]; // Cast for stricter typing
};

// Assuming Feedback type is correctly defined and imported
// If Feedback is defined in page.tsx, you might need to move its definition to a shared types file or import it from conference.response
// For now, let's assume it's imported from conference.response or a similar shared location.
// type Feedback = { star: number | null, /* ... other properties */ };

export const calculateOverallRating = (feedbacks: Feedback[] | null | undefined): number => {
  if (!feedbacks || feedbacks.length === 0) return 0;
  const totalStars = feedbacks.reduce(
    (sum: number, feedback: Feedback) => sum + (feedback.star ?? 0),
    0
  );
  return feedbacks.length > 0 ? totalStars / feedbacks.length : 0;
};