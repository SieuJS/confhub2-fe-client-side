// src/utils/validation/types.ts

import { ConferenceFormData, ImportantDateInput } from '@/src/models/send/addConference.send';

/**
 * Định nghĩa kiểu cho hàm translation.
 */
export type TranslationFunction = (key: string, values?: Record<string, any>) => string;

/**
 * Định nghĩa kiểu cho một quy tắc validation cho các trường đơn lẻ.
 * @param value - Giá trị của trường đang được kiểm tra.
 * @param allValues - Toàn bộ dữ liệu của form.
 * @param t - Hàm translation.
 * @returns Chuỗi lỗi nếu không hợp lệ, hoặc `null` nếu hợp lệ.
 */
export type ValidationRule = (
  value: any,
  allValues: Partial<ConferenceFormData>,
  t: TranslationFunction
) => string | null;

/**
 * Định nghĩa cấu trúc của một object lỗi cho một mục ngày trong mảng `dates`.
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