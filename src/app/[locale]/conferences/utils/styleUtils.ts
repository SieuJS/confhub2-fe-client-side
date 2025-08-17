// src/utils/styleUtils.ts

/**
 * Returns Tailwind CSS classes for a given conference rank.
 */
export const getRankColor = (rank?: string): string => {
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
      return 'bg-gray-100 text-gray-60 border border-gray-300';
  }
};

/**
 * Returns Tailwind CSS classes for a given conference access type.
 */
export const getAccessTypeColor = (accessType?: string): string => {
  accessType = accessType?.toUpperCase();
  switch (accessType) {
    case 'ONLINE':
      return 'bg-green-100 text-green-700 border border-green-300';
    case 'OFFLINE':
      return 'bg-red-100 text-red-700 border border-red-300';
    case 'HYBRID':
      return 'bg-blue-100 text-blue-700 border border-blue-300';
    default:
      return 'bg-gray-100 text-gray-60 border border-gray-300';
  }
};

/**
 * Returns Tailwind CSS classes for a given recommendation match score.
 */
export const getMatchScoreColor = (score?: number): string => {
    if (score === undefined) {
      return 'bg-gray-100 text-gray-600 border border-gray-300';
    }
    const percentage = (score / 5) * 100;
    if (percentage >= 80) {
      return 'bg-emerald-100 text-emerald-700 border border-emerald-300'; // Excellent
    }
    if (percentage >= 60) {
      return 'bg-sky-100 text-sky-700 border border-sky-300'; // Good
    }
    if (percentage >= 40) {
      return 'bg-amber-100 text-amber-700 border border-amber-300'; // Moderate
    }
    return 'bg-gray-100 text-gray-600 border border-gray-300'; // Low
};