// src/utils/dateUtils.ts

/**
 * Formats a date string into "Mon Day, Year" format.
 * Returns 'TBD' if the date is not provided.
 */
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'TBD';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return 'Invalid Date';
  }
};

/**
 * Formats a date range. If from and to dates are the same, it returns a single date.
 * Returns 'TBD' if dates are not provided.
 */
export const formatDateRange = (
  fromDate: string | undefined,
  toDate: string | undefined
): string => {
  if (!fromDate || !toDate) return 'TBD';
  const formattedFromDate = formatDate(fromDate);
  const formattedToDate = formatDate(toDate);
  if (
    formattedFromDate === 'Invalid Date' ||
    formattedToDate === 'Invalid Date'
  ) {
    return 'Invalid Date Range';
  }
  if (formattedFromDate === formattedToDate) {
    return formattedFromDate;
  }
  return `${formattedFromDate} - ${formattedToDate}`;
};