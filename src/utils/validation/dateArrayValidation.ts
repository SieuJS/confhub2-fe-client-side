// src/utils/validation/dateArrayValidation.ts

import { ImportantDateInput } from '@/src/models/send/addConference.send';
import { TranslationFunction, DateError, DateValidationResult } from './types';

/**
 * Kiểm tra toàn bộ mảng `dates` và trả về một mảng các object lỗi và một lỗi toàn cục.
 * @param dates - Mảng các ngày quan trọng.
 * @param t - Hàm translation.
 * @returns Một object chứa mảng lỗi cho từng ngày và một chuỗi lỗi toàn cục.
 */
export const validateDatesArray = (
  dates: ImportantDateInput[],
  t: TranslationFunction
): DateValidationResult => {
  const dateErrors: DateError[] = Array(dates.length).fill(null).map(() => ({}));
  let globalDateError: string | null = null;

  const seenPairs = new Set<string>();

  const findDate = (type: string) => {
    const index = dates.findIndex(d => d.type === type);
    return index !== -1 ? { ...dates[index], index } : null;
  };

  // --- Giai đoạn 1: Validation cho từng ngày riêng lẻ ---
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  sevenDaysFromNow.setHours(0, 0, 0, 0);

  dates.forEach((date, index) => {
    const errorsForThisDate: DateError = {};

    if (index > 0) {
      if (!date.name?.trim()) {
        errorsForThisDate.name = t('Please_provide_a_name_for_date_entry', { number: index + 1 });
      }
      if (!date.type) {
        errorsForThisDate.type = t('Please_select_a_type_for_date_entry', { name: date.name || `entry ${index + 1}` });
      }
    }

    if (date.type && date.name?.trim()) {
      const pairKey = `${date.type}:${date.name.trim().toLowerCase()}`;
      if (seenPairs.has(pairKey)) {
        if (!errorsForThisDate.name) {
          errorsForThisDate.name = t('Duplicate_date_name_and_type');
        }
      } else {
        seenPairs.add(pairKey);
      }
    }

    if (!date.fromDate) {
      errorsForThisDate.fromDate = t('Please_provide_a_start_date_for', { name: date.name || t('this_entry') });
    } else {
      const fromDate = new Date(date.fromDate);
      if (fromDate < sevenDaysFromNow) {
        errorsForThisDate.fromDate = t('Date_must_be_at_least_7_days_from_now', { name: date.name || t('this_entry') });
      }
    }

    if (!date.toDate) {
      errorsForThisDate.toDate = t('Please_provide_an_end_date_for', { name: date.name || t('this_entry') });
    }
    if (date.fromDate && date.toDate && new Date(date.toDate) < new Date(date.fromDate)) {
      errorsForThisDate.toDate = t('End_date_cannot_be_before_start_date_for', { name: date.name || t('this_entry') });
    }

    dateErrors[index] = { ...dateErrors[index], ...errorsForThisDate };
  });

  // --- Giai đoạn 2: Validation các ràng buộc chéo giữa các ngày ---
  const requiredTypes = ['submissionDate', 'notificationDate', 'cameraReadyDate'];
  const missingTypes = requiredTypes.filter(type => !dates.some(d => d.type === type));

  if (missingTypes.length > 0) {
    const missingTypeNames = missingTypes.map(type => t(type)).join(', ');
    globalDateError = t('Please_add_the_following_required_dates', { types: missingTypeNames });
    return { dateErrors, globalDateError };
  }

  const submissionDate = findDate('submissionDate');
  const notificationDate = findDate('notificationDate');
  const cameraReadyDate = findDate('cameraReadyDate');
  const conferenceDates = findDate('conferenceDates');
  const registrationDate = findDate('registrationDate');
  const otherDates = dates.map((d, i) => ({ ...d, index: i })).filter(d => d.type === 'otherDate');

  if (conferenceDates?.fromDate && cameraReadyDate?.toDate && new Date(cameraReadyDate.toDate) >= new Date(conferenceDates.fromDate)) {
    dateErrors[cameraReadyDate.index].toDate = t('Camera_Ready_Date_must_be_before_Conference_Start_Date');
  }
  if (cameraReadyDate?.fromDate && notificationDate?.toDate && new Date(notificationDate.toDate) >= new Date(cameraReadyDate.fromDate)) {
    dateErrors[notificationDate.index].toDate = t('Notification_Date_must_be_before_Camera_Ready_Date');
  }
  if (notificationDate?.fromDate && submissionDate?.toDate && new Date(submissionDate.toDate) >= new Date(notificationDate.fromDate)) {
    dateErrors[submissionDate.index].toDate = t('Submission_Date_must_be_before_Notification_Date');
  }
  if (registrationDate?.toDate && conferenceDates?.fromDate && new Date(registrationDate.toDate) >= new Date(conferenceDates.fromDate)) {
    dateErrors[registrationDate.index].toDate = t('Registration_Date_must_be_before_Conference_Start_Date');
  }
  otherDates.forEach(otherDate => {
    if (otherDate.toDate && conferenceDates?.toDate && new Date(otherDate.toDate) >= new Date(conferenceDates.toDate)) {
      dateErrors[otherDate.index].toDate = t('Other_Date_must_be_before_Conference_End_Date', { name: otherDate.name });
    }
  });

  return { dateErrors, globalDateError };
};