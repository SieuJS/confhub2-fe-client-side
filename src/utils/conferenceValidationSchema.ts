// src/utils/conferenceValidationSchema.ts

import { ConferenceFormData, ImportantDateInput } from '@/src/models/send/addConference.send';

// Định nghĩa kiểu cho hàm translation để tránh lỗi import vòng tròn
type TranslationFunction = (key: string, values?: Record<string, any>) => string;

// --- Phần 1: Schema cho các trường đơn lẻ ---

/**
 * Định nghĩa kiểu cho một quy tắc validation.
 * @param value - Giá trị của trường đang được kiểm tra.
 * @param allValues - Toàn bộ dữ liệu của form, dùng cho các ràng buộc chéo.
 * @param t - Hàm translation.
 * @returns Chuỗi lỗi nếu không hợp lệ, hoặc `null` nếu hợp lệ.
 */
type ValidationRule = (
  value: any,
  allValues: Partial<ConferenceFormData>,
  t: TranslationFunction
) => string | null;

/**
 * Sơ đồ validation cho các trường trong form.
 * Mỗi key là tên của một trường (hỗ trợ dot-notation cho object lồng nhau).
 * Mỗi value là một mảng các quy tắc (ValidationRule) cho trường đó.
 */
export const validationSchema: Record<string, ValidationRule[]> = {
  title: [
    (value, _, t) => (!value?.trim() ? t('Please_enter_the_conference_name') : null),
    (value, allValues, t) =>
    (value?.trim().toLowerCase() === allValues.acronym?.trim().toLowerCase()
      ? t('Title_and_Acronym_cannot_be_the_same')
      : null),
  ],
  acronym: [
    (value, _, t) => (!value?.trim() ? t('Please_enter_the_acronym') : null),
    (value, allValues, t) =>
    (value?.trim().toLowerCase() === allValues.title?.trim().toLowerCase()
      ? t('Title_and_Acronym_cannot_be_the_same')
      : null),
  ],
  link: [
    (value, _, t) => (!value?.trim() ? t('Please_enter_a_valid_link') : null),
    (value, _, t) =>
    (value && !value.startsWith('http://') && !value.startsWith('https://')
      ? t('Please_enter_a_valid_link_starting_with_http_or_https')
      : null),
  ],
  type: [
    (value, _, t) => (!value ? t('Please_select_the_conference_type') : null),
  ],
  'location.address': [
    (value, allValues, t) =>
    ((allValues.type === 'Offline' || allValues.type === 'Hybrid') && !value?.trim()
      ? t('Please_enter_the_address')
      : null),
  ],
  'location.continent': [
    (value, allValues, t) =>
    ((allValues.type === 'Offline' || allValues.type === 'Hybrid') && !value
      ? t('Please_select_the_continent')
      : null),
  ],
  'location.country': [
    (value, allValues, t) =>
    ((allValues.type === 'Offline' || allValues.type === 'Hybrid') && !value
      ? t('Please_select_the_country')
      : null),
  ],


   // *** CẬP NHẬT RULE CHO DESCRIPTION ***
  description: [
    // Rule 1: Bắt buộc
    (value, _, t) => 
      !value?.trim() 
        ? t('Please_enter_the_Call_for_Papers') 
        : null,
    // Rule 2: Tối thiểu 100 ký tự
    (value, _, t) => 
      (value && value.trim().length < 100) 
        ? t('Call_for_Papers_must_be_at_least_characters', { count: 100 }) 
        : null,
    // Rule 3: Tối đa 10000 ký tự (đã có)
    (value, _, t) =>
      (value && value.length > 10000
        ? t('Call_for_papers_cannot_exceed_characters', { count: 10000 })
        : null),
  ]
};



// --- Phần 2: Hàm validation chuyên dụng cho mảng `dates` ---

/**
 * Định nghĩa cấu trúc của một object lỗi cho một mục ngày.
 */
export type DateError = {
  name?: string | null;
  type?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
};

/**
 * Định nghĩa cấu trúc trả về của hàm validateDatesArray.
 */
export type DateValidationResult = {
  dateErrors: DateError[];
  globalDateError: string | null;
};

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

  // --- Helper function để tìm ngày theo type ---
  const findDate = (type: string) => {
    const index = dates.findIndex(d => d.type === type);
    return index !== -1 ? { ...dates[index], index } : null;
  };

  // --- Giai đoạn 1: Validation cho từng ngày riêng lẻ ---

  // Tạo một hằng số cho ngày giới hạn để tối ưu hóa
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  sevenDaysFromNow.setHours(0, 0, 0, 0);



  dates.forEach((date, index) => {
    const errorsForThisDate: DateError = {};

    // Validate Name/Type cho các ngày không phải Conference Dates
    if (index > 0) {
      if (!date.name?.trim()) {
        errorsForThisDate.name = t('Please_provide_a_name_for_date_entry', { number: index + 1 });
      }
      if (!date.type) {
        errorsForThisDate.type = t('Please_select_a_type_for_date_entry', { name: date.name || `entry ${index + 1}` });
      }
    }

    // Validate From/To Date
    if (!date.fromDate) {
      errorsForThisDate.fromDate = t('Please_provide_a_start_date_for', { name: date.name || t('this_entry') });
    } else {
      // *** THAY ĐỔI TẠI ĐÂY: ÁP DỤNG QUY TẮC 7 NGÀY CHO TẤT CẢ CÁC NGÀY ***
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


    dateErrors[index] = errorsForThisDate;
  });

  // --- Giai đoạn 2: Validation các ràng buộc chéo giữa các ngày ---

  // Ràng buộc 1: Bắt buộc có đủ các loại ngày quan trọng
  const requiredTypes = ['submissionDate', 'notificationDate', 'cameraReadyDate'];
  const missingTypes = requiredTypes.filter(type => !dates.some(d => d.type === type));

  if (missingTypes.length > 0) {
    const missingTypeNames = missingTypes.map(type => t(type)).join(', ');
    globalDateError = t('Please_add_the_following_required_dates', { types: missingTypeNames });
    // Trả về sớm vì các ràng buộc sau sẽ không thực hiện được
    return { dateErrors, globalDateError };
  }

  // Lấy thông tin các ngày quan trọng để so sánh
  const submissionDate = findDate('submissionDate');
  const notificationDate = findDate('notificationDate');
  const cameraReadyDate = findDate('cameraReadyDate');
  const conferenceDates = findDate('conferenceDates');
  const registrationDate = findDate('registrationDate');
  const otherDates = dates.map((d, i) => ({ ...d, index: i })).filter(d => d.type === 'otherDate');

    // Ràng buộc 2: Thứ tự các ngày
  // Conference Start Date > Camera Ready Date
  // Logic đúng: Conference From Date phải SAU Camera Ready To Date
  if (conferenceDates?.fromDate && cameraReadyDate?.toDate && new Date(cameraReadyDate.toDate) >= new Date(conferenceDates.fromDate)) {
    dateErrors[cameraReadyDate.index].toDate = t('Camera_Ready_Date_must_be_before_Conference_Start_Date');
  }
  // Camera Ready Date > Notification Date
  // Logic đúng: Camera Ready From Date phải SAU Notification To Date
  // Hoặc mạnh hơn: Toàn bộ Camera Ready Date phải sau toàn bộ Notification Date
  if (cameraReadyDate?.fromDate && notificationDate?.toDate && new Date(notificationDate.toDate) >= new Date(cameraReadyDate.fromDate)) {
    // Điều kiện này sẽ báo lỗi vì 17/06/2025 (Notification To) >= 16/06/2025 (Camera Ready From)
    dateErrors[notificationDate.index].toDate = t('Notification_Date_must_be_before_Camera_Ready_Date');
    // Hoặc bạn có thể thêm lỗi vào trường toDate của Camera Ready Date nếu muốn rõ hơn
    // dateErrors[cameraReadyDate.index].fromDate = t('Camera_Ready_Date_must_start_after_Notification_End_Date');
  }
  // Notification Date > Submission Date
  // Logic đúng: Notification From Date phải SAU Submission To Date
  if (notificationDate?.fromDate && submissionDate?.toDate && new Date(submissionDate.toDate) >= new Date(notificationDate.fromDate)) {
    dateErrors[submissionDate.index].toDate = t('Submission_Date_must_be_before_Notification_Date');
  }

  // Ràng buộc 3: Registration Date
  // Logic đúng: Registration To Date phải TRƯỚC Conference From Date
  if (registrationDate?.toDate && conferenceDates?.fromDate && new Date(registrationDate.toDate) >= new Date(conferenceDates.fromDate)) {
    dateErrors[registrationDate.index].toDate = t('Registration_Date_must_be_before_Conference_Start_Date');
  }

  // Ràng buộc 4: Other Date
  // Logic đúng: Other Date To Date phải TRƯỚC Conference To Date
  otherDates.forEach(otherDate => {
    if (otherDate.toDate && conferenceDates?.toDate && new Date(otherDate.toDate) >= new Date(conferenceDates.toDate)) {
      dateErrors[otherDate.index].toDate = t('Other_Date_must_be_before_Conference_End_Date', { name: otherDate.name });
    }
  });


  return { dateErrors, globalDateError };
};



// --- Phần 3: Hàm Helper để chạy validation ---

/**
 * Một hàm helper để chạy validation cho một trường cụ thể dựa trên schema.
 * @param fieldName - Tên trường (e.g., 'title', 'location.address').
 * @param allValues - Toàn bộ dữ liệu của form.
 * @param t - Hàm translation.
 * @returns Chuỗi lỗi đầu tiên tìm thấy, hoặc null.
 */
export const validateField = (
  fieldName: string,
  allValues: Partial<ConferenceFormData>,
  t: TranslationFunction
): string | null => {
  const rules = validationSchema[fieldName];
  if (!rules) {
    return null;
  }

  // Lấy giá trị của trường, hỗ trợ cả nested object như 'location.address'
  const value = fieldName.split('.').reduce((o: any, i) => o?.[i], allValues);

  for (const rule of rules) {
    const errorMessage = rule(value, allValues, t);
    if (errorMessage) {
      return errorMessage; // Trả về lỗi đầu tiên tìm thấy
    }
  }

  return null; // Hợp lệ
};